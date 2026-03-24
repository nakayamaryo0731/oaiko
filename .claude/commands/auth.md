# Authentication Setup

認証をセットアップする。
プレイブック `docs/design-indie-dev-playbook.md` のセクション2を参照しながら進める。

## 手順

### Step 1: 前提確認

まず現在のプロジェクトの状態を確認する:

- 使用フレームワーク（Next.js等）
- 既存の認証設定があるか
- package.jsonの依存関係

$ARGUMENTS があればそれをもとに認証プロバイダーを決定する。
指定がなければ Clerk を推奨する（Pairboでの実績あり）。

### Step 2: 👤 開発者に確認（手動作業が必要なもの）

以下は開発者がブラウザで行う必要がある:

- 認証プロバイダーのプロジェクト作成（Clerk: dashboard.clerk.com）
- APIキーの取得（Publishable Key, Secret Key）
- Issuer URL の確認

キーを取得済みか確認し、まだならここで案内して待つ。

### Step 3: 🤖 実装（Claudeが行う）

以下を順に実装する:

1. パッケージインストール（`@clerk/nextjs`, `@clerk/localizations` 等）
2. `.env.example` に環境変数テンプレート追加
3. `ConvexClientProvider`（Convex使用時）または認証プロバイダーラッパー
4. `convex/auth.config.ts`（Convex使用時）
5. `middleware.ts` — 公開ルートと保護ルートの定義
6. サインイン/サインアップページ
7. usersテーブルのスキーマ定義（`by_clerk_id` インデックス）
8. `authQuery` / `authMutation` ラッパー関数
9. 初回ログイン時のユーザー自動作成ロジック
10. 日本語ローカライズ設定

### Step 4: 確認

- 型チェック（`pnpm typecheck`）でエラーがないこと
- 認証フローの動作確認手順を案内

### 汎用ガイドライン

Clerk以外の認証プロバイダー（Auth.js, Convex Auth, Supabase Auth等）を使う場合も、
上記のステップ構成は同じ。プロバイダー固有の部分だけ差し替える:

- Provider ラッパーコンポーネント
- auth.config.ts の設定
- ユーザーID取得方法（`identity.subject` 等）
- ミドルウェアの認証チェック方法
