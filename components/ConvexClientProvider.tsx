"use client";

import { ReactNode, useEffect } from "react";
import { ClerkProvider, useAuth, useSession } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { jaJP } from "@clerk/localizations";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * PWAがバックグラウンドから復帰した時にClerkセッションをリフレッシュする。
 * iOS PWAではプロセスが kill されるとインメモリのトークンが失われるため、
 * visibilitychange で明示的に touch して再ログインを防ぐ。
 */
function SessionKeepAlive() {
  const { session } = useSession();

  useEffect(() => {
    if (!session) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        session.touch().catch(() => {
          // セッションが無効な場合は何もしない（Clerkが自動でサインアウト処理する）
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [session]);

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
