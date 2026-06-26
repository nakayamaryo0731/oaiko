import { describe, expect, test } from "vitest";
import {
  getAutoOpenRelease,
  type Release,
  type ReleaseAudienceContext,
} from "./releases";

const PUBLISHED_AT = Date.UTC(2026, 4, 17);
const BEFORE_EXPIRY = Date.UTC(2026, 4, 21);
const AFTER_EXPIRY = Date.UTC(2026, 5, 2);

const trialCampaignFixture: Release = {
  id: "test-trial-campaign",
  publishedAt: PUBLISHED_AT,
  title: "Premium trial",
  body: "30日無料",
  audience: "non-paying",
  cta: { label: "trial を受け取る", action: "claim_trial" },
  expiresAt: Date.UTC(2026, 5, 1),
  autoOpen: true,
};

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
    const result = getAutoOpenRelease(
      {
        ctx: freeCtx,
        lastSeenReleaseAt: undefined,
        trialClaimed: false,
        now: BEFORE_EXPIRY,
      },
      [trialCampaignFixture],
    );
    expect(result?.autoOpen).toBe(true);
    expect(result?.cta?.action).toBe("claim_trial");
  });

  test("課金中ユーザー(plan=premium / status=active)には null を返す", () => {
    const result = getAutoOpenRelease(
      {
        ctx: paidCtx,
        lastSeenReleaseAt: undefined,
        trialClaimed: false,
        now: BEFORE_EXPIRY,
      },
      [trialCampaignFixture],
    );
    expect(result).toBeNull();
  });

  test("trial claim 済みなら null を返す（claim_trial CTA の場合）", () => {
    const result = getAutoOpenRelease(
      {
        ctx: freeCtx,
        lastSeenReleaseAt: undefined,
        trialClaimed: true,
        now: BEFORE_EXPIRY,
      },
      [trialCampaignFixture],
    );
    expect(result).toBeNull();
  });

  test("lastSeenReleaseAt が publishedAt 以上なら null を返す", () => {
    const result = getAutoOpenRelease(
      {
        ctx: freeCtx,
        lastSeenReleaseAt: PUBLISHED_AT + 1,
        trialClaimed: false,
        now: BEFORE_EXPIRY,
      },
      [trialCampaignFixture],
    );
    expect(result).toBeNull();
  });

  test("expiresAt を過ぎたら null を返す", () => {
    const result = getAutoOpenRelease(
      {
        ctx: freeCtx,
        lastSeenReleaseAt: undefined,
        trialClaimed: false,
        now: AFTER_EXPIRY,
      },
      [trialCampaignFixture],
    );
    expect(result).toBeNull();
  });
});
