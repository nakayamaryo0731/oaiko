"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { GroupSettings } from "@/components/groups";
import { PageHeader } from "@/components/ui/PageHeader";
import { TabNavigation } from "@/components/ui/TabNavigation";
import { ClipboardList, BarChart3, Settings } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { buildMemberColorMap } from "@/lib/userColors";

type PageProps = {
  params: Promise<{ groupId: string }>;
};

export default function GroupSettingsPage({ params }: PageProps) {
  const { groupId } = use(params);
  const router = useRouter();
  const detail = useQuery(api.groups.getDetail, {
    groupId: groupId as Id<"groups">,
  });

  const handleTabChange = (tabId: string) => {
    if (tabId === "expenses") router.push(`/groups/${groupId}`);
    else if (tabId === "analytics") router.push(`/groups/${groupId}/analytics`);
  };

  if (detail === undefined) {
    return (
      <div className="flex min-h-screen flex-col pb-14">
        <PageHeader
          backHref="/groups?list=true"
          isLoading
          rightElement={
            <div className="w-11 h-11 flex items-center justify-center">
              <UserButton />
            </div>
          }
        />
        <main className="flex-1 p-4">
          <div className="max-w-lg mx-auto">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-slate-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        </main>
        <TabNavigation
          tabs={[
            { id: "expenses", label: "支出", icon: <ClipboardList /> },
            { id: "analytics", label: "分析", icon: <BarChart3 /> },
            { id: "settings", label: "設定", icon: <Settings /> },
          ]}
          activeTab="settings"
          onChange={handleTabChange}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col pb-14">
      <PageHeader
        backHref="/groups?list=true"
        title={detail.group.name}
        rightElement={
          <div className="w-11 h-11 flex items-center justify-center">
            <UserButton />
          </div>
        }
      />
      <main className="flex-1 p-4">
        <div className="max-w-lg mx-auto">
          <GroupSettings
            group={detail.group}
            members={detail.members}
            categories={detail.categories}
            myRole={detail.myRole}
            memberColors={buildMemberColorMap(detail.members)}
          />
        </div>
      </main>

      <TabNavigation
        tabs={[
          { id: "expenses", label: "支出", icon: <ClipboardList /> },
          { id: "analytics", label: "分析", icon: <BarChart3 /> },
          { id: "settings", label: "設定", icon: <Settings /> },
        ]}
        activeTab="settings"
        onChange={handleTabChange}
      />
    </div>
  );
}
