# Icon & Image Assets Setup

アプリアイコン、OGP画像、スクリーンショット等の画像アセットを管理する。
プレイブック `docs/design-indie-dev-playbook.md` のセクション5.2（OGP）とセクション6.2-6.3（アイコン）を参照する。

## 手順

### Step 1: 前提確認

- 既存の `public/icons/`, `public/og-image.png` があるか確認
- `app/manifest.ts` の設定を確認

### Step 2: 👤 開発者に確認（手動作業が必要なもの）

以下は開発者がデザインツール（Figma, Canva等）で作成する必要がある:

1. **元ロゴ画像**（1024x1024px以上、PNG、透過背景推奨）
   - これを元に全サイズを自動生成する
2. **OGP画像**（1200x630px、PNG）
   - プロダクト名 + キャッチコピー + ブランドカラー
   - SNSシェア時に表示される画像
3. **LPスクリーンショット**（任意）
   - 実際のアプリ画面をブラウザでキャプチャ

### Step 3: 🤖 実装（Claudeが行う）

元ロゴ画像が `$ARGUMENTS` で指定されたら、以下を実行:

1. **PWAアイコン全サイズ生成**（sharpまたはCLIツール使用）
   - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
   - maskable版 512x512（中心80%セーフゾーン考慮）
   - apple-touch-icon

2. **favicon.ico 生成**
   - 16x16, 32x32 マルチサイズICO

3. **Manifest更新**
   - `app/manifest.ts` にアイコンパス登録

4. **Layout更新**
   - `app/layout.tsx` に apple-touch-icon リンク追加

5. **OGP画像設定**
   - `public/og-image.png` 配置
   - `metadata.openGraph.images` 設定
   - `metadata.twitter` 設定

6. **スクリーンショット配置**（提供された場合）
   - `public/screenshots/` に配置
   - LP内の参照を更新

### Step 4: 確認

- 全アイコンファイルが存在するか
- manifest.ts の設定が正しいか
- OGPデバッガー（https://developers.facebook.com/tools/debug/）での確認を案内
