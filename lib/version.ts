/**
 * デプロイされているアプリのバージョン。
 *
 * - main HEAD（= staging）では常に "v0.0.0"。
 * - production deploy 時に GitHub Actions の "Deploy" workflow が
 *   入力された version で本ファイルを書き換え、production branch に
 *   コミットする（その branch を Netlify が auto-build するので、
 *   ビルドされたバンドルにはタグ名が焼き込まれる）。
 */
export const APP_VERSION = "v0.0.0";
