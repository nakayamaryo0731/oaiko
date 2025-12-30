"use client";

type GroupCardProps = {
  name: string;
  memberCount: number;
  myRole: "owner" | "member";
  onClick?: () => void;
};

export function GroupCard({
  name,
  memberCount,
  myRole,
  onClick,
}: GroupCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
    >
      <div className="font-medium text-slate-800">{name}</div>
      <div className="text-sm text-slate-500 mt-1">
        メンバー: {memberCount}人 |{" "}
        {myRole === "owner" ? "オーナー" : "メンバー"}
      </div>
    </button>
  );
}
