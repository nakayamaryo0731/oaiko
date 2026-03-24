# Release Check

リリース前チェックリストを実行する。
プレイブック `docs/design-indie-dev-playbook.md` のセクション14を参照する。

## 手順

### Step 1: 🤖 自動チェック（Claudeが実行）

以下を自動的に確認する:

#### コード品質

- [ ] `pnpm lint` — ESLintエラーなし
- [ ] `pnpm format:check` — フォーマット崩れなし
- [ ] `pnpm typecheck` — 型エラーなし
- [ ] `pnpm test:run` — 全テストパス
- [ ] `pnpm audit` — 重大な脆弱性なし

#### 設定ファイル

- [ ] `app/sitemap.ts` が存在し、URLが正しいか
- [ ] `public/robots.txt` が存在するか
- [ ] `app/manifest.ts` が存在し、アイコンパスが正しいか
- [ ] OGP画像 `public/og-image.png` が存在するか
- [ ] favicon が存在するか

#### セキュリティ

- [ ] 環境変数に秘密鍵がハードコードされていないか
- [ ] `.env.local` が `.gitignore` に含まれているか
- [ ] Sentry tracesSampleRate が 1.0 でないか（0.2推奨）
- [ ] `console.log` が本番コードに残っていないか

#### ページ存在チェック

- [ ] プライバシーポリシー (`/privacy`) が存在するか
- [ ] 利用規約 (`/terms`) が存在するか
- [ ] 特定商取引法 (`/legal/tokushoho`) が存在するか（有料の場合）
- [ ] 404ページ (`app/not-found.tsx`) が存在するか
- [ ] オフラインページ (`/offline`) が存在するか

### Step 2: 👤 開発者に確認（手動チェック）

以下は開発者がブラウザ/ダッシュボードで確認する必要がある:

#### 環境変数

- [ ] Clerk: 本番キー（`pk_live_`, `sk_live_`）に切り替え済みか
- [ ] Stripe: 本番モードの商品・価格・Webhookが設定済みか
- [ ] Convex: 本番環境変数が設定済みか
- [ ] Vercel: `NEXT_PUBLIC_*` が本番値になっているか
- [ ] GitHub Secrets: CI/CD用のキーが設定済みか

#### 動作確認

- [ ] Lighthouse スコア確認（Performance, Accessibility, SEO）
- [ ] OGPデバッガーでシェア表示を確認
- [ ] 実機（iPhone/Android）でPWA動作確認
- [ ] Google Analytics でイベントが送信されているか
- [ ] Sentry でエラーが受信されるか

### Step 3: レポート

チェック結果を以下の形式で報告する:

- 🔴 **ブロッカー** — リリース不可、即時修正
- 🟡 **推奨** — リリース可能だが改善推奨
- 🟢 **OK** — 問題なし
- 👤 **要手動確認** — 開発者がブラウザで確認すべき項目
