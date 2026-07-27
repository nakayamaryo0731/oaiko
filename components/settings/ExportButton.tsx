"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Download, Lock } from "lucide-react";
import { ExportModal } from "./ExportModal";
import { useGroupPremium } from "@/hooks";

type Period =
  | { type: "all" }
  | { type: "year"; year: number }
  | { type: "settlement"; year: number; month: number };

type ExportButtonProps = {
  groupId: Id<"groups">;
  initialPeriod?: Period;
};

export function ExportButton({ groupId, initialPeriod }: ExportButtonProps) {
  const { isAuthenticated } = useConvexAuth();
  const connection = useQuery(
    api.google.getConnection,
    isAuthenticated ? {} : "skip",
  );

  const [open, setOpen] = useState(false);

  const { isPremium } = useGroupPremium(groupId);
  const isConnected = connection?.connected ?? false;

  if (!isPremium) {
    return (
      <Link
        href="/pricing"
        aria-label="エクスポート（Premium）"
        title="エクスポート（Premiumプラン限定）"
        className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
      >
        <Download className="h-5 w-5" />
        <Lock className="absolute bottom-0.5 right-0.5 h-3 w-3 text-yellow-500 bg-white rounded-full" />
      </Link>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="スプレッドシートにエクスポート"
        title="スプレッドシートにエクスポート"
        className="p-2 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50"
      >
        <Download className="h-5 w-5" />
      </button>
      {open && (
        <ExportModal
          groupId={groupId}
          isConnected={isConnected}
          initialPeriod={initialPeriod}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
