# PWA Setup

Progressive Web App（PWA）をセットアップする。
プレイブック `docs/design-indie-dev-playbook.md` のセクション6を参照する。

## 手順

### Step 1: 前提確認

- Next.jsプロジェクトが存在するか
- 既存のPWA設定（manifest, sw）があるか
- アプリアイコンの元画像があるか（なければ `/icon` スキルを案内）

### Step 2: 👤 開発者に確認

- アプリ名（name, short_name）
- テーマカラー（ブランドカラー）
- カテゴリ（finance, productivity, social等）
- アイコンの元画像（1024x1024以上）がなければ作成依頼

### Step 3: 🤖 実装（Claudeが行う）

1. **パッケージインストール**
   - `@serwist/next`, `serwist`

2. **Web App Manifest** `app/manifest.ts`
   - name, short_name, start_url, scope, display: "standalone"
   - background_color, theme_color
   - categories, orientation: "portrait"
   - アイコン定義（各サイズ + maskable）

3. **Service Worker** `app/sw.ts`
   - Serwist設定（precache, defaultCache）
   - skip waiting, clients claim
   - Navigation preload
   - オフライン時のフォールバック（/offline）

4. **next.config.ts 更新**
   - `withSerwistInit()` でラップ
   - swSrc, swDest, disable（開発時はfalse）

5. **オフラインページ** `app/offline/page.tsx`
   - オフライン表示 + リロードボタン

6. **Layout更新** `app/layout.tsx`
   - apple-touch-icon リンク
   - apple-mobile-web-app-capable メタタグ
   - theme-color メタタグ

7. **ミドルウェア更新**
   - `/offline` を公開ルートに追加

8. **アイコン生成**（元画像があれば）
   - 72, 96, 128, 144, 152, 192, 384, 512 px
   - maskable 512px
   - apple-touch-icon
   - favicon.ico

### Step 4: 確認

- Lighthouse PWA スコアの確認を案内（👤がDevToolsで実行）
- Service Workerの登録確認
- オフラインページの動作確認
