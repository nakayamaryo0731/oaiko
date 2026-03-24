# Security Guard Check

プロジェクトのセキュリティチェックを実施する。
プレイブック `docs/design-indie-dev-playbook.md` のセクション12を参照する。
Pairboの `docs/design-security-checklist.md` も参考にする。

## 手順

### Step 1: 🤖 自動チェック（Claudeが実行）

以下の観点でコードベースを走査し、問題を検出する:

#### 認証チェック

- [ ] 全てのpublic mutation/queryで `ctx.auth.getUserIdentity()` を使用しているか
- [ ] userIdをargsで受け取っている関数がないか（サーバーサイドで取得すべき）
- [ ] middlewareの公開ルート定義が適切か

#### 認可チェック

- [ ] グループ/リソースのアクセス制御が全mutation/queryにあるか
- [ ] オーナー限定操作が正しく制限されているか

#### 入力検証

- [ ] Convex validatorが全argsに設定されているか
- [ ] フロントエンドからの入力をサニタイズしているか

#### Webhook セキュリティ

- [ ] Stripe等のWebhookで署名検証を行っているか
- [ ] Webhook endpointが認証をバイパスできる設計になっていないか

#### 環境変数

- [ ] 秘密鍵が `NEXT_PUBLIC_` で露出していないか
- [ ] `.env.local` が `.gitignore` に含まれているか
- [ ] ハードコードされたキーやシークレットがないか

#### 依存関係

- [ ] `npm audit` / `pnpm audit` で脆弱性チェック

#### CORS / HTTP

- [ ] HTTP endpointのCORSヘッダーが適切か

### Step 2: レポート

チェック結果を以下の形式で報告する:

- 🔴 **Critical** — 即時修正が必要
- 🟡 **Warning** — 修正推奨
- 🟢 **OK** — 問題なし

### Step 3: 🤖 自動修正

Critical/Warningの項目について、修正可能なものは修正案を提示し、
承認を得てから修正を適用する。
