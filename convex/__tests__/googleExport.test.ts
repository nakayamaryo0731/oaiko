import { describe, expect, test } from "vitest";
import { resolvePeriod, buildSheetTitle } from "../google";

describe("resolvePeriod", () => {
  test("type=all は null", () => {
    expect(resolvePeriod({ type: "all" }, 25)).toBeNull();
  });

  test("type=year は 1/1〜12/31", () => {
    expect(resolvePeriod({ type: "year", year: 2026 }, 25)).toEqual({
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    });
  });

  test("type=settlement は精算期間（締め日基準）", () => {
    // 締め日25、2026年5月分 → 2026-04-26 〜 2026-05-25
    expect(
      resolvePeriod({ type: "settlement", year: 2026, month: 5 }, 25),
    ).toEqual({
      startDate: "2026-04-26",
      endDate: "2026-05-25",
    });
  });

  test("type=settlement で締め日が月末近くの場合", () => {
    // 締め日28、2026年5月分 → 2026-04-29 〜 2026-05-28
    expect(
      resolvePeriod({ type: "settlement", year: 2026, month: 5 }, 28),
    ).toEqual({
      startDate: "2026-04-29",
      endDate: "2026-05-28",
    });
  });
});

describe("buildSheetTitle", () => {
  test("type=all は「全期間」", () => {
    expect(buildSheetTitle("ペアボ夫婦", { type: "all" })).toBe(
      "Pairbo - ペアボ夫婦 - 全期間",
    );
  });

  test("type=year は「YYYY年」", () => {
    expect(buildSheetTitle("二人暮らし", { type: "year", year: 2026 })).toBe(
      "Pairbo - 二人暮らし - 2026年",
    );
  });

  test("type=settlement は「YYYY年M月」", () => {
    expect(
      buildSheetTitle("グループA", {
        type: "settlement",
        year: 2026,
        month: 5,
      }),
    ).toBe("Pairbo - グループA - 2026年5月");
  });

  test("グループ名に記号が含まれていてもそのまま使う", () => {
    expect(buildSheetTitle("たろう & はなこ", { type: "all" })).toBe(
      "Pairbo - たろう & はなこ - 全期間",
    );
  });
});
