"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { GroupDetail } from "@/components/groups";
import { GroupDetailSkeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabNavigation } from "@/components/ui/TabNavigation";
import { AdBanner } from "@/components/ads";
import { ClipboardList, BarChart3, Settings } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

type PageProps = {
  params: Promise<{ groupId: string }>;
};

export default function GroupDetailPage({ params }: PageProps) {
  const { groupId } = use(params);
  const router = useRouter();
  const detail = useQuery(api.groups.getDetail, {
    groupId: groupId as Id<"groups">,
  });

  const rightElement = (
    <div className="w-11 h-11 flex items-center justify-center">
      <UserButton />
    </div>
  );

  const handleTabChange = (tabId: string) => {
    if (tabId === "analytics") router.push(`/groups/${groupId}/analytics`);
    else if (tabId === "settings") router.push(`/groups/${groupId}/settings`);
  };

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
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-slate-50">
      <PageHeader
        backHref="/groups?list=true"
        title={detail.group.name}
        rightElement={rightElement}
      />
      <main className="flex-1 min-h-0">
        <div className="max-w-lg mx-auto h-full">
          <GroupDetail group={detail.group} members={detail.members} />
        </div>
      </main>

      <AdBanner aboveTabNav skipPageCheck />

      <TabNavigation
        tabs={[
          { id: "expenses", label: "支出", icon: <ClipboardList /> },
          { id: "analytics", label: "分析", icon: <BarChart3 /> },
          { id: "settings", label: "設定", icon: <Settings /> },
        ]}
        activeTab="expenses"
        onChange={handleTabChange}
      />
    </div>
  );
}
