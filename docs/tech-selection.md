# Oaiko - 技術選定ドキュメント

## プロジェクト概要

- **プロダクト名**: Oaiko（おあいこ）
- **名前の由来**: お相子 = 精算して貸し借りなし
- **コンセプト**: Sharerooを参考にしたWeb版共有家計簿アプリ
- **差別化ポイント**: 割り勘・傾斜折半機能
- **目標**: シンプルな機能で最高のUXを提供
- **スコープ**: 個人利用 → 公開を見越して設計

### 設計方針
- ドメインモデルをちゃんと組む
- テストをちゃんと書く

### MVP機能
詳細は `mvp-features.md` を参照。

---

## フロントエンド選択肢

### React系

| FW | Pros | Cons | 向いているケース |
|---|---|---|---|
| **Next.js (App Router)** | エコシステム最大、Server Components、Vercel最適化 | 複雑化傾向、学習コスト高め | 堅実に行きたい |
| **Next.js (Pages Router)** | 安定、情報豊富、シンプル | 古いパラダイム、RSC使えない | レガシーだが安心 |
| **Remix / React Router v7** | Web標準、Form/Loader/Action明確、エラーハンドリング優秀、nested routes | Next.jsより情報少ない | Web標準重視、フォーム多いアプリ |
| **Vite + React (SPA)** | シンプル、軽量、自由度高い | SSR/SSGなし、SEO弱い | 管理画面系、SEO不要 |
| **TanStack Start** | TanStack Router作者製、型安全routing | 新しすぎる（RC段階） | 冒険したい |

### Svelte系

| FW | Pros | Cons | 向いているケース |
|---|---|---|---|
| **SvelteKit** | 記述量最少、軽量高速、runes(v5)でより洗練 | エコシステム小、採用実績少なめ | シンプルさ・UX重視 |

### Solid系

| FW | Pros | Cons | 向いているケース |
|---|---|---|---|
| **SolidStart** | fine-grained reactivity、React似で高速、シグナルベース | エコシステム小、1.0出たばかり | パフォーマンス重視 |

### その他

| FW | Pros | Cons | 向いているケース |
|---|---|---|---|
| **Qwik + Qwik City** | Resumability、初期ロード最速 | 新しすぎる、パラダイム特殊 | 実験的 |
| **Angular** | 堅牢、DI組み込み、大規模向け | 重い、個人開発にはオーバーキル | エンタープライズ |

### モバイル展開を見据えるなら

| 選択肢 | 説明 |
|---|---|
| **PWA** | Web技術のみ、インストール可能。家計簿なら十分 |
| **Capacitor** | Web→ネイティブラップ。後からネイティブ化可能 |
| **Expo (React Native)** | 将来iOS/Android両対応したいなら |

---

## バックエンド選択肢

### BaaS / マネージドDB

| サービス | Pros | Cons | ドメインモデル・テスト |
|---|---|---|---|
| **Supabase** | PostgreSQL、Auth、リアルタイム、Edge Functions | ロジック分散しがち、テストやや手間 | △〜○ Edge Functionsで分離可能 |
| **Firebase** | リアルタイム強い、Google安定 | NoSQL制約、複雑クエリ苦手、ロックイン強 | △ |
| **Convex** | TypeScript first、リアクティブ、テスト書きやすい | 新しめ、ベンダーロックイン | ○ |
| **PocketBase** | 軽量、Go製、セルフホスト、1バイナリ | スケーラビリティ、本番運用の実績少なめ | △ |
| **Appwrite** | OSS、セルフホスト可、機能豊富 | 重め、設定多い | △ |
| **Nhost** | Hasura + Auth、GraphQL自動生成 | Hasura依存、学習コスト | ○ |

### API Framework

| FW | Pros | Cons | 向いているケース |
|---|---|---|---|
| **Hono** | 軽量、マルチランタイム(CF Workers/Deno/Bun/Node)、Web標準 | エコシステムまだ成長中 | エッジ、軽量API |
| **Elysia** | Bun最適化、高速、型推論強い | Bun依存 | Bun使いたい |
| **tRPC** | End-to-end型安全、DX最高 | RPCパターン、REST/GraphQLではない | フルスタックTS |
| **Fastify** | Node最速クラス、プラグイン豊富 | Expressより情報少ない | Node.js API |
| **NestJS** | DI、デコレータ、構造化、Angular風 | 重い、ボイラープレート多い | エンタープライズ |
| **Express** | 定番、情報最多 | 古い、型サポート弱い | レガシー |

### ORM / Query Builder

| ライブラリ | Pros | Cons |
|---|---|---|
| **Drizzle** | 軽量、型安全、SQLに近い、エッジ対応 | Prismaより機能少なめ |
| **Prisma** | DX良い、マイグレーション便利、型生成 | 重い、エッジで制限あり |
| **Kysely** | 型安全Query Builder、軽量 | ORM機能なし |

### DB

| DB | Pros | Cons |
|---|---|---|
| **PostgreSQL (Neon/Supabase)** | RDB王道、柔軟、サーバーレス対応進んでる | - |
| **Turso (libSQL)** | SQLite互換、エッジ対応、レプリカ | 新しめ |
| **PlanetScale** | MySQL、スケーラブル、ブランチング | 無料枠縮小傾向 |

### 認証

| サービス | Pros | Cons |
|---|---|---|
| **Clerk** | DX最高、UIコンポーネント付き、無料枠十分 | ベンダーロックイン |
| **Supabase Auth** | Supabase統合、無料 | Supabase依存 |
| **Auth.js (NextAuth)** | OSS、カスタマイズ可 | 設定多め |
| **Lucia** | 軽量、フレームワーク非依存 | 自前実装多め |
| **WorkOS** | エンタープライズSSO | B2B向け |

---

## 構成パターン案

### 案A: Next.js + tRPC + Drizzle + Neon + Clerk

```
Frontend: Next.js App Router
API: tRPC (Next.js内)
ORM: Drizzle
DB: Neon (PostgreSQL)
Auth: Clerk
Deploy: Vercel
```

- **メリット**: End-to-end型安全、DX良い、テスト書きやすい、デプロイ簡単
- **デメリット**: Next.js + tRPCの組み合わせに慣れが必要

### 案B: Remix + Drizzle + Turso + Clerk

```
Frontend: Remix
ORM: Drizzle
DB: Turso (SQLite edge)
Auth: Clerk
Deploy: Cloudflare Pages / Vercel
```

- **メリット**: Web標準、Form handling優秀、軽量、エッジ対応
- **デメリット**: Next.jsより情報少ない

### 案C: SvelteKit + Hono + Drizzle + Neon + Lucia

```
Frontend: SvelteKit
API: Hono (SvelteKit内 or 別サービス)
ORM: Drizzle
DB: Neon
Auth: Lucia
Deploy: Vercel / Cloudflare
```

- **メリット**: 最もシンプル、記述量少ない、軽量
- **デメリット**: エコシステム小さい

### 案D: Next.js + Hono + Drizzle + Supabase(DBのみ) + Supabase Auth

```
Frontend: Next.js App Router
API: Hono (Cloudflare Workers)
ORM: Drizzle
DB: Supabase PostgreSQL
Auth: Supabase Auth
Deploy: Vercel + Cloudflare
```

- **メリット**: ドメインロジックをHonoに集約、テストしやすい
- **デメリット**: インフラ2箇所

### 案E: SolidStart + tRPC + Drizzle + Turso

```
Frontend: SolidStart
API: tRPC
ORM: Drizzle
DB: Turso
Auth: Clerk
```

- **メリット**: 高速、fine-grained reactivity、将来性
- **デメリット**: まだ新しい、情報少ない

### 案F: Next.js + Convex

```
Frontend: Next.js
Backend: Convex (DB + API + リアルタイム)
Auth: Clerk or Convex Auth
```

- **メリット**: リアルタイム同期が簡単、TypeScript first、テストしやすい
- **デメリット**: Convexへのロックイン

---

## 推奨順位

| 優先度 | 構成 | 理由 |
|--------|------|------|
| **1位** | 案A: Next.js + tRPC + Drizzle + Neon + Clerk | 型安全、テスト書きやすい、エコシステム充実、デプロイ簡単 |
| **2位** | 案B: Remix + Drizzle + Turso + Clerk | Web標準でシンプル、Form handling優秀、軽量 |
| **3位** | 案F: Next.js + Convex | 開発速度最速、リアルタイム同期が共有家計簿に合う |

---

## 検討ポイント

### ドメインモデル設計に関して
- tRPCやHonoを使う場合、ドメインロジックをAPI層に集約しやすい
- Convexは関数ベースでドメインロジックを書きやすい
- BaaS直接利用はロジックがフロントに散らばりがち

### テストに関して
- tRPC: router単位でテスト可能
- Hono: 純粋な関数としてテスト可能
- Convex: 専用のテストユーティリティあり
- Drizzle/Prisma: DBテストはテストコンテナ等で対応

### 共有家計簿特有の考慮点
- リアルタイム同期: Convex、Supabase Realtimeが強い
- オフライン対応: PWA + ローカルストレージ or IndexedDB
- 金額計算: 浮動小数点注意、Decimal.js等の使用を検討

---

## 方針決定

**Webアプリで可能な限り最高のUXを目指す**

### なぜWebか
- Sharerooにない「プラットフォーム非依存」という明確な差別化
- 個人開発として現実的なスコープ
- URLで招待できる（アプリインストール不要）
- PC対応も自然にできる

### Webで最高のUXを実現するための指針

#### 1. モバイルファースト徹底
- デスクトップは後回し、スマホでの体験を最優先
- タッチ操作に最適化（タップ領域、スワイプ等）
- 片手操作を意識したレイアウト

#### 2. 入力UXへの徹底的なこだわり
- **目標: 3タップ以内で記録完了**
- 金額入力は専用キーパッド（ネイティブキーボード回避）
- よく使うカテゴリ・支払者をワンタップ選択
- 直近の入力パターンを学習・提案

#### 3. PWA対応必須
- ホーム画面追加を促すUI
- アプリアイコン、スプラッシュスクリーン
- オフライン時の基本動作（後述）

#### 4. パフォーマンス
- 初期ロード3秒以内
- インタラクション即座（Optimistic UI）
- 軽量なバンドルサイズ

#### 5. オフライン対応（段階的）
- Phase 1: オフライン時に入力をローカル保存、復帰時に同期
- Phase 2: 過去データのローカルキャッシュ

#### 6. 将来のネイティブ化を視野に
- Capacitor対応しやすい構成
- Web APIで実現できる範囲を把握しておく

---

## 決定事項

**採用構成: 案F - Next.js + Convex**

```
Frontend: Next.js (App Router)
Backend: Convex (DB + API + リアルタイム)
Auth: Clerk or Convex Auth
Deploy: Vercel + Convex
IaC: 不要（Convexスキーマ = インフラ定義）
```

### 選定理由
- リアルタイム同期が組み込み（共有家計簿に最適）
- Optimistic UIがデフォルト（サクサク動作）
- TypeScript first、テスト書きやすい
- IaC不要でアプリコードに集中できる
- 無料枠が個人開発に十分

### 許容したトレードオフ
- Convexへのベンダーロックイン
- 独自クエリ言語の学習

---

## 次のステップ

1. [x] 技術スタック決定
2. [x] プロジェクト名決定 → **Oaiko**
3. [ ] 初期セットアップ（Next.js + Convex）
4. [ ] ドメインモデル設計
5. [ ] DB スキーマ設計
