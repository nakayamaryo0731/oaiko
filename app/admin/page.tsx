"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const PAGE_SIZE = 20;

export default function AdminDashboard() {
  const summary = useQuery(api.admin.getSummary);
  const users = useQuery(api.admin.getUsers);
  const groups = useQuery(api.admin.getGroups);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800">
            Pairbo Admin Dashboard
          </h1>
          <Link
            href="/groups"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← アプリに戻る
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        <SummaryCards summary={summary} />
        <UserTable users={users} />
        <GroupTable groups={groups} />
      </main>
    </div>
  );
}

/* ========== Summary Cards ========== */

type Summary = {
  totalUsers: number;
  dau: number;
  wau: number;
  mau: number;
  totalGroups: number;
  totalExpenses: number;
  premiumCount: number;
};

function SummaryCards({ summary }: { summary: Summary | undefined }) {
  const cards = summary
    ? [
        { label: "総ユーザー", value: summary.totalUsers },
        { label: "DAU", value: summary.dau },
        { label: "WAU", value: summary.wau },
        { label: "MAU", value: summary.mau },
        { label: "グループ数", value: summary.totalGroups },
        { label: "支出件数", value: summary.totalExpenses.toLocaleString() },
        { label: "Premium", value: summary.premiumCount },
      ]
    : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {cards
        ? cards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-lg border border-slate-200 p-4"
            >
              <p className="text-xs text-slate-500 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            </div>
          ))
        : Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-slate-200 p-4"
            >
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
    </div>
  );
}

/* ========== User Table ========== */

type UserRow = {
  _id: string;
  displayName: string;
  createdAt: number;
  plan: string;
  groupCount: number;
  expenseCount: number;
  lastActivity: number | null;
};

function UserTable({ users }: { users: UserRow[] | undefined }) {
  const [page, setPage] = useState(0);
  const totalPages = users ? Math.ceil(users.length / PAGE_SIZE) : 0;
  const pagedUsers = users?.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <section>
      <h2 className="text-lg font-bold text-slate-800 mb-3">
        ユーザー一覧
        {users && (
          <span className="text-sm font-normal text-slate-500 ml-2">
            ({users.length}件)
          </span>
        )}
      </h2>
      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                表示名
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                登録日
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                プラン
              </th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">
                グループ
              </th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">
                支出数
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                最終活動
              </th>
            </tr>
          </thead>
          <tbody>
            {pagedUsers ? (
              pagedUsers.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-3 text-slate-800">{u.displayName}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <PlanBadge plan={u.plan} />
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {u.groupCount}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {u.expenseCount}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {u.lastActivity ? formatDate(u.lastActivity) : "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <Skeleton className="h-4 w-48 mx-auto" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </section>
  );
}

/* ========== Group Table ========== */

type GroupRow = {
  _id: string;
  name: string;
  createdAt: number;
  memberCount: number;
  expenseCount: number;
  totalAmount: number;
};

function GroupTable({ groups }: { groups: GroupRow[] | undefined }) {
  const [page, setPage] = useState(0);
  const totalPages = groups ? Math.ceil(groups.length / PAGE_SIZE) : 0;
  const pagedGroups = groups?.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <section>
      <h2 className="text-lg font-bold text-slate-800 mb-3">
        グループ一覧
        {groups && (
          <span className="text-sm font-normal text-slate-500 ml-2">
            ({groups.length}件)
          </span>
        )}
      </h2>
      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                グループ名
              </th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">
                メンバー
              </th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">
                支出件数
              </th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">
                総支出額
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                作成日
              </th>
            </tr>
          </thead>
          <tbody>
            {pagedGroups ? (
              pagedGroups.map((g) => (
                <tr
                  key={g._id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-3 text-slate-800">{g.name}</td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {g.memberCount}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {g.expenseCount}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    ¥{g.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(g.createdAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <Skeleton className="h-4 w-48 mx-auto" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </section>
  );
}

/* ========== Pagination ========== */

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
      <p className="text-xs text-slate-500">
        {page + 1} / {totalPages} ページ
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          前へ
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          次へ
        </button>
      </div>
    </div>
  );
}

/* ========== Helpers ========== */

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function PlanBadge({ plan }: { plan: string }) {
  if (plan === "premium") {
    return (
      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
        Premium
      </span>
    );
  }
  return (
    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
      Free
    </span>
  );
}
