"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { InviteDialog } from "./InviteDialog";
import { CategoryManager } from "@/components/categories";
import {
  Calendar,
  Users,
  Tag,
  ShoppingCart,
  Pencil,
  Check,
  X,
  Home,
  ChevronRight,
} from "lucide-react";

type Category = {
  _id: Id<"categories">;
  name: string;
  icon: string;
  isPreset: boolean;
};

type Member = {
  _id: Id<"groupMembers">;
  userId: Id<"users">;
  displayName: string;
  avatarUrl?: string;
  role: "owner" | "member";
  joinedAt: number;
  isMe: boolean;
};

type GroupSettingsProps = {
  group: {
    _id: Id<"groups">;
    name: string;
    description?: string;
    closingDay: number;
  };
  members: Member[];
  categories: Category[];
  myRole: "owner" | "member";
};

export function GroupSettings({
  group,
  members,
  categories,
  myRole,
}: GroupSettingsProps) {
  const [editingGroupName, setEditingGroupName] = useState(false);
  const [groupName, setGroupName] = useState(group.name);
  const [editingClosingDay, setEditingClosingDay] = useState(false);
  const [closingDay, setClosingDay] = useState(group.closingDay);
  const [editingDisplayName, setEditingDisplayName] = useState(false);
  const [displayName, setDisplayName] = useState(
    members.find((m) => m.isMe)?.displayName ?? "",
  );

  const updateGroupName = useMutation(api.groups.updateName);
  const updateClosingDay = useMutation(api.groups.updateClosingDay);
  const updateDisplayName = useMutation(api.users.updateDisplayName);

  const handleGroupNameSave = async () => {
    if (groupName.trim() === "") return;
    try {
      await updateGroupName({ groupId: group._id, name: groupName.trim() });
      setEditingGroupName(false);
    } catch {
      setGroupName(group.name);
    }
  };

  const handleClosingDaySave = async () => {
    if (closingDay < 1 || closingDay > 28) return;
    try {
      await updateClosingDay({ groupId: group._id, closingDay });
      setEditingClosingDay(false);
    } catch {
      setClosingDay(group.closingDay);
    }
  };

  const handleDisplayNameSave = async () => {
    if (displayName.trim() === "") return;
    try {
      await updateDisplayName({ displayName: displayName.trim() });
      setEditingDisplayName(false);
    } catch {
      setDisplayName(members.find((m) => m.isMe)?.displayName ?? "");
    }
  };

  return (
    <div className="space-y-6">
      {/* グループ名 */}
      <section className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <Home className="h-5 w-5 text-slate-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-500">グループ名</p>
            {editingGroupName ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={50}
                  autoFocus
                />
                <button
                  onClick={handleGroupNameSave}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setGroupName(group.name);
                    setEditingGroupName(false);
                  }}
                  className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-800">{group.name}</p>
                {myRole === "owner" && (
                  <button
                    onClick={() => setEditingGroupName(true)}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 締め日 */}
      <section className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <Calendar className="h-5 w-5 text-slate-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-500">締め日</p>
            {editingClosingDay ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-600">毎月</span>
                <select
                  value={closingDay}
                  onChange={(e) => setClosingDay(Number(e.target.value))}
                  className="px-2 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-slate-600">日</span>
                <button
                  onClick={handleClosingDaySave}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setClosingDay(group.closingDay);
                    setEditingClosingDay(false);
                  }}
                  className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-800">
                  毎月 {group.closingDay} 日
                </p>
                {myRole === "owner" && (
                  <button
                    onClick={() => setEditingClosingDay(true)}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* メンバー */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">メンバー</p>
                <p className="font-medium text-slate-800">{members.length}人</p>
              </div>
            </div>
            {myRole === "owner" && (
              <InviteDialog groupId={group._id} groupName={group.name} />
            )}
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {members.map((member) => (
            <div key={member._id} className="px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-600">
                {member.displayName.charAt(0)}
              </div>
              <div className="flex-1">
                {member.isMe && editingDisplayName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={20}
                      autoFocus
                    />
                    <button
                      onClick={handleDisplayNameSave}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDisplayName(member.displayName);
                        setEditingDisplayName(false);
                      }}
                      className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800">
                      {member.displayName}
                      {member.isMe && (
                        <span className="ml-1 text-xs text-slate-500">
                          (自分)
                        </span>
                      )}
                    </p>
                    {member.isMe && (
                      <button
                        onClick={() => setEditingDisplayName(true)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
                <p className="text-xs text-slate-500">
                  {member.role === "owner" ? "オーナー" : "メンバー"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* カテゴリ */}
      <section className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Tag className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">カテゴリ</p>
              <p className="font-medium text-slate-800">
                {categories.length}個
              </p>
            </div>
          </div>
          <CategoryManager groupId={group._id} categories={categories} />
        </div>
      </section>

      {/* 買い物リスト */}
      <section className="bg-white border border-slate-200 rounded-lg">
        <Link
          href={`/groups/${group._id}/shopping`}
          className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
        >
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <ShoppingCart className="h-5 w-5 text-slate-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-800">買い物リスト</p>
            <p className="text-sm text-slate-500">
              グループで共有する買い物リスト
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </Link>
      </section>
    </div>
  );
}
