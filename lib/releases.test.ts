import { describe, expect, test } from "vitest";
import { getAutoOpenRelease, type ReleaseAudienceContext } from "./releases";

// テストは現状の releases[] にある 2026-05-17-trial-campaign（autoOpen=true,
// audience=non-paying, claim_trial CTA, expiresAt=2026-06-01）を前提にする。
const TRIAL_PUBLISHED_AT = Date.UTC(2026, 4, 17);
const BEFORE_EXPIRY = Date.UTC(2026, 4, 21); // キャンペーン期間内
const AFTER_EXPIRY = Date.UTC(2026, 5, 2); // 期限後

const freeCtx: ReleaseAudienceContext = {
  plan: "free",
  status: null,
  currentPeriodEnd: null,
};

const paidCtx: ReleaseAudienceContext = {
  plan: "premium",
  status: "active",
  currentPeriodEnd: null,
};

describe("getAutoOpenRelease", () => {
  test("autoOpen が true で全条件を満たす場合は対象 release を返す", () => {
    const result = getAutoOpenRelease({
      ctx: freeCtx,
      lastSeenReleaseAt: undefined,
      trialClaimed: false,
      now: BEFORE_EXPIRY,
    });
    expect(result?.autoOpen).toBe(true);
    expect(result?.cta?.action).toBe("claim_trial");
  });

  test("課金中ユーザー(plan=premium / status=active)には null を返す", () => {
    const result = getAutoOpenRelease({
      ctx: paidCtx,
      lastSeenReleaseAt: undefined,
      trialClaimed: false,
      now: BEFORE_EXPIRY,
    });
    expect(result).toBeNull();
  });

  test("trial claim 済みなら null を返す（claim_trial CTA の場合）", () => {
    const result = getAutoOpenRelease({
      ctx: freeCtx,
      lastSeenReleaseAt: undefined,
      trialClaimed: true,
      now: BEFORE_EXPIRY,
    });
    expect(result).toBeNull();
  });

  test("lastSeenReleaseAt が publishedAt 以上なら null を返す", () => {
    const result = getAutoOpenRelease({
      ctx: freeCtx,
      lastSeenReleaseAt: TRIAL_PUBLISHED_AT + 1,
      trialClaimed: false,
      now: BEFORE_EXPIRY,
    });
    expect(result).toBeNull();
  });

  test("expiresAt を過ぎたら null を返す", () => {
    const result = getAutoOpenRelease({
      ctx: freeCtx,
      lastSeenReleaseAt: undefined,
      trialClaimed: false,
      now: AFTER_EXPIRY,
    });
    expect(result).toBeNull();
  });
});
