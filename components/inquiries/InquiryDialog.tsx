"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useFormDialog } from "@/hooks/useFormDialog";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { trackEvent } from "@/lib/analytics";
import { Lightbulb, Bug, HelpCircle, Check } from "lucide-react";

type InquiryCategory = "feature_request" | "bug_report" | "other";

const CATEGORIES: {
  value: InquiryCategory;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "feature_request",
    label: "機能要望",
    icon: <Lightbulb className="h-4 w-4" />,
  },
  {
    value: "bug_report",
    label: "不具合報告",
    icon: <Bug className="h-4 w-4" />,
  },
  {
    value: "other",
    label: "その他",
    icon: <HelpCircle className="h-4 w-4" />,
  },
];

const BODY_MAX_LENGTH = 2000;

type InquiryDialogProps = {
  children: React.ReactNode;
};

export function InquiryDialog({ children }: InquiryDialogProps) {
  const [category, setCategory] = useState<InquiryCategory | null>(null);
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const { open, handleOpenChange, isLoading, error, execute } = useFormDialog({
    onReset: () => {
      setCategory(null);
      setBody("");
      setSent(false);
    },
  });

  const createInquiry = useMutation(api.inquiries.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !body.trim() || isLoading) return;

    const result = await execute(
      () => createInquiry({ category, body: body.trim() }),
      { closeOnSuccess: false },
    );

    if (result.success) {
      setSent(true);
      trackEvent("submit_inquiry", { category });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-800">送信しました</p>
              <p className="text-sm text-slate-500 mt-1">
                お問い合わせありがとうございます
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="mt-2"
            >
              閉じる
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>お問い合わせ</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <ErrorAlert message={error} className="rounded-md" />
              <div className="space-y-2">
                <Label>カテゴリ *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm transition-colors ${
                        category === cat.value
                          ? "border-slate-800 bg-slate-50 text-slate-800"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {cat.icon}
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inquiry-body">内容 *</Label>
                <textarea
                  id="inquiry-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="お問い合わせ内容を入力してください"
                  required
                  maxLength={BODY_MAX_LENGTH}
                  rows={5}
                  className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-xs text-slate-400 text-right">
                  {body.length} / {BODY_MAX_LENGTH}
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!category || !body.trim() || isLoading}
              >
                {isLoading ? "送信中..." : "送信する"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
