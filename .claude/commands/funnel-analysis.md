# /funnel-analysis

Pairbo の招待ファネルを定期的に分析するスキル。Convex MCP で prod の数値を取得し、ファネル詰まりポイントを可視化する。

## 前提

- Claude Code に Convex MCP が接続済み（`mcp__convex__*` ツールが使える状態）
- prod deployment は read-only でアクセス（書き込みは行わない）

## 実行手順

1. **deployment selector を取得**

   ```
   mcp__convex__status(projectDir: "/Users/ron/Dev/oaiko")
   ```

   結果から `kind: "prod"` の `deploymentSelector` を控える。

2. **クエリスクリプトを読み込み**

   `analytics/queries/funnel.js` を Read で読み込む。

3. **クエリ実行**

   ```
   mcp__convex__runOneoffQuery(
     deploymentSelector: <prod selector>,
     query: <funnel.js の中身全文>
   )
   ```

4. **レポート整形して出力**

   下記「出力フォーマット」に従って表形式で報告する。

## 出力フォーマット

以下のセクションを順に出す。

### サマリ

- ユーザー数 / グループ数 / 招待数 / 支出件数

### グループ単位ファネル（表）

| ステージ      |               件数 |                               通過率 |
| ------------- | -----------------: | -----------------------------------: |
| グループ作成  |      `groupsTotal` |                                    – |
| 招待発行      | `groupsWithInvite` |                     `inviteEmitRate` |
| 2人到達       |  `groupsWith2Plus` | `inviteToPairRate`（招待発行→2人化） |
| 総合2人到達率 |                  – |                    `overallPairRate` |

### 1人グループの内訳（表）

| 区分                 |               件数 |
| -------------------- | -----------------: |
| 招待未発行           |    `withoutInvite` |
| 招待発行したが未使用 | `withUnusedInvite` |
| 支出記録あり         |      `withExpense` |
| 支出ゼロ             |      `zeroExpense` |
| 滞留 0-3日           |   `agedDays.d0to3` |
| 滞留 3-7日           |   `agedDays.d3to7` |
| 滞留 7-30日          |  `agedDays.d7to30` |
| 滞留 30日以上        | `agedDays.d30plus` |

### 2人到達グループの活動状況

| 状態         |                        件数 |
| ------------ | --------------------------: |
| 支出記録あり | `pairBreakdown.withExpense` |
| 支出ゼロ     | `pairBreakdown.zeroExpense` |

### 招待状況

| 区分           |                                    件数 |
| -------------- | --------------------------------------: |
| 発行           |                    `invitations.issued` |
| 使用済み       | `invitations.used`（使用率 `usedRate`） |
| 期限切れ未使用 |                   `invitations.expired` |
| 期限内未使用   |                    `invitations.active` |

### 相棒参加までの時間（2人到達グループ）

p25 / median / p75 を **日数** で表示。

### 所見

数値を見て「最大の詰まりはどこか」「前回からの差分」「次の打ち手候補」を箇条書きで簡潔に。

## 数値の前提

- 「ファネル発射点」: グループ作成
- 「2人到達」: そのグループの `groupMembers` が 2 件以上
- 「招待発行」: そのグループの `groupInvitations` が 1 件以上
- 「招待使用」: `groupInvitations.usedAt` が non-null

詳細は `analytics/README.md` 参照。

## クエリ更新時の方針

- `analytics/queries/funnel.js` を直接編集
- 集計テーマが増えるなら `retention.js` などにファイル分割
- 個人特定情報を返さない（集計値のみ）
- 編集後はこの SKILL の「出力フォーマット」も同期して更新する
