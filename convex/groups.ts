import { v } from "convex/values";
import { authMutation, authQuery } from "./lib/auth";
import { PRESET_CATEGORIES } from "./lib/presetCategories";

/**
 * グループ作成
 *
 * 1. グループをDBに作成
 * 2. 作成者をオーナーとしてメンバーに追加
 * 3. プリセットカテゴリをコピー
 */
export const create = authMutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // 1. グループ作成
    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      description: args.description,
      closingDay: 25, // デフォルト値
      createdAt: now,
      updatedAt: now,
    });

    // 2. 作成者をオーナーとして追加
    await ctx.db.insert("groupMembers", {
      groupId,
      userId: ctx.user._id,
      role: "owner",
      joinedAt: now,
    });

    // 3. プリセットカテゴリをコピー
    for (const preset of PRESET_CATEGORIES) {
      await ctx.db.insert("categories", {
        groupId,
        name: preset.name,
        icon: preset.icon,
        isPreset: true,
        sortOrder: preset.sortOrder,
        createdAt: now,
      });
    }

    return groupId;
  },
});

/**
 * ユーザーの所属グループ一覧取得
 */
export const listMyGroups = authQuery({
  args: {},
  handler: async (ctx) => {
    // ユーザーのメンバーシップを取得
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .collect();

    // 各グループの情報を取得
    const groups = await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);
        if (!group) return null;

        // グループのメンバー数を取得
        const allMembers = await ctx.db
          .query("groupMembers")
          .withIndex("by_group_and_user", (q) =>
            q.eq("groupId", membership.groupId),
          )
          .collect();

        return {
          _id: group._id,
          name: group.name,
          description: group.description,
          closingDay: group.closingDay,
          memberCount: allMembers.length,
          myRole: membership.role,
          joinedAt: membership.joinedAt,
        };
      }),
    );

    // nullを除外し、参加日時の新しい順にソート
    return groups
      .filter((g): g is NonNullable<typeof g> => g !== null)
      .sort((a, b) => b.joinedAt - a.joinedAt);
  },
});
