"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { MemberBalanceList } from "./MemberBalanceList";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { ChevronRight, X } from "lucide-react";
import { buildMemberColorMap } from "@/lib/userColors";
import { useIsMobile } from "@/hooks/useIsMobile";
import { PayPayButton } from "./PayPayButton";
import { trackEvent } from "@/lib/analytics";
import { MemberNameLabel } from "@/components/ui/MemberNameLabel";

type SettlementPreviewProps = {
  groupId: Id<"groups">;
  year: number;
  month: number;
  compact?: boolean;
  memberColors?: Record<string, string>;
};

export function SettlementPreview({
  groupId,
  year,
  month,
  compact = false,
  memberColors: externalMemberColors,
}: SettlementPreviewProps) {
  const preview = useQuery(api.settlements.getPreview, {
    groupId,
    year,
    month,
  });
  const groupDetail = useQuery(
    api.groups.getDetail,
    externalMemberColors ? "skip" : { groupId },
  );
  const memberColors = useMemo(
    () =>
      externalMemberColors ??
      (groupDetail ? buildMemberColorMap(groupDetail.members) : {}),
    [externalMemberColors, groupDetail],
  );

  if (preview === undefined) {
    return <SettlementPreviewSkeleton />;
  }

  if (compact) {
    return (
      <CompactSettlement
        preview={preview}
        memberColors={memberColors}
        groupId={groupId}
        year={year}
        month={month}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      {/* 統計 */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-slate-500">支出数:</span>
          <span className="font-medium">{preview.totalExpenses}件</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-500">合計:</span>
          <span className="font-medium">
            ¥{preview.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 収支一覧 */}
      {preview.balances.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-600 mb-2">
            各メンバーの収支
          </h4>
          <MemberBalanceList
            balances={preview.balances}
            memberColors={memberColors}
            groupId={groupId}
            year={year}
            month={month}
          />
        </div>
      )}

      {/* 精算方法 */}
      {preview.payments.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-600 mb-2">精算方法</h4>
          <div className="space-y-2">
            {preview.payments.map((payment, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"
              >
                <span className="text-sm flex items-center gap-1">
                  {memberColors[payment.fromUserId] && (
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: memberColors[payment.fromUserId],
                      }}
                    />
                  )}
                  <MemberNameLabel
                    name={payment.fromUserName}
                    color={memberColors[payment.fromUserId]}
                  />
                  {" → "}
                  {memberColors[payment.toUserId] && (
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: memberColors[payment.toUserId],
                      }}
                    />
                  )}
                  <MemberNameLabel
                    name={payment.toUserName}
                    color={memberColors[payment.toUserId]}
                  />
                </span>
                <span className="font-medium">
                  ¥{payment.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 支出がない場合 */}
      {preview.totalExpenses === 0 && (
        <div className="text-center text-sm text-slate-500 py-2">
          この期間の支出はありません
        </div>
      )}
    </div>
  );
}

type CompactSettlementProps = {
  preview: {
    totalExpenses: number;
    totalAmount: number;
    balances: {
      userId: Id<"users">;
      displayName: string;
      net: number;
      paid: number;
      owed: number;
    }[];
    payments: {
      fromUserId: Id<"users">;
      fromUserName: string;
      toUserId: Id<"users">;
      toUserName: string;
      amount: number;
    }[];
  };
  memberColors: Record<string, string>;
  groupId: Id<"groups">;
  year: number;
  month: number;
};

function CompactSettlement({
  preview,
  memberColors,
  groupId,
  year,
  month,
}: CompactSettlementProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      {/* コンパクト表示（カード風） */}
      <button
        onClick={() => setModalOpen(true)}
        className="w-full bg-white border border-slate-200 rounded-lg p-3 text-left relative"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-500">精算</span>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </div>
        {preview.payments.length > 0 ? (
          <div className="space-y-1.5">
            {preview.payments.slice(0, 3).map((payment, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-700 flex items-center gap-1">
                  {memberColors[payment.fromUserId] && (
                    <span
                      className="inline-block w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: memberColors[payment.fromUserId],
                      }}
                    />
                  )}
                  <MemberNameLabel
                    name={payment.fromUserName}
                    color={memberColors[payment.fromUserId]}
                  />
                  {" → "}
                  <MemberNameLabel
                    name={payment.toUserName}
                    color={memberColors[payment.toUserId]}
                  />
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-800">
                    ¥{payment.amount.toLocaleString()}
                  </span>
                  {isMobile && (
                    <a
                      href="paypay://"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await navigator.clipboard.writeText(
                          String(payment.amount),
                        );
                        trackEvent("paypay_transfer");
                      }}
                      className="text-[10px] font-bold text-[#FF0033] hover:bg-[#FF0033]/10 px-1.5 py-0.5 rounded"
                    >
                      PayPay
                    </a>
                  )}
                </span>
              </div>
            ))}
            {preview.payments.length > 3 && (
              <div className="text-xs text-blue-600">
                他{preview.payments.length - 3}件の精算
              </div>
            )}
          </div>
        ) : (
          <span className="text-sm text-slate-500">精算なし</span>
        )}
      </button>

      {/* モーダル（ボトムシート） */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-4 max-h-[80dvh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                精算の詳細
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600"
                aria-label="閉じる"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">支出数:</span>
                  <span className="font-medium">{preview.totalExpenses}件</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">合計:</span>
                  <span className="font-medium">
                    ¥{preview.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {preview.balances.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-600 mb-2">
                    各メンバーの収支
                  </h4>
                  <MemberBalanceList
                    balances={preview.balances}
                    memberColors={memberColors}
                    groupId={groupId}
                    year={year}
                    month={month}
                  />
                </div>
              )}

              {preview.payments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-600 mb-2">
                    精算方法
                  </h4>
                  <div className="space-y-2">
                    {preview.payments.map((payment, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-1">
                            {memberColors[payment.fromUserId] && (
                              <span
                                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor:
                                    memberColors[payment.fromUserId],
                                }}
                              />
                            )}
                            <MemberNameLabel
                              name={payment.fromUserName}
                              color={memberColors[payment.fromUserId]}
                            />
                            {" → "}
                            {memberColors[payment.toUserId] && (
                              <span
                                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor:
                                    memberColors[payment.toUserId],
                                }}
                              />
                            )}
                            <MemberNameLabel
                              name={payment.toUserName}
                              color={memberColors[payment.toUserId]}
                            />
                          </span>
                          <span className="font-medium">
                            ¥{payment.amount.toLocaleString()}
                          </span>
                        </div>
                        {isMobile && (
                          <div className="mt-2">
                            <PayPayButton amount={payment.amount} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SettlementPreviewSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex gap-4 mb-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
