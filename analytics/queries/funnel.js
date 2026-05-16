// Pairbo 招待ファネル分析クエリ
//
// 用途: Convex MCP の `runOneoffQuery` から実行する read-only クエリ。
// 出力は生データ寄り（成形はスキル側で行う）。
//
// 集計内容:
//   - グループ単位のファネル（作成 → 招待発行 → 2人到達）
//   - 1人グループの内訳（招待発行有無 / 支出有無 / 滞留期間）
//   - 2人到達グループの「相棒参加までの時間」分布
//   - 全体トータル

import { query } from "convex:/_system/repl/wrappers.js";

const DAY = 24 * 60 * 60 * 1000;

export default query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const groups = await ctx.db.query("groups").collect();
    const members = await ctx.db.query("groupMembers").collect();
    const invitations = await ctx.db.query("groupInvitations").collect();
    const expenses = await ctx.db.query("expenses").collect();

    const memberCountByGroup = {};
    for (const m of members) {
      memberCountByGroup[m.groupId] = (memberCountByGroup[m.groupId] || 0) + 1;
    }

    const inviteStatusByGroup = {};
    for (const g of groups) inviteStatusByGroup[g._id] = { issued: 0, used: 0 };
    for (const inv of invitations) {
      const s = inviteStatusByGroup[inv.groupId];
      if (!s) continue;
      s.issued++;
      if (inv.usedAt != null) s.used++;
    }

    const expenseCountByGroup = {};
    for (const e of expenses) {
      expenseCountByGroup[e.groupId] =
        (expenseCountByGroup[e.groupId] || 0) + 1;
    }

    const now = Date.now();

    let groupsWithInvite = 0;
    let groupsWith2Plus = 0;
    let soloWithoutInvite = 0;
    let soloWithUnusedInvite = 0;
    let soloAged = { d0to3: 0, d3to7: 0, d7to30: 0, d30plus: 0 };
    let soloWithExpense = 0;
    let soloZeroExpense = 0;
    let pairWithExpense = 0;
    let pairZeroExpense = 0;

    for (const g of groups) {
      const memberCount = memberCountByGroup[g._id] || 0;
      const inv = inviteStatusByGroup[g._id];
      if (inv.issued > 0) groupsWithInvite++;
      if (memberCount >= 2) groupsWith2Plus++;
      const ageDays = (now - g.createdAt) / DAY;
      const hasExpense = (expenseCountByGroup[g._id] || 0) > 0;
      if (memberCount <= 1) {
        if (inv.issued === 0) soloWithoutInvite++;
        else soloWithUnusedInvite++;
        if (hasExpense) soloWithExpense++;
        else soloZeroExpense++;
        if (ageDays < 3) soloAged.d0to3++;
        else if (ageDays < 7) soloAged.d3to7++;
        else if (ageDays < 30) soloAged.d7to30++;
        else soloAged.d30plus++;
      } else {
        if (hasExpense) pairWithExpense++;
        else pairZeroExpense++;
      }
    }

    const pairLags = [];
    for (const g of groups) {
      const memberCount = memberCountByGroup[g._id] || 0;
      if (memberCount < 2) continue;
      const ms = members
        .filter((m) => m.groupId === g._id)
        .map((m) => m.joinedAt)
        .sort((a, b) => a - b);
      if (ms.length >= 2) {
        pairLags.push((ms[1] - ms[0]) / DAY);
      }
    }
    pairLags.sort((a, b) => a - b);
    const pct = (arr, p) =>
      arr.length
        ? arr[Math.min(arr.length - 1, Math.floor(arr.length * p))]
        : null;

    const invitesIssued = invitations.length;
    const invitesUsed = invitations.filter((i) => i.usedAt != null).length;
    const invitesExpired = invitations.filter(
      (i) => i.usedAt == null && i.expiresAt < now,
    ).length;
    const invitesActive = invitations.filter(
      (i) => i.usedAt == null && i.expiresAt >= now,
    ).length;

    return {
      totals: {
        users: users.length,
        groups: groups.length,
        members: members.length,
        invitations: invitesIssued,
        expenses: expenses.length,
      },
      funnelByGroup: {
        groupsTotal: groups.length,
        groupsWithInvite,
        groupsWith2Plus,
        inviteEmitRate: groups.length ? groupsWithInvite / groups.length : 0,
        inviteToPairRate: groupsWithInvite
          ? groupsWith2Plus / groupsWithInvite
          : 0,
        overallPairRate: groups.length ? groupsWith2Plus / groups.length : 0,
      },
      soloBreakdown: {
        total: soloWithoutInvite + soloWithUnusedInvite,
        withoutInvite: soloWithoutInvite,
        withUnusedInvite: soloWithUnusedInvite,
        withExpense: soloWithExpense,
        zeroExpense: soloZeroExpense,
        agedDays: soloAged,
      },
      pairBreakdown: {
        total: pairWithExpense + pairZeroExpense,
        withExpense: pairWithExpense,
        zeroExpense: pairZeroExpense,
      },
      invitations: {
        issued: invitesIssued,
        used: invitesUsed,
        expired: invitesExpired,
        active: invitesActive,
        usedRate: invitesIssued ? invitesUsed / invitesIssued : 0,
      },
      pairTimeToJoinDays: {
        count: pairLags.length,
        p25: pct(pairLags, 0.25),
        median: pct(pairLags, 0.5),
        p75: pct(pairLags, 0.75),
        all: pairLags.map((d) => Math.round(d * 100) / 100),
      },
    };
  },
});
