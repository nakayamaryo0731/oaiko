/**
 * Google OAuth トークン管理ヘルパー
 *
 * Pairbo のClerk認証とは独立して、Google Sheets エクスポート専用に
 * Google OAuth トークンを保持・更新する。
 */

import { ConvexError } from "convex/values";

const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_REVOKE_ENDPOINT = "https://oauth2.googleapis.com/revoke";

export type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
};

export class GoogleTokenInvalidError extends Error {
  constructor(
    message = "Googleの連携が無効になりました。再連携してください。",
  ) {
    super(message);
    this.name = "GoogleTokenInvalidError";
  }
}

function getOAuthEnv() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Google OAuth環境変数が設定されていません (GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REDIRECT_URI)",
    );
  }
  return { clientId, clientSecret, redirectUri };
}

async function parseErrorCode(res: Response): Promise<string | null> {
  try {
    const body = await res.json();
    return typeof body?.error === "string" ? body.error : null;
  } catch {
    return null;
  }
}

/**
 * 認可コードをアクセストークン+リフレッシュトークンに交換
 */
export async function exchangeCodeForTokens(
  code: string,
): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret, redirectUri } = getOAuthEnv();

  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Google OAuth code 交換失敗", {
      status: res.status,
      body: errorText,
    });
    throw new ConvexError(`OAuth認可に失敗しました (${res.status})`);
  }

  return (await res.json()) as GoogleTokenResponse;
}

/**
 * リフレッシュトークンでアクセストークンを更新
 *
 * Google側でトークンが revoke された場合は GoogleTokenInvalidError を投げる
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret } = getOAuthEnv();

  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
  });

  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const errorCode = await parseErrorCode(res.clone());
    const errorText = await res.text();
    console.error("Google OAuth refresh 失敗", {
      status: res.status,
      errorCode,
      body: errorText,
    });
    if (errorCode === "invalid_grant") {
      throw new GoogleTokenInvalidError();
    }
    throw new ConvexError(
      `アクセストークンの更新に失敗しました (${res.status})`,
    );
  }

  return (await res.json()) as GoogleTokenResponse;
}

/**
 * トークンを Google 側で revoke する（連携解除時のベストエフォート）
 *
 * 失敗してもクライアントには影響させない。サーバー側ログに残すだけ。
 */
export async function revokeToken(token: string): Promise<void> {
  try {
    const params = new URLSearchParams({ token });
    const res = await fetch(GOOGLE_REVOKE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Google token revoke 失敗", {
        status: res.status,
        body: errorText,
      });
    }
  } catch (e) {
    console.error("Google token revoke 例外", e);
  }
}

/**
 * OAuth 認可URLを構築（クライアント側で window.open する用）
 */
export function buildAuthorizationUrl(state: string): string {
  const { clientId, redirectUri } = getOAuthEnv();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/drive.file",
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
