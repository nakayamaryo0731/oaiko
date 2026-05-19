"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Bell } from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
  getVisibleReleasesDesc,
  hasUnreadRelease,
  type Release,
} from "@/lib/releases";
import { ReleaseModal } from "./ReleaseModal";
import { ReleaseListModal } from "./ReleaseListModal";

type View =
  | { type: "closed" }
  | { type: "list" }
  | { type: "detail"; release: Release };

export function NotificationBell() {
  const me = useQuery(api.users.getMe);
  const subscription = useQuery(api.subscriptions.getMySubscription);
  const markRead = useMutation(api.users.markReleasesRead);
  const [view, setView] = useState<View>({ type: "closed" });

  if (!me || subscription === undefined) {
    return <div className="w-11 h-11" aria-hidden />;
  }

  const all = getVisibleReleasesDesc({
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd ?? null,
  });

  if (all.length === 0) {
    return <div className="w-11 h-11" aria-hidden />;
  }

  const latest = all[0];
  // 既に Premium（Stripe 課金 / Pairbo trial / admin planOverride いずれも含む）なら
  // ReleaseModal の CTA は「体験中」表示にする。trialExpiresAt 単独では admin override の
  // ケースを拾えないので plan ベースで判定する。
  const isAlreadyPremium = subscription.plan === "premium";
  const hasUnread = hasUnreadRelease(me.lastSeenReleaseAt, all);

  const handleOpen = () => {
    setView({ type: "detail", release: latest });
    markRead().catch(() => {});
  };

  const handleClose = () => setView({ type: "closed" });
  const handleShowList = () => setView({ type: "list" });
  const handleItemClick = (r: Release) =>
    setView({ type: "detail", release: r });

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="relative w-11 h-11 flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors"
        aria-label={hasUnread ? "新着のお知らせ" : "お知らせ"}
      >
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {view.type === "list" && (
        <ReleaseListModal
          releases={all}
          onClose={handleClose}
          onItemClick={handleItemClick}
        />
      )}

      {view.type === "detail" && (
        <ReleaseModal
          release={view.release}
          isAlreadyPremium={isAlreadyPremium}
          onClose={handleClose}
          onBack={handleShowList}
        />
      )}
    </>
  );
}
