"use client";

import { use, useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { GroupDetail } from "@/components/groups";
import { GroupSettings } from "@/components/groups";
import { AnalyticsContent } from "@/components/analytics/AnalyticsContent";
import { GroupDetailSkeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabNavigation } from "@/components/ui/TabNavigation";
import { AdBanner } from "@/components/ads";
import { ClipboardList, BarChart3, Settings } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { buildMemberColorMap } from "@/lib/userColors";

type PageProps = {
  params: Promise<{ groupId: string }>;
};

type TabId = "expenses" | "analytics" | "settings";

const TAB_URL_MAP: Record<TabId, string> = {
  expenses: "",
  analytics: "/analytics",
  settings: "/settings",
};

function getInitialTab(): TabId {
  if (typeof window === "undefined") return "expenses";
  const path = window.location.pathname;
  if (path.endsWith("/analytics")) return "analytics";
  if (path.endsWith("/settings")) return "settings";
  return "expenses";
}

export default function GroupDetailPage({ params }: PageProps) {
  const { groupId } = use(params);
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);
  const detail = useQuery(api.groups.getDetail, {
    groupId: groupId as Id<"groups">,
  });

  const memberColors = useMemo(
    () => (detail ? buildMemberColorMap(detail.members) : {}),
    [detail],
  );

  useEffect(() => {
    const url = `/groups/${groupId}${TAB_URL_MAP[activeTab]}`;
    if (window.location.pathname !== url) {
      window.history.replaceState(null, "", url);
    }
  }, [activeTab, groupId]);

  const rightElement = (
    <div className="w-11 h-11 flex items-center justify-center">
      <UserButton />
    </div>
  );

  const tabs = [
    { id: "expenses", label: "支出", icon: <ClipboardList /> },
    { id: "analytics", label: "分析", icon: <BarChart3 /> },
    { id: "settings", label: "設定", icon: <Settings /> },
  ];

  if (detail === undefined) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PageHeader
          backHref="/groups?list=true"
          isLoading
          rightElement={rightElement}
        />
        <main className="p-4">
          <div className="max-w-lg mx-auto">
            <GroupDetailSkeleton />
          </div>
        </main>
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as TabId)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        backHref="/groups?list=true"
        title={detail.group.name}
        rightElement={rightElement}
      />
      <main>
        <div className="max-w-lg mx-auto">
          {activeTab === "expenses" && (
            <GroupDetail group={detail.group} members={detail.members} />
          )}
          {activeTab === "analytics" && (
            <AnalyticsContent
              groupId={groupId}
              closingDay={detail.group.closingDay}
            />
          )}
          {activeTab === "settings" && (
            <GroupSettings
              group={detail.group}
              members={detail.members}
              categories={detail.categories}
              myRole={detail.myRole}
              memberColors={memberColors}
            />
          )}
        </div>
      </main>

      {activeTab === "expenses" && <AdBanner aboveTabNav skipPageCheck />}

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as TabId)}
      />
    </div>
  );
}
