import { v, ConvexError } from "convex/values";
import { authMutation } from "./lib/auth";
import { inquiryCategoryValidator } from "./lib/validators";

const RATE_LIMIT = {
  maxPerHour: 5,
  windowMs: 60 * 60 * 1000,
} as const;

const BODY_MAX_LENGTH = 2000;

export const create = authMutation({
  args: {
    category: inquiryCategoryValidator,
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const trimmedBody = args.body.trim();
    if (trimmedBody.length === 0) {
      throw new ConvexError("お問い合わせ内容を入力してください");
    }
    if (trimmedBody.length > BODY_MAX_LENGTH) {
      throw new ConvexError(
        `お問い合わせ内容は${BODY_MAX_LENGTH}文字以内で入力してください`,
      );
    }

    // レート制限
    const since = Date.now() - RATE_LIMIT.windowMs;
    const recentInquiries = await ctx.db
      .query("inquiries")
      .withIndex("by_user", (q) => q.eq("userId", ctx.user._id))
      .filter((q) => q.gte(q.field("createdAt"), since))
      .collect();

    if (recentInquiries.length >= RATE_LIMIT.maxPerHour) {
      throw new ConvexError(
        "送信回数の上限に達しました。しばらく経ってからお試しください",
      );
    }

    const inquiryId = await ctx.db.insert("inquiries", {
      userId: ctx.user._id,
      category: args.category,
      body: trimmedBody,
      createdAt: Date.now(),
    });

    ctx.logger.info("INQUIRY", "create", {
      inquiryId,
      category: args.category,
    });

    return inquiryId;
  },
});
