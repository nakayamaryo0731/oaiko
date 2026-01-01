import { ConvexError } from "convex/values";

/**
 * ドメインエラーの基底クラス
 *
 * ドメイン固有のエラーを構造化するための基底クラス。
 * エラーコードとメッセージを持ち、ConvexErrorへの変換をサポート。
 *
 * @example
 * ```ts
 * // ドメイン固有のエラータイプを定義
 * type ExpenseErrorCode = "invalid_amount" | "category_not_found" | "settled_period";
 *
 * // エラーメッセージのマッピング
 * const expenseErrorMessages: Record<ExpenseErrorCode, string> = {
 *   invalid_amount: "金額は1円以上である必要があります",
 *   category_not_found: "カテゴリが見つかりません",
 *   settled_period: "精算済みの期間の支出は編集できません",
 * };
 *
 * // DomainErrorを使用してエラーを投げる
 * throw new DomainError("invalid_amount", expenseErrorMessages.invalid_amount);
 *
 * // または toConvexError() でConvexErrorに変換
 * throw new DomainError("settled_period", expenseErrorMessages.settled_period).toConvexError();
 * ```
 */
export class DomainError<TCode extends string = string> extends Error {
  /**
   * エラーコード（プログラムでの判別用）
   */
  public readonly code: TCode;

  constructor(code: TCode, message: string) {
    super(message);
    this.name = "DomainError";
    this.code = code;
  }

  /**
   * ConvexErrorに変換
   * Convex mutationから直接投げる場合に使用
   */
  toConvexError(): ConvexError<string> {
    return new ConvexError(this.message);
  }
}

/**
 * ドメインエラーファクトリを作成
 *
 * エラーコードとメッセージのマッピングからエラー生成関数を作成。
 *
 * @example
 * ```ts
 * const settlementErrors = {
 *   already_settled: "この期間の精算は既に確定されています",
 *   no_expenses: "精算対象の支出がありません",
 * } as const;
 *
 * const createSettlementError = createDomainErrorFactory(settlementErrors);
 *
 * // 使用
 * throw createSettlementError("already_settled").toConvexError();
 * ```
 */
export function createDomainErrorFactory<
  TMessages extends Record<string, string>,
>(
  messages: TMessages,
): (code: keyof TMessages) => DomainError<keyof TMessages & string> {
  return (code: keyof TMessages) => {
    return new DomainError(code as keyof TMessages & string, messages[code]);
  };
}
