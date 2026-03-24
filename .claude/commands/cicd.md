# CI/CD Setup

CI/CDパイプラインを構築する。
プレイブック `docs/design-indie-dev-playbook.md` のセクション8を参照しながら進める。

## 手順

### Step 1: 前提確認

- GitHubリポジトリが存在するか
- 使用パッケージマネージャー（pnpm/npm/yarn）
- デプロイ先（Vercel + Convex / Vercel単体 / その他）
- 既存のワークフローがあるか

### Step 2: 👤 開発者に確認（手動作業が必要なもの）

GitHub Secretsの設定（GitHub → Settings → Secrets and variables → Actions）:

- `CONVEX_DEPLOY_KEY` — Convexダッシュボードで発行
- `VERCEL_DEPLOY_HOOK` — Vercelダッシュボードで作成
- `NEXT_PUBLIC_CONVEX_URL` — Convexデプロイメント URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — ビルドに必要
- `SENTRY_AUTH_TOKEN` — Sentryダッシュボードで発行（ソースマップ用）

### Step 3: 🤖 実装（Claudeが行う）

1. **再利用可能セットアップAction** `.github/actions/setup/action.yml`
   - pnpm + Node.js + キャッシュ付きインストール

2. **CIワークフロー** `.github/workflows/ci.yml`
   - トリガー: PRがmainブランチ宛のとき
   - 並列ジョブ: lint, format:check, typecheck, test:unit, test:integration, build
   - concurrency設定（同一PR上の古いrunをキャンセル）

3. **Deployワークフロー** `.github/workflows/deploy.yml`
   - トリガー: mainブランチへのpush
   - 順次実行: Convex deploy → Vercel deploy hook
   - concurrency設定（cancel-in-progressはfalse）

4. **Pre-commit hook**
   - `husky` + `lint-staged` のセットアップ
   - package.jsonにlint-staged設定追加

5. **package.json scripts**
   - dev, build, lint, format, format:check, typecheck, test系コマンド

### Step 4: 確認

- ワークフローのYAML構文チェック
- ローカルでpre-commitフックの動作確認
