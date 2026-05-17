import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";

const modules = import.meta.glob<Record<string, unknown>>("../**/*.ts");

// テスト用のユーザー認証情報
const ownerIdentity = {
  subject: "test_owner_user",
  name: "グループオーナー",
  email: "owner@example.com",
};

const inviteeIdentity = {
  subject: "test_invitee_user",
  name: "招待されたユーザー",
  email: "invitee@example.com",
};

describe("invitations", () => {
  describe("getByToken", () => {
    test("有効なトークンでグループ情報を取得できる", async () => {
      const t = convexTest(schema, modules);

      const groupId = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.create, {
          name: "テストグループ",
        });

      const { token } = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.createInvitation, { groupId });

      const result = await t.query(api.invitations.getByToken, { token });

      expect(result).not.toHaveProperty("error");
      expect(result).toHaveProperty("invitation");
      if ("invitation" in result && result.invitation) {
        expect(result.invitation.groupId).toBe(groupId);
        expect(result.invitation.groupName).toBe("テストグループ");
        expect(result.invitation.inviterName).toBe("グループオーナー");
        expect(result.invitation.memberCount).toBe(1);
      }
    });

    test("無効なトークンではエラーを返す", async () => {
      const t = convexTest(schema, modules);

      const result = await t.query(api.invitations.getByToken, {
        token: "invalid-token",
      });

      expect(result).toHaveProperty("error", "invalid_token");
    });

    test("期限切れトークンではエラーを返す", async () => {
      const t = convexTest(schema, modules);

      const groupId = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.create, {
          name: "テストグループ",
        });

      const { token } = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.createInvitation, { groupId });

      await t.run(async (ctx) => {
        const invitation = await ctx.db
          .query("groupInvitations")
          .withIndex("by_token", (q) => q.eq("token", token))
          .unique();
        if (invitation) {
          await ctx.db.patch(invitation._id, {
            expiresAt: Date.now() - 1000, // 過去に設定
          });
        }
      });

      const result = await t.query(api.invitations.getByToken, { token });

      expect(result).toHaveProperty("error", "expired");
    });

    test("使用済みトークンではエラーを返す", async () => {
      const t = convexTest(schema, modules);

      const groupId = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.create, {
          name: "テストグループ",
        });

      const { token } = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.createInvitation, { groupId });

      await t.run(async (ctx) => {
        const invitation = await ctx.db
          .query("groupInvitations")
          .withIndex("by_token", (q) => q.eq("token", token))
          .unique();
        if (invitation) {
          const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) =>
              q.eq("clerkId", ownerIdentity.subject),
            )
            .unique();
          await ctx.db.patch(invitation._id, {
            usedAt: Date.now(),
            usedBy: user!._id,
          });
        }
      });

      const result = await t.query(api.invitations.getByToken, { token });

      expect(result).toHaveProperty("error", "already_used");
    });
  });

  describe("accept", () => {
    test("招待を受け入れてグループに参加できる", async () => {
      const t = convexTest(schema, modules);

      const groupId = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.create, {
          name: "テストグループ",
        });

      const { token } = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.createInvitation, { groupId });

      const result = await t
        .withIdentity(inviteeIdentity)
        .mutation(api.invitations.accept, { token });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("groupId", groupId);

      const invitee = await t.run(async (ctx) => {
        return await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) =>
            q.eq("clerkId", inviteeIdentity.subject),
          )
          .unique();
      });

      const membership = await t.run(async (ctx) => {
        return await ctx.db
          .query("groupMembers")
          .withIndex("by_group_and_user", (q) =>
            q.eq("groupId", groupId).eq("userId", invitee!._id),
          )
          .unique();
      });

      expect(membership).not.toBeNull();
      expect(membership?.role).toBe("member");
    });

    test("招待を受け入れるとトークンが使用済みになる", async () => {
      const t = convexTest(schema, modules);

      const groupId = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.create, {
          name: "テストグループ",
        });

      const { token } = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.createInvitation, { groupId });

      await t
        .withIdentity(inviteeIdentity)
        .mutation(api.invitations.accept, { token });

      const invitation = await t.run(async (ctx) => {
        return await ctx.db
          .query("groupInvitations")
          .withIndex("by_token", (q) => q.eq("token", token))
          .unique();
      });

      expect(invitation?.usedAt).toBeDefined();
      expect(invitation?.usedBy).toBeDefined();
    });

    test("既にメンバーの場合は alreadyMember を返す", async () => {
      const t = convexTest(schema, modules);

      const groupId = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.create, {
          name: "テストグループ",
        });

      const { token } = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.createInvitation, { groupId });

      const result = await t
        .withIdentity(ownerIdentity)
        .mutation(api.invitations.accept, { token });

      expect(result).toHaveProperty("alreadyMember", true);
      expect(result).toHaveProperty("groupId", groupId);
    });

    test("無効なトークンではエラーになる", async () => {
      const t = convexTest(schema, modules);

      await expect(
        t
          .withIdentity(inviteeIdentity)
          .mutation(api.invitations.accept, { token: "invalid-token" }),
      ).rejects.toThrow("無効な招待リンクです");
    });

    test("期限切れトークンではエラーになる", async () => {
      const t = convexTest(schema, modules);

      const groupId = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.create, {
          name: "テストグループ",
        });

      const { token } = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.createInvitation, { groupId });

      await t.run(async (ctx) => {
        const invitation = await ctx.db
          .query("groupInvitations")
          .withIndex("by_token", (q) => q.eq("token", token))
          .unique();
        if (invitation) {
          await ctx.db.patch(invitation._id, {
            expiresAt: Date.now() - 1000,
          });
        }
      });

      await expect(
        t
          .withIdentity(inviteeIdentity)
          .mutation(api.invitations.accept, { token }),
      ).rejects.toThrow("招待リンクの有効期限が切れています");
    });

    test("使用済みトークンではエラーになる", async () => {
      const t = convexTest(schema, modules);

      const groupId = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.create, {
          name: "テストグループ",
        });

      const { token } = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.createInvitation, { groupId });

      await t
        .withIdentity(inviteeIdentity)
        .mutation(api.invitations.accept, { token });

      const secondInvitee = {
        subject: "second_invitee",
        name: "2人目の招待者",
        email: "second@example.com",
      };

      await expect(
        t
          .withIdentity(secondInvitee)
          .mutation(api.invitations.accept, { token }),
      ).rejects.toThrow("この招待リンクは既に使用されています");
    });

    test("認証なしではエラーになる", async () => {
      const t = convexTest(schema, modules);

      const groupId = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.create, {
          name: "テストグループ",
        });

      const { token } = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.createInvitation, { groupId });

      await expect(
        t.mutation(api.invitations.accept, { token }),
      ).rejects.toThrow();
    });
  });

  describe("accept – invite reward (Premium trial 付与)", () => {
    const TRIAL_MS = 30 * 24 * 60 * 60 * 1000;

    test("招待 accept 時に招待主・被招待者の双方へ trial が付与される", async () => {
      const t = convexTest(schema, modules);

      const groupId = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.create, {
          name: "テストグループ",
        });

      const { token } = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.createInvitation, { groupId });

      const before = Date.now();
      const result = await t
        .withIdentity(inviteeIdentity)
        .mutation(api.invitations.accept, { token });
      const after = Date.now();

      expect(result).toHaveProperty("inviterRewardGranted", true);
      expect(result).toHaveProperty("inviteeRewardGranted", true);

      const { inviter, invitee, rewards } = await t.run(async (ctx) => {
        const inviter = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) =>
            q.eq("clerkId", ownerIdentity.subject),
          )
          .unique();
        const invitee = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) =>
            q.eq("clerkId", inviteeIdentity.subject),
          )
          .unique();
        const rewards = await ctx.db.query("inviteRewards").collect();
        return { inviter, invitee, rewards };
      });

      expect(inviter?.trialExpiresAt).toBeDefined();
      expect(invitee?.trialExpiresAt).toBeDefined();
      expect(inviter!.trialExpiresAt!).toBeGreaterThanOrEqual(
        before + TRIAL_MS,
      );
      expect(inviter!.trialExpiresAt!).toBeLessThanOrEqual(after + TRIAL_MS);

      expect(rewards).toHaveLength(2);
      const reasons = rewards.map((r) => r.reason).sort();
      expect(reasons).toEqual(["invitee", "inviter"]);
    });

    test("既存 active Premium ユーザーには trial が付与されない", async () => {
      const t = convexTest(schema, modules);

      const groupId = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.create, {
          name: "テストグループ",
        });

      const { token } = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.createInvitation, { groupId });

      // 招待主に既存 Premium subscription を仕込む
      await t.run(async (ctx) => {
        const owner = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) =>
            q.eq("clerkId", ownerIdentity.subject),
          )
          .unique();
        if (!owner) throw new Error("owner not found");
        await ctx.db.insert("subscriptions", {
          userId: owner._id,
          stripeCustomerId: "cus_test_owner",
          stripeSubscriptionId: "sub_test_owner",
          plan: "premium",
          status: "active",
          currentPeriodStart: Date.now(),
          currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
          cancelAtPeriodEnd: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      const result = await t
        .withIdentity(inviteeIdentity)
        .mutation(api.invitations.accept, { token });

      expect(result).toHaveProperty("inviterRewardGranted", false);
      expect(result).toHaveProperty("inviteeRewardGranted", true);

      const { inviter } = await t.run(async (ctx) => {
        const inviter = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) =>
            q.eq("clerkId", ownerIdentity.subject),
          )
          .unique();
        return { inviter };
      });

      expect(inviter?.trialExpiresAt).toBeUndefined();
    });

    test("既存 trial 期間中に再度付与されると期限が30日加算される", async () => {
      const t = convexTest(schema, modules);

      // 1回目: グループ作成 + 招待 accept で 30日 trial 取得
      const firstGroupId = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.create, {
          name: "1つ目",
        });

      const firstInvite = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.createInvitation, { groupId: firstGroupId });

      await t
        .withIdentity(inviteeIdentity)
        .mutation(api.invitations.accept, { token: firstInvite.token });

      const ownerAfterFirst = await t.run(async (ctx) => {
        return await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) =>
            q.eq("clerkId", ownerIdentity.subject),
          )
          .unique();
      });
      const firstExpiresAt = ownerAfterFirst!.trialExpiresAt!;
      expect(firstExpiresAt).toBeDefined();

      // 2回目: 別グループで2人目招待 → さらに 30日加算されるはず
      const secondGroupId = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.create, {
          name: "2つ目",
        });

      const secondInvite = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.createInvitation, { groupId: secondGroupId });

      const secondInviteeIdentity = {
        subject: "second_invitee_user",
        name: "2人目",
        email: "second@example.com",
      };

      await t
        .withIdentity(secondInviteeIdentity)
        .mutation(api.invitations.accept, { token: secondInvite.token });

      const ownerAfterSecond = await t.run(async (ctx) => {
        return await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) =>
            q.eq("clerkId", ownerIdentity.subject),
          )
          .unique();
      });

      expect(ownerAfterSecond!.trialExpiresAt!).toBe(firstExpiresAt + TRIAL_MS);
    });

    test("canceled 期間内ユーザーには trial が付与される（active 課金者と区別）", async () => {
      // grantInviteReward のスキップ条件は active|trialing のみ。canceled で currentPeriodEnd 内の
      // ユーザーは「Stripe 上は Premium を期間終了まで使える状態」だが、本実装では trial を付与する仕様。
      const t = convexTest(schema, modules);

      const groupId = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.create, {
          name: "テストグループ",
        });

      const { token } = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.createInvitation, { groupId });

      await t.run(async (ctx) => {
        const owner = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) =>
            q.eq("clerkId", ownerIdentity.subject),
          )
          .unique();
        if (!owner) throw new Error("owner not found");
        await ctx.db.insert("subscriptions", {
          userId: owner._id,
          stripeCustomerId: "cus_canceled_test",
          stripeSubscriptionId: "sub_canceled_test",
          plan: "premium",
          status: "canceled",
          currentPeriodStart: Date.now() - 10 * 24 * 60 * 60 * 1000,
          currentPeriodEnd: Date.now() + 20 * 24 * 60 * 60 * 1000,
          cancelAtPeriodEnd: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      const result = await t
        .withIdentity(inviteeIdentity)
        .mutation(api.invitations.accept, { token });

      expect(result).toHaveProperty("inviterRewardGranted", true);
      expect(result).toHaveProperty("inviteeRewardGranted", true);
    });

    test("grantInviteReward を同じ招待×同じユーザーで二度呼んでも重複付与されない", async () => {
      // accept は usedAt で1回しか呼べないため、ヘルパー直接呼び出しで二重呼び出しを検証する。
      const t = convexTest(schema, modules);
      const { grantInviteReward } = await import("../lib/inviteReward");

      const groupId = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.create, {
          name: "テストグループ",
        });

      const { token } = await t
        .withIdentity(ownerIdentity)
        .mutation(api.groups.createInvitation, { groupId });

      const { invitationId, inviteeUserId } = await t.run(async (ctx) => {
        const invitation = await ctx.db
          .query("groupInvitations")
          .withIndex("by_token", (q) => q.eq("token", token))
          .unique();
        // 別ユーザーを作って受け取り先にする
        const now = Date.now();
        const inviteeUserId = await ctx.db.insert("users", {
          clerkId: "duplicate_test_invitee",
          displayName: "重複テスト",
          createdAt: now,
          updatedAt: now,
        });
        return { invitationId: invitation!._id, inviteeUserId };
      });

      const first = await t.run(async (ctx) => {
        return await grantInviteReward(ctx, {
          userId: inviteeUserId,
          invitationId,
          reason: "invitee",
        });
      });
      expect(first.granted).toBe(true);

      const second = await t.run(async (ctx) => {
        return await grantInviteReward(ctx, {
          userId: inviteeUserId,
          invitationId,
          reason: "invitee",
        });
      });
      expect(second.granted).toBe(false);
      if (!second.granted) {
        expect(second.reason).toBe("duplicate");
      }

      const rewards = await t.run(async (ctx) => {
        return await ctx.db.query("inviteRewards").collect();
      });
      expect(rewards).toHaveLength(1);
    });
  });
});
