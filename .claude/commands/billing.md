# Billing / Payment Setup

決済・サブスクリプション機能をセットアップする。
プレイブック `docs/design-indie-dev-playbook.md` のセクション3を参照しながら進める。

## 手順

### Step 1: 前提確認

- 認証が既にセットアップされているか確認（`/auth` を先に実行すべきか判断）
- 既存のStripe関連コードがあるか確認
- 料金プラン（月額/年額/価格）を $ARGUMENTS または対話で確認

### Step 2: 👤 開発者に確認（手動作業が必要なもの）

以下はStripeダッシュボードでの操作が必要:

1. Stripeアカウント作成・本人確認・銀行口座登録
2. 商品作成（例: "アプリ名 Premium"）
3. 価格作成（月額/年額）→ Price ID を控える
4. Customer Portal 設定（解約・プラン変更を許可）
5. Webhook エンドポイント登録 → Signing Secret を控える
   - 登録するイベント: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

取得すべきキー:

- `STRIPE_SECRET_KEY` (sk_live_xxx or sk_test_xxx)
- `STRIPE_WEBHOOK_SECRET` (whsec_xxx)
- `STRIPE_PRICE_MONTHLY` (price_xxx)
- `STRIPE_PRICE_YEARLY` (price_xxx)

### Step 3: 🤖 実装（Claudeが行う）

以下を順に実装する:

1. `stripe` パッケージインストール
2. `subscriptions` テーブルのスキーマ定義（userId, stripeCustomerId, plan, status等）
3. Checkout Session 作成 Action（Convex action or API route）
4. Customer Portal Session 作成 Action
5. Webhook Handler（HTTP endpoint、署名検証付き）
   - `checkout.session.completed` → サブスクリプション作成
   - `customer.subscription.updated` → ステータス更新
   - `customer.subscription.deleted` → freeプランに戻す
   - `invoice.payment_failed` → past_due設定
6. Premium判定ヘルパー（`isPremium`, `getUserPlan`, 機能別ゲート関数）
7. Pricing Page（フロントエンド）
8. 環境変数テンプレート（`.env.example` 更新）

### Step 4: 法務ページ

有料サービスの場合、特定商取引法ページが法律上必須。
必要なら `/legal` スキルの実行を案内する。

### Step 5: テスト

- サブスクリプションロジックのユニットテスト
- Webhook ハンドラーのテスト
- `pnpm typecheck` でエラーなし確認
