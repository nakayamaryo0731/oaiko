import { convexTest, TestConvex } from "convex-test";
import { describe, expect, test } from "vitest";
import schema from "../schema";
import { api, internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { getTodayJst } from "../recurringExpenses";

const modules = import.meta.glob<Record<string, unknown>>("../**/*.ts");

type TestCtx = TestConvex<typeof schema>;

const CLERK_USER = "recurring_test_user";
const CLERK_PARTNER = "recurring_test_partner";

async function setup(t: TestCtx, opts: { premium?: boolean } = {}) {
  const { premium = true } = opts;
  const now = Date.now();

  return await t.run(async (ctx) => {
    const userId = await ctx.db.insert("users", {
      clerkId: CLERK_USER,
      displayName: "ユーザー",
      createdAt: now,
      updatedAt: now,
    });
    const partnerId = await ctx.db.insert("users", {
      clerkId: CLERK_PARTNER,
      displayName: "パートナー",
      createdAt: now,
      updatedAt: now,
    });
    const groupId = await ctx.db.insert("groups", {
      name: "テストグループ",
      closingDay: 25,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("groupMembers", {
      groupId,
      userId,
      role: "owner",
      joinedAt: now,
    });
    await ctx.db.insert("groupMembers", {
      groupId,
      userId: partnerId,
      role: "member",
      joinedAt: now,
    });
    const categoryId = await ctx.db.insert("categories", {
      groupId,
      name: "住居費",
      icon: "home",
      isPreset: true,
      sortOrder: 0,
      createdAt: now,
    });

    if (premium) {
      await ctx.db.insert("subscriptions", {
        userId,
        stripeCustomerId: "cus_recurring_test",
        stripeSubscriptionId: "sub_recurring_test",
        plan: "premium",
        status: "active",
        currentPeriodStart: now - 1000,
        currentPeriodEnd: now + 30 * 24 * 60 * 60 * 1000,
        cancelAtPeriodEnd: false,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { userId, partnerId, groupId, categoryId };
  });
}

function asUser(t: TestCtx) {
  return t.withIdentity({ subject: CLERK_USER });
}

async function insertTemplate(
  t: TestCtx,
  data: {
    groupId: Id<"groups">;
    categoryId: Id<"categories">;
    paidBy: Id<"users">;
    amountMode: "fixed" | "variable";
    amount?: number;
    dayOfMonth: number;
    splitDetails?:
      | { method: "equal"; memberIds?: Id<"users">[] }
      | { method: "ratio"; ratios: { userId: Id<"users">; ratio: number }[] }
      | { method: "full"; bearerId: Id<"users"> };
    pausedAt?: number;
    lastGeneratedMonth?: string;
    pendingMonth?: string;
  },
) {
  const now = Date.now();
  return await t.run(async (ctx) => {
    return await ctx.db.insert("recurringExpenses", {
      groupId: data.groupId,
      amount: data.amount,
      amountMode: data.amountMode,
      categoryId: data.categoryId,
      paidBy: data.paidBy,
      dayOfMonth: data.dayOfMonth,
      title: "家賃",
      splitDetails: data.splitDetails ?? { method: "equal" },
      pausedAt: data.pausedAt,
      lastGeneratedMonth: data.lastGeneratedMonth,
      pendingMonth: data.pendingMonth,
      createdBy: data.paidBy,
      createdAt: now,
      updatedAt: now,
    });
  });
}

// テスト用の実行日: 15日固定（YYYY-MM-15）
const TODAY = `${getTodayJst().slice(0, 7)}-15`;
const MONTH = TODAY.slice(0, 7);

describe("recurringExpenses", () => {
  describe("create", () => {
    test("Premiumグループで作成できる", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, userId } = await setup(t);

      const id = await asUser(t).mutation(api.recurringExpenses.create, {
        groupId,
        amount: 85000,
        amountMode: "fixed",
        categoryId,
        paidBy: userId,
        dayOfMonth: 25,
        title: "家賃",
        splitDetails: { method: "equal" },
      });

      expect(id).toBeDefined();
    });

    test("Freeグループでは作成できない", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, userId } = await setup(t, {
        premium: false,
      });

      await expect(
        asUser(t).mutation(api.recurringExpenses.create, {
          groupId,
          amount: 85000,
          amountMode: "fixed",
          categoryId,
          paidBy: userId,
          dayOfMonth: 25,
          title: "家賃",
          splitDetails: { method: "equal" },
        }),
      ).rejects.toThrow(/Premium/);
    });

    test("実行日が範囲外 → エラー", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, userId } = await setup(t);

      await expect(
        asUser(t).mutation(api.recurringExpenses.create, {
          groupId,
          amount: 85000,
          amountMode: "fixed",
          categoryId,
          paidBy: userId,
          dayOfMonth: 29,
          title: "家賃",
          splitDetails: { method: "equal" },
        }),
      ).rejects.toThrow(/1〜28/);
    });

    test("固定モードで金額なし → エラー", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, userId } = await setup(t);

      await expect(
        asUser(t).mutation(api.recurringExpenses.create, {
          groupId,
          amountMode: "fixed",
          categoryId,
          paidBy: userId,
          dayOfMonth: 25,
          title: "家賃",
          splitDetails: { method: "equal" },
        }),
      ).rejects.toThrow(/金額/);
    });

    test("変動モードで金額指定分割 → エラー", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, userId, partnerId } = await setup(t);

      await expect(
        asUser(t).mutation(api.recurringExpenses.create, {
          groupId,
          amountMode: "variable",
          categoryId,
          paidBy: userId,
          dayOfMonth: 25,
          title: "電気代",
          splitDetails: {
            method: "amount",
            amounts: [
              { userId, amount: 500 },
              { userId: partnerId, amount: 500 },
            ],
          },
        }),
      ).rejects.toThrow(/変動モード/);
    });
  });

  describe("generateDue", () => {
    test("固定モード: 当日分の支出とsplitsを作成し、lastGeneratedMonthを更新", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, userId, partnerId } = await setup(t);
      const templateId = await insertTemplate(t, {
        groupId,
        categoryId,
        paidBy: userId,
        amountMode: "fixed",
        amount: 10000,
        dayOfMonth: 15,
      });

      await t.mutation(internal.recurringExpenses.generateDue, {
        todayOverride: TODAY,
      });

      const { expenses, splits, template } = await t.run(async (ctx) => {
        const expenses = await ctx.db.query("expenses").collect();
        const splits = await ctx.db.query("expenseSplits").collect();
        const template = await ctx.db.get(templateId);
        return { expenses, splits, template };
      });

      expect(expenses).toHaveLength(1);
      expect(expenses[0].amount).toBe(10000);
      expect(expenses[0].date).toBe(TODAY);
      expect(expenses[0].recurringExpenseId).toBe(templateId);
      expect(splits).toHaveLength(2);
      expect(splits.map((s) => s.userId).sort()).toEqual(
        [userId, partnerId].sort(),
      );
      expect(template?.lastGeneratedMonth).toBe(MONTH);
    });

    test("冪等性: 同月に2回実行しても支出は1件", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, userId } = await setup(t);
      await insertTemplate(t, {
        groupId,
        categoryId,
        paidBy: userId,
        amountMode: "fixed",
        amount: 10000,
        dayOfMonth: 15,
      });

      await t.mutation(internal.recurringExpenses.generateDue, {
        todayOverride: TODAY,
      });
      await t.mutation(internal.recurringExpenses.generateDue, {
        todayOverride: TODAY,
      });

      const expenses = await t.run(async (ctx) =>
        ctx.db.query("expenses").collect(),
      );
      expect(expenses).toHaveLength(1);
    });

    test("実行日でないテンプレートは生成されない", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, userId } = await setup(t);
      await insertTemplate(t, {
        groupId,
        categoryId,
        paidBy: userId,
        amountMode: "fixed",
        amount: 10000,
        dayOfMonth: 16,
      });

      await t.mutation(internal.recurringExpenses.generateDue, {
        todayOverride: TODAY,
      });

      const expenses = await t.run(async (ctx) =>
        ctx.db.query("expenses").collect(),
      );
      expect(expenses).toHaveLength(0);
    });

    test("一時停止中のテンプレートは生成されない", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, userId } = await setup(t);
      await insertTemplate(t, {
        groupId,
        categoryId,
        paidBy: userId,
        amountMode: "fixed",
        amount: 10000,
        dayOfMonth: 15,
        pausedAt: Date.now(),
      });

      await t.mutation(internal.recurringExpenses.generateDue, {
        todayOverride: TODAY,
      });

      const expenses = await t.run(async (ctx) =>
        ctx.db.query("expenses").collect(),
      );
      expect(expenses).toHaveLength(0);
    });

    test("Freeグループはスキップ（lastGeneratedMonthも更新しない）", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, userId } = await setup(t, {
        premium: false,
      });
      const templateId = await insertTemplate(t, {
        groupId,
        categoryId,
        paidBy: userId,
        amountMode: "fixed",
        amount: 10000,
        dayOfMonth: 15,
      });

      await t.mutation(internal.recurringExpenses.generateDue, {
        todayOverride: TODAY,
      });

      const { expenses, template } = await t.run(async (ctx) => ({
        expenses: await ctx.db.query("expenses").collect(),
        template: await ctx.db.get(templateId),
      }));
      expect(expenses).toHaveLength(0);
      expect(template?.lastGeneratedMonth).toBeUndefined();
    });

    test("変動モード: 支出は作らずpendingMonthを設定", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, userId } = await setup(t);
      const templateId = await insertTemplate(t, {
        groupId,
        categoryId,
        paidBy: userId,
        amountMode: "variable",
        amount: 8000,
        dayOfMonth: 15,
      });

      await t.mutation(internal.recurringExpenses.generateDue, {
        todayOverride: TODAY,
      });

      const { expenses, template } = await t.run(async (ctx) => ({
        expenses: await ctx.db.query("expenses").collect(),
        template: await ctx.db.get(templateId),
      }));
      expect(expenses).toHaveLength(0);
      expect(template?.pendingMonth).toBe(MONTH);
      expect(template?.lastGeneratedMonth).toBe(MONTH);
    });

    test("未確定の前月分pendingMonthは当月で上書きされる", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, userId } = await setup(t);
      const templateId = await insertTemplate(t, {
        groupId,
        categoryId,
        paidBy: userId,
        amountMode: "variable",
        dayOfMonth: 15,
        pendingMonth: "2020-01",
        lastGeneratedMonth: "2020-01",
      });

      await t.mutation(internal.recurringExpenses.generateDue, {
        todayOverride: TODAY,
      });

      const template = await t.run(async (ctx) => ctx.db.get(templateId));
      expect(template?.pendingMonth).toBe(MONTH);
    });

    test("splitDetailsが無効（脱退メンバー参照）→ 均等割にフォールバック", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, userId, partnerId } = await setup(t);
      await insertTemplate(t, {
        groupId,
        categoryId,
        paidBy: userId,
        amountMode: "fixed",
        amount: 10000,
        dayOfMonth: 15,
        splitDetails: {
          method: "ratio",
          ratios: [
            { userId, ratio: 60 },
            { userId: partnerId, ratio: 40 },
          ],
        },
      });

      // パートナーが脱退
      await t.run(async (ctx) => {
        const membership = await ctx.db
          .query("groupMembers")
          .withIndex("by_group_and_user", (q) =>
            q.eq("groupId", groupId).eq("userId", partnerId),
          )
          .unique();
        await ctx.db.delete(membership!._id);
      });

      await t.mutation(internal.recurringExpenses.generateDue, {
        todayOverride: TODAY,
      });

      const { expenses, splits } = await t.run(async (ctx) => ({
        expenses: await ctx.db.query("expenses").collect(),
        splits: await ctx.db.query("expenseSplits").collect(),
      }));
      expect(expenses).toHaveLength(1);
      expect(expenses[0].splitMethod).toBe("equal");
      expect(splits).toHaveLength(1);
      expect(splits[0].amount).toBe(10000);
    });

    test("支払者が脱退 → テンプレートを自動停止し生成しない", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, partnerId } = await setup(t);
      const templateId = await insertTemplate(t, {
        groupId,
        categoryId,
        paidBy: partnerId,
        amountMode: "fixed",
        amount: 10000,
        dayOfMonth: 15,
      });

      await t.run(async (ctx) => {
        const membership = await ctx.db
          .query("groupMembers")
          .withIndex("by_group_and_user", (q) =>
            q.eq("groupId", groupId).eq("userId", partnerId),
          )
          .unique();
        await ctx.db.delete(membership!._id);
      });

      await t.mutation(internal.recurringExpenses.generateDue, {
        todayOverride: TODAY,
      });

      const { expenses, template } = await t.run(async (ctx) => ({
        expenses: await ctx.db.query("expenses").collect(),
        template: await ctx.db.get(templateId),
      }));
      expect(expenses).toHaveLength(0);
      expect(template?.pausedAt).toBeDefined();
    });
  });

  describe("confirmPending", () => {
    test("金額を入力して確定 → 支出作成・pendingMonthクリア・金額を保持", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, userId } = await setup(t);
      const templateId = await insertTemplate(t, {
        groupId,
        categoryId,
        paidBy: userId,
        amountMode: "variable",
        dayOfMonth: 15,
        pendingMonth: MONTH,
      });

      const expenseId = await asUser(t).mutation(
        api.recurringExpenses.confirmPending,
        { recurringExpenseId: templateId, amount: 12345 },
      );

      const { expense, template } = await t.run(async (ctx) => ({
        expense: await ctx.db.get(expenseId),
        template: await ctx.db.get(templateId),
      }));
      expect(expense?.amount).toBe(12345);
      expect(expense?.date).toBe(`${MONTH}-15`);
      expect(expense?.recurringExpenseId).toBe(templateId);
      expect(template?.pendingMonth).toBeUndefined();
      expect(template?.amount).toBe(12345);
    });

    test("Freeグループ → エラー", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, userId } = await setup(t, {
        premium: false,
      });
      const templateId = await insertTemplate(t, {
        groupId,
        categoryId,
        paidBy: userId,
        amountMode: "variable",
        dayOfMonth: 15,
        pendingMonth: MONTH,
      });

      await expect(
        asUser(t).mutation(api.recurringExpenses.confirmPending, {
          recurringExpenseId: templateId,
          amount: 12345,
        }),
      ).rejects.toThrow(/Premium/);
    });

    test("支払者が脱退済み → エラー", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, partnerId } = await setup(t);
      const templateId = await insertTemplate(t, {
        groupId,
        categoryId,
        paidBy: partnerId,
        amountMode: "variable",
        dayOfMonth: 15,
        pendingMonth: MONTH,
      });

      await t.run(async (ctx) => {
        const membership = await ctx.db
          .query("groupMembers")
          .withIndex("by_group_and_user", (q) =>
            q.eq("groupId", groupId).eq("userId", partnerId),
          )
          .unique();
        await ctx.db.delete(membership!._id);
      });

      await expect(
        asUser(t).mutation(api.recurringExpenses.confirmPending, {
          recurringExpenseId: templateId,
          amount: 12345,
        }),
      ).rejects.toThrow(/支払者/);
    });

    test("確認待ちでないテンプレート → エラー", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, userId } = await setup(t);
      const templateId = await insertTemplate(t, {
        groupId,
        categoryId,
        paidBy: userId,
        amountMode: "variable",
        dayOfMonth: 15,
      });

      await expect(
        asUser(t).mutation(api.recurringExpenses.confirmPending, {
          recurringExpenseId: templateId,
          amount: 12345,
        }),
      ).rejects.toThrow(/確認待ち/);
    });
  });

  describe("skipPending", () => {
    test("pendingMonthをクリアし支出は作らない", async () => {
      const t = convexTest(schema, modules);
      const { groupId, categoryId, userId } = await setup(t);
      const templateId = await insertTemplate(t, {
        groupId,
        categoryId,
        paidBy: userId,
        amountMode: "variable",
        dayOfMonth: 15,
        pendingMonth: MONTH,
      });

      await asUser(t).mutation(api.recurringExpenses.skipPending, {
        recurringExpenseId: templateId,
      });

      const { expenses, template } = await t.run(async (ctx) => ({
        expenses: await ctx.db.query("expenses").collect(),
        template: await ctx.db.get(templateId),
      }));
      expect(expenses).toHaveLength(0);
      expect(template?.pendingMonth).toBeUndefined();
    });
  });
});
