import { APP_VERSION } from "./version";

// production release時のみversionが焼き込まれるため、v0.0.0 = staging/ローカル
// （lib/version.ts はデプロイワークフローが上書きするのでここに定数を置く）
export const IS_STAGING = APP_VERSION === "v0.0.0";
