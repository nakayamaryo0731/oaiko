/**
 * Sheets エクスポート用のデータ整形ヘルパー
 */

const SPLIT_METHOD_LABEL: Record<string, string> = {
  equal: "均等",
  ratio: "割合（傾斜）",
  amount: "金額（傾斜）",
  full: "全額負担",
};

export type ExportExpenseRow = {
  date: string;
  title: string;
  category: string;
  amount: number;
  payer: string;
  splitMethod: string;
  memo: string;
  /** members の順序に対応した各メンバーの負担額（負担なしは 0） */
  memberAmounts: number[];
  /** タグ名の配列（順不同） */
  tags: string[];
};

export type ExportMember = {
  userId: string;
  displayName: string;
};

/**
 * 支出シート行データ → 2次元配列に変換
 *
 * 列: 日付 / タイトル / カテゴリ / 金額 / 支払者 / [メンバー1負担] ... / 分割方法 / タグ / メモ
 */
export function buildExpenseSheetRows(
  rows: ExportExpenseRow[],
  members: ExportMember[],
): (string | number)[][] {
  const memberHeaders = members.map((m) => `${m.displayName}負担`);
  const header = [
    "日付",
    "タイトル",
    "カテゴリ",
    "金額",
    "支払者",
    ...memberHeaders,
    "分割方法",
    "タグ",
    "メモ",
  ];

  const body = rows.map((r) => [
    r.date,
    r.title,
    r.category,
    r.amount,
    r.payer,
    ...r.memberAmounts,
    SPLIT_METHOD_LABEL[r.splitMethod] ?? r.splitMethod,
    r.tags.join(", "),
    r.memo,
  ]);

  return [header, ...body];
}

export const SPLIT_METHOD_LABELS = SPLIT_METHOD_LABEL;
