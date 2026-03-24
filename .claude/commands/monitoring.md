# Monitoring & Analytics Setup

Google Analytics 4 + Sentry を導入する。
プレイブック `docs/design-indie-dev-playbook.md` のセクション7を参照する。

## 手順

### Step 1: 前提確認

- 既存のアナリティクス/モニタリング設定があるか
- Next.js のバージョンと設定（`next.config.ts`）を確認

### Step 2: 👤 開発者に確認（手動作業が必要なもの）

**Google Analytics 4:**

- GA4プロパティ作成（analytics.google.com）
- Measurement ID 取得（`G-XXXXXXXXXX`）

**Sentry:**

- Sentryプロジェクト作成（sentry.io）
- DSN 取得
- Auth Token 取得（CI用ソースマップアップロードに必要）
- Organization名, Project名を確認

**Google AdSense（任意）:**

- AdSense申請・審査通過
- Publisher ID 取得（`ca-pub-xxx`）

### Step 3: 🤖 実装（Claudeが行う）

**GA4:**

1. `components/GoogleAnalytics.tsx` — Script コンポーネント（afterInteractive）
2. `lib/analytics.ts` — `trackEvent()` ヘルパー関数
3. `app/layout.tsx` に GoogleAnalytics コンポーネント追加
4. `.env.example` に `NEXT_PUBLIC_GA_MEASUREMENT_ID` 追加
5. 主要コンバージョンイベントの設計
   - `sign_up` — サインアップ完了
   - `upgrade_premium` — 課金（決済がある場合）
   - `submit_inquiry` — お問い合わせ

**Sentry:**

1. `@sentry/nextjs` インストール
2. `sentry.server.config.ts` — サーバーサイド設定（tracesSampleRate: 0.2）
3. `sentry.edge.config.ts` — Edge runtime設定
4. `instrumentation.ts` — Sentry初期化
5. `next.config.ts` を `withSentryConfig()` でラップ
6. `app/global-error.tsx` — グローバルエラーハンドラー
7. `.env.example` に `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN` 追加
8. `.env.sentry-build-plugin` テンプレート作成

**AdSense（任意）:**

1. `components/GoogleAdSense.tsx` — AdSenseスクリプト
2. `public/ads.txt` — 広告設定
3. 広告バナーコンポーネント（Premium非表示ロジック付き）

### Step 4: 確認

- GA4: ブラウザのNetwork tabで gtag リクエストが飛んでいるか
- Sentry: テストエラーを送信して受信確認
- AdSense: ads.txt が正しくアクセスできるか
