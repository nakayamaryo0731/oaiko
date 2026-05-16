# analytics/

Pairbo の運用分析のためのクエリ集と参照資料。

## ディレクトリ構成

- `queries/`: Convex MCP の `runOneoffQuery` から実行する read-only クエリ。
  - `funnel.js` … 招待ファネル全集計（グループ単位 / 1人グループ内訳 / 相棒参加までの時間）

## 使い方

Claude Code から **`/funnel-analysis`** スキルを呼べば自動でクエリ実行 → 整形済みレポート出力。

スキル無しで手動実行したい場合:

1. Convex MCP が Claude Code に接続済みであること（`claude mcp list` で `convex` が出る）
2. `mcp__convex__status` で prod deployment selector を取得
3. `analytics/queries/funnel.js` を読み込み、その中身を `mcp__convex__runOneoffQuery` の `query` 引数に渡す

## クエリ追加時の方針

- `runOneoffQuery` 用フォーマット（`import { query } from "convex:/_system/repl/wrappers.js"`）に従う
- 集計対象が増えてきたら 1ファイル1テーマで分割する（例: `retention.js`, `revenue.js`）
- 出力は **生データ寄り**。整形・解釈はスキル側で行う
- 個人特定情報（メールアドレス / displayName 等）は集計値以外で返さない

## 数値の解釈基準（2026-05-16 時点）

- 「ファネル発射点」: グループ作成（`groups`）
- 「2人到達」: そのグループの `groupMembers` が 2 件以上
- 「招待発行」: そのグループの `groupInvitations` が 1 件以上
- 「招待使用」: `groupInvitations.usedAt` が non-null

経過日数は `groups.createdAt` 基準で算出。
