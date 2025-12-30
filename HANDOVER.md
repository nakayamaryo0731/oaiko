# Oaiko - セッション引き継ぎ書

> 最終更新: 2024-12-30
> ステータス: DBスキーマ実装完了

---

## 現在の状況サマリー

**完了したこと**

- 技術選定（Next.js + Convex）
- プロダクト名決定（Oaiko = おあいこ）
- MVP機能仕様策定
- プロジェクト初期セットアップ
- Convexアカウント連携・開発環境セットアップ
- デプロイフロー確立（Vercel + Convex）
- GitHub Actions CI/CD構築
  - CI: lint, format, typecheck, build（並列実行）
  - Deploy: Convex → Vercel Deploy Hook
- pnpmへ移行
- ドメインモデル設計（`docs/design-domain-model.md`）
- 認証方式決定・実装（Clerk）
  - Clerk + Convex連携
  - 認証ミドルウェア（authQuery, authMutation）
  - サインイン・サインアップページ
- DBスキーマ実装（`convex/schema.ts`）
  - 全9テーブル定義完了
  - 共通バリデータ作成
  - プリセットカテゴリ定義

**次にやること**

- 基本的なCRUD mutation/query の実装
  - グループ作成・参加
  - 支出登録・一覧
  - カテゴリ管理
- UI実装（モバイルファースト）

---

## プロジェクト情報

### 基本情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| プロダクト名 | Oaiko（おあいこ）                                |
| 名前の由来   | お相子 = 精算して貸し借りなし                    |
| コンセプト   | 割り勘・傾斜折半ができる共有家計簿               |
| ターゲット   | 同棲カップル、夫婦、シェアハウス住人             |
| 差別化       | 割り勘・傾斜折半 + プラットフォーム非依存（Web） |

### 技術スタック

```
Frontend: Next.js 16 (App Router) + React 19
Backend: Convex 1.31 (DB + API + リアルタイム)
Styling: Tailwind CSS 4
Language: TypeScript 5
Auth: Clerk（決定済み）
Deploy: Vercel + Convex
```

### 技術選定の経緯

1. **案A（Next.js + tRPC + Drizzle + Neon）** - 型安全だが自分で実装が必要
2. **案B（Remix + Drizzle + Turso）** - Web標準でシンプル
3. **案F（Next.js + Convex）** ← **採用**

**Convexを選んだ理由**

- リアルタイム同期が組み込み（共有家計簿に最適）
- Optimistic UIがデフォルト（サクサク動作）
- IaC不要でアプリコードに集中できる
- 無料枠が個人開発に十分（DB 0.5GB、関数100万回/月）

**許容したトレードオフ**

- Convexへのベンダーロックイン
- 独自クエリ言語の学習

**Next.jsを選んだ理由**

- 将来の拡張性（LP追加、SEO、OGP生成など）
- 情報量が多く、困った時の解決策が豊富
- Vite + Reactでも良かったが、規模拡大を見越して採用

---

## MVP機能仕様

### 機能一覧

| 機能             | 詳細                                          |
| ---------------- | --------------------------------------------- |
| **支出記録**     | 金額、カテゴリ、支払者、日付、メモ            |
| **負担方法**     | 均等 / 傾斜（割合） / 傾斜（金額） / 全額負担 |
| **グループ**     | Nグループ対応（ユーザーは複数グループ所属可） |
| **メンバー**     | M人対応（グループごと）                       |
| **カテゴリ**     | プリセット（食費、日用品等） + カスタム追加   |
| **精算**         | 月ごと表示、精算済み/未精算ステータス管理     |
| **分析**         | カテゴリ別円グラフ、月別推移グラフ            |
| **買い物リスト** | グループ共有、支出連携、履歴表示              |

### 負担方法の詳細

```
例: 1000円の支出、Aさんが支払い、A・B・Cの3人グループ

均等:       A:334, B:333, C:333
傾斜(割合): A:50%, B:30%, C:20% → A:500, B:300, C:200
傾斜(金額): A:500, B:300, C:200（直接指定）
全額負担:   Aが全額 or Bが全額 etc
```

### 買い物リスト連携

```
1. 買い物リストに登録（グループ共有）
   - 牛乳、パン、洗剤...

2. 買い物完了 → 支出登録
   - チェックしたアイテム → 合計金額入力 → 支出として記録
   - 購入済みアイテムはリストから自動削除
   - 履歴モードで過去の購入済みを確認可能
```

### MVP外（将来検討）

- レシートOCR
- 通知機能
- 収入記録
- 買い物リストの個別金額入力

---

## UX指針

1. **モバイルファースト徹底**（デスクトップは後回し）
2. **入力UX最優先**（目標: 3タップ以内で記録完了）
3. **PWA対応必須**
4. **パフォーマンス重視**（初期ロード3秒以内、Optimistic UI）
5. **オフライン対応は段階的に**
6. **将来のネイティブ化**（Capacitor等）を視野に

---

## プロジェクト構造

```
/Users/ron/Dev/oaiko/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # ホームページ（認証状態表示）
│   ├── globals.css
│   ├── sign-in/            # サインインページ
│   └── sign-up/            # サインアップページ
├── convex/                 # Convex バックエンド
│   ├── schema.ts           # DBスキーマ（全テーブル定義済み）
│   ├── auth.config.ts      # Clerk認証設定
│   ├── lib/
│   │   ├── auth.ts         # 認証ミドルウェア（authQuery, authMutation）
│   │   ├── validators.ts   # 共通バリデータ
│   │   └── presetCategories.ts  # プリセットカテゴリ
│   └── _generated/         # 自動生成（触らない）
├── components/
│   └── ConvexClientProvider.tsx  # Convex + Clerk プロバイダ
├── docs/
│   ├── tech-selection.md   # 技術選定ドキュメント
│   ├── mvp-features.md     # MVP機能仕様
│   ├── design-domain-model.md     # ドメインモデル設計書
│   └── design-authentication.md   # 認証設計書
├── middleware.ts           # Clerk認証ミドルウェア
├── CLAUDE.md               # プロジェクト概要（Claude Code用）
├── HANDOVER.md             # この引き継ぎ書
├── package.json
└── tsconfig.json
```

---

## DBスキーマ

### テーブル一覧

| テーブル           | 用途             | 主要インデックス           |
| ------------------ | ---------------- | -------------------------- |
| users              | ユーザー         | by_clerk_id                |
| groups             | グループ         | -                          |
| groupMembers       | グループメンバー | by_user, by_group_and_user |
| groupInvitations   | 招待リンク       | by_token                   |
| categories         | カテゴリ         | by_group                   |
| expenses           | 支出             | by_group_and_date          |
| expenseSplits      | 支出分割         | by_expense                 |
| settlements        | 精算             | by_group_and_period        |
| settlementPayments | 精算支払い       | by_settlement              |
| shoppingItems      | 買い物リスト     | by_group_and_purchased     |

### 負担方法（splitMethod）

| 値     | 説明                 |
| ------ | -------------------- |
| equal  | 均等分割             |
| ratio  | 傾斜分割（割合指定） |
| amount | 傾斜分割（金額指定） |
| full   | 全額負担             |

---

## デプロイ情報

| 環境           | URL                                      |
| -------------- | ---------------------------------------- |
| 本番（Vercel） | https://oaiko.vercel.app                 |
| Convex本番     | https://hip-moose-165.convex.cloud       |
| Convex開発     | https://proper-guanaco-454.convex.cloud  |
| GitHub         | https://github.com/nakayamaryo0731/oaiko |

---

## 次のセッションでやること

### 1. グループ機能の実装

- グループ作成 mutation（プリセットカテゴリ自動追加）
- グループ一覧 query
- グループ招待・参加機能

### 2. 支出機能の実装

- 支出登録 mutation（負担配分計算含む）
- 支出一覧 query
- 支出編集・削除

### 3. UI実装

- グループ一覧画面
- 支出入力フォーム
- 支出一覧画面

---

## 参考情報

### Convex公式ドキュメント

- https://docs.convex.dev
- スキーマ定義: https://docs.convex.dev/database/schemas
- 認証: https://docs.convex.dev/auth

### 競合アプリ（参考）

- Shareroo - 共有家計簿No.1（参考元）
- Warikani - 2人専用割り勘
- Splitwise - 海外の定番割り勘アプリ

### 費用感

| サービス | 無料枠                   |
| -------- | ------------------------ |
| Convex   | DB 0.5GB, 関数100万回/月 |
| Vercel   | 十分                     |
| Clerk    | MAU 10,000               |

---

## 決定事項ログ

| 日付       | 決定事項                       | 理由                                                 |
| ---------- | ------------------------------ | ---------------------------------------------------- |
| 2024-12-30 | 技術スタック: Next.js + Convex | リアルタイム同期、Optimistic UI、開発速度            |
| 2024-12-30 | プロダクト名: Oaiko            | 「おあいこ」= 精算して貸し借りなし。被りなし確認済み |
| 2024-12-30 | フロントエンド: Next.js        | 将来の拡張性（LP、SEO等）を考慮                      |
| 2024-12-30 | 認証方式: Clerk                | DX良い、UIコンポーネント付き、Convex連携実績あり     |

---

## 注意事項

- `convex/_generated/` は自動生成なので編集しない
- 認証ミドルウェア: `authQuery` はユーザー必須（エラー）、`authMutation` はユーザー自動作成
- 環境変数: Convex本番には `CLERK_ISSUER_URL` 設定済み
