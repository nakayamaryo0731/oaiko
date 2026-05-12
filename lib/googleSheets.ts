/**
 * Google Sheets エクスポート用のクライアントヘルパー
 *
 * OAuth ポップアップを開いて code を受け取り、Convex action で
 * アクセストークンに交換する。
 */

export type OAuthSuccess = { ok: true; code: string; state: string };
export type OAuthFailure = { ok: false; error: string };
export type OAuthResult = OAuthSuccess | OAuthFailure;

const POPUP_WIDTH = 520;
const POPUP_HEIGHT = 640;

// popup.closed 検出から settle までの猶予。
// postMessage と window.close() がほぼ同時に起きるブラウザがあるため、
// 即座に settle("popup_closed") するとメッセージを取り逃がすことがある。
const POPUP_CLOSE_GRACE_MS = 400;

/**
 * ポップアップを開いて Google OAuth 認可フローを実行
 *
 * @param authUrl - Convex action から取得した認可URL（state含む）
 * @param expectedState - 認可URLに含めた state（CSRF検証用）
 */
export function openGoogleOAuthPopup(
  authUrl: string,
  expectedState: string,
): Promise<OAuthResult> {
  return new Promise((resolve) => {
    const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2;
    const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2;

    const popup = window.open(
      authUrl,
      "pairbo-google-oauth",
      `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top}`,
    );

    if (!popup) {
      resolve({ ok: false, error: "popup_blocked" });
      return;
    }

    let settled = false;
    let closeTimer: ReturnType<typeof setTimeout> | null = null;
    const settle = (result: OAuthResult) => {
      if (settled) return;
      settled = true;
      window.removeEventListener("message", handleMessage);
      clearInterval(closedPoll);
      if (closeTimer) clearTimeout(closeTimer);
      resolve(result);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.type !== "pairbo-google-oauth") return;

      if (!data.ok) {
        settle({ ok: false, error: data.error ?? "unknown_error" });
        return;
      }

      if (data.state !== expectedState) {
        settle({ ok: false, error: "state_mismatch" });
        return;
      }

      settle({ ok: true, code: data.code, state: data.state });
    };

    window.addEventListener("message", handleMessage);

    // ポップアップが閉じられた場合の検知（メッセージ到着の猶予を設ける）
    const closedPoll = setInterval(() => {
      if (!popup.closed || closeTimer) return;
      closeTimer = setTimeout(
        () => settle({ ok: false, error: "popup_closed" }),
        POPUP_CLOSE_GRACE_MS,
      );
    }, 300);
  });
}
