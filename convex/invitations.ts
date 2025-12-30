import { v } from "convex/values";
import { query } from "./_generated/server";
import { authMutation } from "./lib/auth";

/**
 * トークンで招待情報を取得（認証不要）
 * 未ログインでもグループ情報を表示するため
 */
export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // 1. トークンで招待情報取得
    const invitation = await ctx.db
      .query("groupInvitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!invitation) {
      return { error: "invalid_token" as const };
    }

    // 2. 有効期限チェック
    if (invitation.expiresAt < Date.now()) {
      return { error: "expired" as const };
    }

    // 3. 使用済みチェック
    if (invitation.usedAt) {
      return { error: "already_used" as const };
    }

    // 4. グループ情報取得
    const group = await ctx.db.get(invitation.groupId);
    if (!group) {
      return { error: "invalid_token" as const };
    }

    const inviter = await ctx.db.get(invitation.createdBy);
    const memberCount = (
      await ctx.db
        .query("groupMembers")
        .withIndex("by_group_and_user", (q) =>
          q.eq("groupId", invitation.groupId),
        )
        .collect()
    ).length;

    return {
      invitation: {
        groupId: invitation.groupId,
        groupName: group.name,
        inviterName: inviter?.displayName ?? "不明なユーザー",
        memberCount,
        expiresAt: invitation.expiresAt,
      },
    };
  },
});

/**
 * 招待を受け入れてグループに参加
 */
export const accept = authMutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // 1. トークン検証（再度）
    const invitation = await ctx.db
      .query("groupInvitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!invitation) {
      throw new Error("無効な招待リンクです");
    }

    if (invitation.expiresAt < Date.now()) {
      throw new Error("招待リンクの有効期限が切れています");
    }

    if (invitation.usedAt) {
      throw new Error("この招待リンクは既に使用されています");
    }

    // 2. 既にメンバーかチェック
    const existingMember = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", invitation.groupId).eq("userId", ctx.user._id),
      )
      .unique();

    if (existingMember) {
      return { alreadyMember: true, groupId: invitation.groupId };
    }

    // 3. メンバー追加
    await ctx.db.insert("groupMembers", {
      groupId: invitation.groupId,
      userId: ctx.user._id,
      role: "member",
      joinedAt: Date.now(),
    });

    // 4. 招待を使用済みに更新
    await ctx.db.patch(invitation._id, {
      usedAt: Date.now(),
      usedBy: ctx.user._id,
    });

    return { success: true, groupId: invitation.groupId };
  },
});
