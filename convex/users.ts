import { v, ConvexError } from "convex/values";
import { authMutation } from "./lib/auth";

const MAX_DISPLAY_NAME_LENGTH = 20;

/**
 * ユーザー初期化
 *
 * 初回ログイン時にユーザーを作成する。
 * authMutationMiddlewareが自動でユーザーを作成するため、
 * このmutationは単にユーザーIDを返すだけ。
 */
export const ensureUser = authMutation({
  args: {},
  handler: async (ctx) => {
    return ctx.user._id;
  },
});

/**
 * 表示名更新
 */
export const updateDisplayName = authMutation({
  args: {
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const trimmed = args.displayName.trim();

    if (trimmed.length === 0) {
      throw new ConvexError("表示名を入力してください");
    }

    if (trimmed.length > MAX_DISPLAY_NAME_LENGTH) {
      throw new ConvexError(
        `表示名は${MAX_DISPLAY_NAME_LENGTH}文字以内で入力してください`,
      );
    }

    await ctx.db.patch(ctx.user._id, {
      displayName: trimmed,
      updatedAt: Date.now(),
    });

    ctx.logger.info("USER", "display_name_updated", {
      userId: ctx.user._id,
      newDisplayName: trimmed,
    });
  },
});
