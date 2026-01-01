"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { GroupDetail } from "@/components/groups/GroupDetail";
import { GroupDetailSkeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Settings, ShoppingCart, BarChart3, ChevronLeft } from "lucide-react";

type PageProps = {
  params: Promise<{ groupId: string }>;
};

export default function GroupDetailPage({ params }: PageProps) {
  const { groupId } = use(params);
  const detail = useQuery(api.groups.getDetail, {
    groupId: groupId as Id<"groups">,
  });

  if (detail === undefined) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-4 h-14">
            <Link
              href="/"
              className="text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <div className="h-5 w-24 bg-slate-100 rounded animate-pulse" />
            <div className="flex items-center gap-1">
              <div className="w-9 h-9" />
              <div className="w-9 h-9" />
              <div className="w-9 h-9" />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4">
          <div className="max-w-lg mx-auto">
            <GroupDetailSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 h-14">
          <Link
            href="/"
            className="text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-semibold">{detail.group.name}</h1>
          <div className="flex items-center gap-1">
            <Link
              href={`/groups/${detail.group._id}/analytics`}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <BarChart3 className="h-5 w-5 text-slate-600" />
            </Link>
            <Link
              href={`/groups/${detail.group._id}/shopping`}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-slate-600" />
            </Link>
            <Link
              href={`/groups/${detail.group._id}/settings`}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5 text-slate-600" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="max-w-lg mx-auto">
          <GroupDetail group={detail.group} />
        </div>
      </main>
    </div>
  );
}
