"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { SettlementDetail } from "@/components/settlements";
import { PageHeader } from "@/components/ui/PageHeader";

type PageProps = {
  params: Promise<{
    groupId: string;
    settlementId: string;
  }>;
};

export default function SettlementDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const settlementId = resolvedParams.settlementId as Id<"settlements">;
  const groupId = resolvedParams.groupId as Id<"groups">;

  const settlement = useQuery(api.settlements.getById, { settlementId });

  return (
    <main className="min-h-screen bg-slate-50">
      <PageHeader backHref={`/groups/${groupId}`} title="精算詳細" />

      {/* コンテンツ */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {settlement === undefined ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto" />
          </div>
        ) : settlement === null ? (
          <div className="text-center py-12 text-slate-500">
            精算が見つかりません
          </div>
        ) : (
          <SettlementDetail settlementId={settlementId} />
        )}
      </div>
    </main>
  );
}
