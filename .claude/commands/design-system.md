# Design System Setup

UIコンポーネント基盤をセットアップする。
プレイブック `docs/design-indie-dev-playbook.md` のセクション1.6を参照しながら進める。

## 手順

### Step 1: 前提確認

- フレームワーク（Next.js等）の確認
- 既存のUIライブラリがあるか
- デザインの方向性（$ARGUMENTS で指定があれば参照）

### Step 2: 🤖 実装（すべてClaude側で実行可能）

1. **Tailwind CSS v4 セットアップ**
   - `tailwindcss`, `@tailwindcss/postcss` インストール
   - `postcss.config.mjs` 設定
   - `globals.css` にTailwindインポート + CSS変数定義

2. **shadcn/ui 初期化**
   - `npx shadcn@latest init`
   - 基本コンポーネント追加: button, input, dialog, label, select, popover, skeleton, switch

3. **ユーティリティ関数**
   - `lib/utils.ts` — `cn()` ヘルパー（clsx + tailwind-merge）

4. **CSS変数によるテーマ定義**
   - カラーパレット（OKLch色空間推奨）
   - ダークモード対応（`.dark` クラス）
   - 角丸スケール（sm, md, lg, xl）
   - チャートカラー（chart-1 〜 chart-5）

5. **フォント設定**
   - Geist Sans / Geist Mono（またはプロジェクトに合ったフォント）
   - next/font/local での最適化読み込み

6. **追加ユーティリティパッケージ**
   - `class-variance-authority` (CVA) — コンポーネントバリアント
   - `lucide-react` — アイコン
   - `tw-animate-css` — アニメーション

### Step 3: 確認

- `pnpm typecheck` でエラーなし
- ビルド確認
