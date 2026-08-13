# 設計書: 定期支出の自動記録

## Overview

家賃・サブスクなど毎月同額で発生する支出を、テンプレートとして登録しておくと毎月自動で記録される機能。Premium機能（グループ単位解放）として提供する。

登録経路は2つ: グループ設定の管理画面と、通常の支出登録フォームの「毎月自動で記録」トグル。

> **改訂履歴**: 初版にあった変動金額モード（毎月金額を入力して確定する方式）とメモ欄はリリース前に削除した。固定額のみのシンプルな仕様とする。

## Purpose

### 背景

- 家賃・サブスク・光熱費は毎月ほぼ同じ内容の手入力が発生している
- 「3タップ以内で記録完了」という入力UX方針の延長線上として、定型入力はゼロタップにできる
- 現行Premium機能（傾斜折半・年次分析・タグ）は接触頻度が低く、日常的に価値を感じる課金理由が弱い

### 目的

1. 定型支出の入力コストをゼロにする
2. 毎月自動で価値を感じる「日常接触型」のPremium機能を作り、課金理由を強化する
3. 記録漏れを防ぎ、精算・分析の正確性を上げる

## What to Do

### 機能要件

#### FR-1: テンプレート管理（Premium・グループ単位）

| 機能     | 説明                                                                |
| -------- | ------------------------------------------------------------------- |
| 登録     | 金額・カテゴリ・支払者・負担方法・タイトル・実行日（毎月n日）を登録 |
| 一覧     | グループのテンプレート一覧を表示                                    |
| 編集     | 各項目の変更                                                        |
| 削除     | テンプレート削除（作成済み支出は残す）                              |
| 一時停止 | 実行を止める / 再開する                                             |

登録・編集フォームは通常の支出フォーム（`ExpenseForm`）を `variant="recurring"` で再利用する（日付の代わりに実行日を選択、タグ選択なし）。UIの統一感を保ち、二重実装を避けるため。

#### FR-2: 支出登録フォームからの同時登録

- 支出登録フォーム（新規作成時のみ）に「毎月自動で記録」トグルを表示
- ONで登録すると、支出の記録と同時に同内容のテンプレートを作成する（単一mutationでアトミックに処理）
- 実行日は支出の日付から導出（29〜31日は28日に丸める）
- 登録した月は自動生成をスキップし、翌月分から自動記録する（`lastGeneratedMonth` に支出月をセット）
- テンプレートのタイトルが必要なため、トグルON時はタイトル必須
- 手動で記録した支出自体はテンプレート由来ではない（「自動」バッジは付かない）
- Freeユーザーにはロック表示 + Premium訴求（傾斜折半と同じパターン）

#### FR-3: 自動作成された支出の扱い

- 支出一覧・詳細で「自動」バッジを表示
- 精算・分析には通常支出と同様に含まれる
- 作成後は通常支出として編集・削除可能

#### FR-4: Premium判定

- テンプレートのCRUDは `isGroupPremium` でゲート（[design-pair-plan.md](design-pair-plan.md) 前提）
- グループがFreeに戻った場合、cronは支出を作成しない（テンプレートは保持し、Premium復帰で再開）

### 非機能要件

- 冪等性: cronが同月に二重実行されても支出が重複しない
- 日付はJST基準（既存の支出dateと同じ YYYY-MM-DD 文字列）

## How to Do It

### データ構造

`convex/schema.ts`:

```
recurringExpenses: defineTable({
  groupId: v.id("groups"),
  amount: v.number(),
  categoryId: v.id("categories"),
  paidBy: v.id("users"),
  dayOfMonth: v.number(),                // 1-28（closingDayと同じ制約）
  title: v.string(),
  splitDetails: splitDetailsValidator,   // expenses.create と同じ構造を保存
  pausedAt: v.optional(v.number()),
  lastGeneratedMonth: v.optional(v.string()),  // "YYYY-MM" 冪等性キー
  createdBy: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_group", ["groupId"])
```

`expenses` テーブルに `recurringExpenseId: v.optional(v.id("recurringExpenses"))` を追加（「自動」バッジ表示と出所の追跡用）。

### 自動実行フロー

`convex/crons.ts` の日次cron（20:00 UTC = 5:00 JST）で internal mutation を実行する。

```mermaid
flowchart TD
    A["日次cron 5:00 JST"] --> B["当日実行分のテンプレートを抽出<br/>dayOfMonth == 今日(JST) かつ 非pause<br/>かつ lastGeneratedMonth != 今月"]
    B --> C{"グループが Premium?"}
    C -->|No| D["スキップ（テンプレート保持）"]
    C -->|Yes| E["支出 + expenseSplits を作成<br/>recurringExpenseId を付与"]
    E --> F["lastGeneratedMonth = 今月"]
```

- 分割計算は `expenses.create` と同じロジック（`calculateSplits` / `validateSplitDetails`）を internal mutation から再利用する
- テンプレートの `splitDetails` が現在のメンバー構成で無効な場合（対象メンバーの脱退等）は均等割にフォールバックして作成する
- cronはユーザー文脈を持たないため、`createdBy` はテンプレートの `createdBy` を引き継ぐ

### UI

- 管理画面: グループ設定タブに「定期支出」セクション（一覧・登録・編集・削除・一時停止）。フォームは `ExpenseForm variant="recurring"`
- 支出登録フォーム: 「毎月自動で記録」トグル（新規作成時のみ）
- Free ユーザーには管理画面入口をロック表示し、Premium訴求を出す（タグ例表示と同じteaserパターン）
- 支出一覧・詳細: `recurringExpenseId` がある支出に「自動」バッジ

### テスト・その他

- `convex/__tests__/` にユニットテスト: 冪等性（同月二重実行）、Premium失効時スキップ、splitDetailsフォールバック、支出フォームからの同時登録（当月スキップ・翌月生成）
- リリースノートは予算機能と束ねて1本のお知らせにするため、このリリースでは追加しない（予算リリース時に `lib/releases.ts` へ追加）
- シードデータに定期支出テンプレート2件（家賃・電気代）を追加

## What We Won't Do

- 変動金額モード（毎月金額を入力して確定する方式）: 初版で実装したが、確認待ちカードのUXが複雑になるためリリース前に削除。金額が変わる支出は通常の手動記録で対応
- メモ欄: 通常の支出フォームにもないため、統一のため持たない
- 月次以外の頻度（週次・年次・隔月）
- 「月末」指定（dayOfMonthは1-28。29-31日の支出は28日で代用してもらう）
- 実行前の事前通知・リマインド（通知基盤がないため。将来PWA通知で拡張）
- 過去月への遡及作成

## Alternatives Considered

| 案                                       | 概要                         | 不採用理由                                                                     |
| ---------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| 変動金額モード（金額確認待ちカード）     | 光熱費など毎月変わる支出向け | 一度実装したが、確認フロー・専用カード・状態管理が複雑な割に価値が薄いため削除 |
| 定期支出専用の登録フォーム               | 独立した実装                 | 通常フォームとUXが乖離しがち。`ExpenseForm` の variant として統合              |
| クライアント起動時に生成（cronなし）     | インフラ追加ゼロ             | 誰も開かない月は生成されず、2人同時起動で重複リスク。Convex cronで素直に解決   |
| 実行日を過ぎたら即時生成（時刻指定なし） | 実装同じ                     | ―（採用。日次cronで当日分を生成する方式がこれに相当）                          |

## Concerns

- **Premium失効中にスキップされた月の扱い**: 復帰しても遡及作成はしない（手動入力で補完）。仕様として明記する
- **支払者の脱退**: `paidBy` がグループを抜けた場合、生成に失敗する。テンプレートを自動pauseし、管理画面で警告表示する
- **cron時刻とタイムゾーン**: Convex cronはUTC指定。5:00 JST実行なら日付境界の混乱はほぼないが、日付計算はJST変換を明示的に行うこと

## Reference Materials/Information

- `docs/design-pair-plan.md` — Premium判定のグループ単位化（前提）
- `convex/expenses.ts` — 支出作成ロジック（分割計算の再利用元）
- Convex Cron Jobs: https://docs.convex.dev/scheduling/cron-jobs
