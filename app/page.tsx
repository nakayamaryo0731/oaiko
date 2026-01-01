"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { GroupList } from "@/components/groups";
import { GroupListSkeleton } from "@/components/ui/skeleton";
import { AppHeader } from "@/components/ui/AppHeader";
import { LandingPage } from "@/components/landing";

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const ensureUser = useMutation(api.users.ensureUser);
  const [isUserReady, setIsUserReady] = useState(false);

  // 認証後、ユーザーを初期化
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;
    ensureUser()
      .then(() => {
        if (!cancelled) {
          setIsUserReady(true);
        }
      })
      .catch(console.error);

    return () => {
      cancelled = true;
      setIsUserReady(false);
    };
  }, [isAuthenticated, ensureUser]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-slate-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    );
  }

  // 未ログインユーザーにはLPを表示
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader rightElement={<UserButton />} />

      <main className="flex-1 p-4">
        <div className="max-w-lg mx-auto">
          {isUserReady ? <GroupList /> : <GroupListSkeleton />}
        </div>
      </main>
    </div>
  );
}
