"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const QUERY_KEY = "welcome";
const QUERY_VALUE = "trial";

/**
 * 招待 accept で Premium trial を取得したユーザーに、初回1度だけ表示する祝福モーダル。
 * URL パラメータ `?welcome=trial` をトリガーとして、見終わったらパラメータを除去する。
 */
export function TrialWelcomeModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const triggeredByQuery = searchParams.get(QUERY_KEY) === QUERY_VALUE;
  const [dismissed, setDismissed] = useState(false);
  const open = triggeredByQuery && !dismissed;

  const trackedRef = useRef(false);
  useEffect(() => {
    if (open && !trackedRef.current) {
      trackedRef.current = true;
      trackEvent("trial_welcome_modal_shown");
    }
  }, [open]);

  const handleClose = () => {
    setDismissed(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete(QUERY_KEY);
    const newQuery = params.toString();
    router.replace(
      typeof window !== "undefined"
        ? `${window.location.pathname}${newQuery ? `?${newQuery}` : ""}`
        : "/",
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Pairbo へようこそ！
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            ご参加ありがとうございます。お礼として今日から
            <span className="font-medium text-slate-900">
              30日間、Premium プランを無料
            </span>
            で体験いただけます。
          </p>

          <ul className="text-sm text-slate-700 space-y-1.5 bg-slate-50 rounded-md p-3">
            <li>• 傾斜折半（収入差に合わせた割り勘）</li>
            <li>• タグで支出を細かく整理</li>
            <li>• 年間の支出推移を分析</li>
            <li>• 広告非表示</li>
          </ul>

          <Button className="w-full" onClick={handleClose}>
            使ってみる
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
