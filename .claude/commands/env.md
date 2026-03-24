# Environment Variables Setup

プロジェクトの環境変数を整理・セットアップする。
プレイブック `docs/design-indie-dev-playbook.md` の各セクションの環境変数情報を横断的に参照する。

## 手順

### Step 1: 現状確認

- 既存の `.env.example`, `.env.local` を確認
- 使用中のサービスを特定（Clerk, Convex, Stripe, Sentry, GA4等）
- Convex環境変数（`npx convex env list`）を確認

### Step 2: 👤 開発者に確認

以下のキーは各サービスのダッシュボードから取得が必要:

**Clerk:**

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk Dashboard → API Keys
- `CLERK_SECRET_KEY` — 同上
- `CLERK_ISSUER_URL` — Clerk Dashboard → JWT Templates

**Convex:**

- `NEXT_PUBLIC_CONVEX_URL` — Convex Dashboard → Deployment URL
- `CONVEX_DEPLOY_KEY` — Convex Dashboard → Deploy Keys

**Stripe:**

- `STRIPE_SECRET_KEY` — Stripe Dashboard → API Keys
- `STRIPE_WEBHOOK_SECRET` — Stripe Dashboard → Webhooks
- `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_YEARLY` — Stripe Dashboard → Products

**Sentry:**

- `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` — Sentry → Project Settings
- `SENTRY_AUTH_TOKEN` — Sentry → Auth Tokens

**GA4:**

- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — Google Analytics → Data Streams

**AdSense:**

- `NEXT_PUBLIC_ADSENSE_CLIENT_ID` — AdSense → Account Info

### Step 3: 🤖 実装（Claudeが行う）

1. `.env.example` を作成/更新（全環境変数のテンプレート、値なし）
2. `.env.local` に開発者から受け取った値を設定
3. Convex環境変数を CLI で設定（`npx convex env set KEY value`）
4. `.gitignore` に `.env.local`, `.env.sentry-build-plugin` が含まれているか確認
5. GitHub Secretsに設定すべきキーの一覧を案内

### Step 4: 確認

- 環境変数の漏洩リスクチェック（`NEXT_PUBLIC_` 以外がフロントに露出していないか）
- ビルドに必要な変数が揃っているか確認
