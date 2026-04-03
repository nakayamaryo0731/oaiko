"use client";

import { ReactNode, useEffect } from "react";
import { ClerkProvider, useAuth, useSession } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { jaJP } from "@clerk/localizations";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const HEARTBEAT_INTERVAL = 30 * 60 * 1000; // 30分

/**
 * セッションを維持するためのキープアライブ。
 * - visibilitychange: バックグラウンド復帰時（iOS PWA / Android Chrome）
 * - focus: PCブラウザのタブ切り替え復帰時
 * - 定期ハートビート: 長時間アクティブ時のトークン失効防止
 *
 * session.touch() が失敗した場合、getToken({ skipCache: true }) で
 * トークンの強制再取得を試みてからサインアウトにフォールバックする。
 */
function SessionKeepAlive() {
  const { session } = useSession();
  const { getToken } = useAuth();

  useEffect(() => {
    if (!session) return;

    const refreshSession = async () => {
      try {
        await session.touch();
      } catch {
        try {
          await getToken({ skipCache: true });
        } catch {
          // 両方失敗した場合はClerkの自動サインアウトに任せる
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshSession();
      }
    };

    const handleFocus = () => {
      refreshSession();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    const heartbeat = setInterval(refreshSession, HEARTBEAT_INTERVAL);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      clearInterval(heartbeat);
    };
  }, [session, getToken]);

  return null;
}

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClerkProvider localization={jaJP}>
      <SessionKeepAlive />
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
