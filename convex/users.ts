import { authMutation } from "./lib/auth";

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
