# Project Foundation

新規プロジェクトの雛形を生成する。
プレイブック `docs/design-indie-dev-playbook.md` のセクション1（技術選定）とセクション13（プロジェクト構成）を参照する。

## 手順

### Step 1: 要件ヒアリング

$ARGUMENTS または対話で以下を確認する:

- プロダクト名
- プロダクトの概要（何をするアプリか）
- 技術スタック（指定がなければ推奨構成を提案）
  - 推奨: Next.js + Convex + Clerk + Stripe + Tailwind CSS
- リアルタイム同期が必要か
- 認証が必要か
- 決済が必要か

### Step 2: 👤 開発者に確認（手動作業が必要なもの）

1. GitHubリポジトリ作成
2. Convexプロジェクト作成（dashboard.convex.dev）
3. Vercelプロジェクト作成・リポジトリ連携

### Step 3: 🤖 実装（Claudeが行う）

1. **Next.js プロジェクト作成**
   - `create-next-app` でApp Router構成
   - TypeScript strict mode

2. **ディレクトリ構成**

   ```
   app/           — ページ
   components/    — UIコンポーネント
   components/ui/ — shadcn/ui
   convex/        — バックエンド（Convex使用時）
   convex/lib/    — バックエンドユーティリティ
   convex/domain/ — ドメインロジック
   hooks/         — カスタムhooks
   lib/           — フロントエンドユーティリティ
   public/        — 静的アセット
   public/icons/  — PWAアイコン
   docs/          — 設計ドキュメント
   ```

3. **設定ファイル一式**
   - `tsconfig.json`（strict, パスエイリアス `@/*`）
   - `eslint.config.mjs`（Next.js + TypeScript）
   - `.prettierrc`
   - `postcss.config.mjs`（Tailwind CSS v4）
   - `.gitignore`
   - `.env.example`

4. **package.json scripts**
   - dev, build, lint, format, format:check, typecheck, test系

5. **CLAUDE.md**
   - プロジェクト概要、方針、技術スタック、開発フローを記載

6. **Convex初期設定**（Convex使用時）
   - `convex/schema.ts`（usersテーブル最小構成）
   - `convex/tsconfig.json`

### Step 4: 次のステップ案内

プロジェクトに応じて次に実行すべきスキルを案内:

- `/auth` — 認証が必要なら
- `/design-system` — UIコンポーネント基盤
- `/cicd` — CI/CD構築
