# SEO / OGP / Structured Data Setup

SEO対策（メタデータ、OGP、構造化データ）をセットアップする。
プレイブック `docs/design-indie-dev-playbook.md` のセクション5を参照する。

## 手順

### Step 1: 前提確認

- プロダクトのURL（カスタムドメインの有無）
- 既存のメタデータ設定を確認（`app/layout.tsx`）
- OGP画像の有無

### Step 2: 👤 開発者に確認

- カスタムドメイン（例: `https://yourapp.com`）
- Google Search Console のサイト登録 → 所有権確認コード取得
- OGP画像がまだなら `/icon` スキルを案内

### Step 3: 🤖 実装（Claudeが行う）

1. **メタデータ設定** `app/layout.tsx`
   - title, description（日本語）
   - metadataBase（カスタムドメイン）
   - Google Search Console verification

2. **OGP設定**
   - openGraph: title, description, url, siteName, locale, type, images
   - twitter: card ("summary_large_image"), title, description, images

3. **sitemap.ts**
   - 全公開ページのURL、priority、changeFrequency

4. **robots.txt**
   - User-agent, Allow, Sitemap URL

5. **構造化データ（JSON-LD）**
   - **WebApplication** — アプリ名、カテゴリ、料金、OS
   - **FAQPage** — FAQセクションの内容（リッチリザルト対応）

6. **各ページ個別メタデータ**（必要に応じて）
   - Pricing ページ
   - 法務ページ

### Step 4: 確認

- メタタグが正しく出力されるか（ページソースで確認）
- sitemap.xml がアクセスできるか
- robots.txt がアクセスできるか
- OGPデバッガーでの確認を案内（👤が実行）
- Google Search Console への sitemap 送信を案内（👤が実行）
