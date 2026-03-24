# Testing Setup

テスト基盤をセットアップする。
プレイブック `docs/design-indie-dev-playbook.md` のセクション9を参照する。

## 手順

### Step 1: 前提確認

- 既存のテスト設定があるか（vitest.config.mts等）
- バックエンドの種類（Convex / 他）
- テスト対象のコードがあるか

### Step 2: 🤖 実装（すべてClaude側で実行可能）

1. **パッケージインストール**
   - `vitest` — テストランナー
   - `@vitest/coverage-v8` — カバレッジ
   - `convex-test` — Convex関数テスト（Convex使用時）
   - `@edge-runtime/vm` — Edge runtime環境（Convex使用時）

2. **Vitest設定** `vitest.config.mts`

   ```typescript
   test: {
     globals: true,
     testTimeout: 10000,
     environment: "edge-runtime",
     include: ["convex/**/*.test.ts", "lib/**/*.test.ts"],
     coverage: {
       provider: "v8",
       reporter: ["text", "json", "html"],
     },
   }
   ```

3. **package.json scripts 追加**
   - `test` — `vitest`（watchモード）
   - `test:run` — `vitest run`（CI用）
   - `test:unit` — `vitest run`
   - `test:integration` — `vitest run **/*.integration.test.ts --passWithNoTests`
   - `test:coverage` — `vitest run --coverage`

4. **テストディレクトリ作成**
   - `convex/__tests__/` — Convex関数テスト
   - 命名規約: `*.test.ts`（ユニット）、`*.integration.test.ts`（結合）

5. **サンプルテスト作成**
   - 既存のConvex関数に対する基本テスト1つを作成
   - テストパターンの参考例として

6. **CI連携**
   - `.github/workflows/ci.yml` にテストジョブを追加（まだなければ）

### Step 3: 確認

- `pnpm test:run` で全テストパス
- カバレッジレポートの確認
