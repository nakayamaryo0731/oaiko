"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type FABProps = {
  href: string;
  icon: ReactNode;
  label: string;
};

/**
 * Floating Action Button コンポーネント
 * - 右下配置（親指リーチ最適）
 * - サイズ: 56px（タッチターゲット最低48px以上）
 * - 広告バナー + タブナビゲーションの上に配置
 * - safe-area-inset対応
 */
export function FAB({ href, icon, label }: FABProps) {
  return (
    <Link
      href={href}
      className="fixed z-20 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center right-4"
      style={{ bottom: "calc(9rem + env(safe-area-inset-bottom))" }}
      aria-label={label}
    >
      <span className="[&>svg]:h-6 [&>svg]:w-6">{icon}</span>
    </Link>
  );
}
