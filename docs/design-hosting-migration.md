# 設計書: ホスティング移行（Vercel → Netlify）

## Overview

Vercel Hobbyプランから Netlify Free プランに移行する。

## Purpose

### 背景

Vercel Hobbyプランの利用規約（Fair Use Policy）は **商用利用を禁止** している。
Pairboは Stripe で有料プラン（Premium）を販売しており、商用利用に該当するため TOS 違反のリスクがある。

### 要件

- ランニングコスト $0（収益化前のため）
- 商用利用OK
- 既存ユーザーへのダウンタイムなし

## 検討した選択肢

### 1. Vercel Pro（$20/月）

- メリット: 移行不要
- デメリット: 月額コストが収益化前のプロダクトには重い
- **却下**: コスト

### 2. Cloudflare Pages（無料）

- メリット: 無料・商用OK、CDN高速、Workers のコールドスタートなし
- デメリット: **Worker サイズ制限 3MiB（無料）/ 10MiB（$5/月）**
- **検証結果**: Pairboのバンドルが約17MBで、Sentry等を除去しても3MiBは不可能。$5/月プランでも Sentry サーバー側除去が必要
- **却下**: バンドルサイズ制限

### 3. Cloudflare Workers 有料プラン（$5/月）

- メリット: Cloudflare の高性能基盤、10MiB まで対応
- デメリット: 月額コスト発生、Sentry サーバー側の除去が必要
- **却下**: コスト + 技術的制約

### 4. Netlify Free（$0/月）← 採用

- メリット: 無料・商用OK、バンドルサイズ制限が緩い（50MB）、Next.js サポートあり
- デメリット: ビルド300分/月、帯域100GB/月、サーバーレス関数125K/月
- **採用理由**: Pairboはバックエンドが Convex のため Netlify 側の制限にほぼ抵触しない。収益化後に上位プランやCloudflareに移行可能

## バンドルサイズ調査結果

Cloudflare Workers デプロイ時にサイズ超過で失敗。内訳:

| コンポーネント                  | サイズ     | 備考                                  |
| ------------------------------- | ---------- | ------------------------------------- |
| handler.mjs（サーバーバンドル） | 17,403 KiB | Sentry, Clerk, Next.js ランタイム含む |
| @vercel/og resvg.wasm           | 1,346 KiB  | Next.js内蔵、未使用                   |
| middleware handler.mjs          | 848 KiB    | Clerk認証ミドルウェア                 |
| @vercel/og index.edge.js        | 797 KiB    | Next.js内蔵、未使用                   |

主な原因:

- Sentry サーバー側: 5-10MB
- Clerk backend SDK: 1-2MB
- Next.js ランタイム: 2-3MB

## 将来の移行パス

ユーザー数・収益が伸びた場合:

1. **Netlify Pro**（$19/月）— ビルド時間・帯域が不足した場合
2. **Cloudflare Workers $5/月** — Sentry サーバー側を除去してバンドル最適化
3. **Vercel Pro**（$20/月）— 最も互換性が高いが高コスト

## 決定日

2026-03-24
