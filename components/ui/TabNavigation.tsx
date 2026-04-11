"use client";

import type { ReactNode } from "react";

type Tab = {
  id: string;
  label: string;
  icon: ReactNode;
};

type TabNavigationProps = {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
};

/**
 * 下部タブナビゲーションコンポーネント
 * Material Design / iOS HIG準拠
 * - 高さ: 56px (h-14)
 * - アイコン + ラベルの組み合わせ
 * - アクティブ状態の明確な視覚フィードバック
 */
export function TabNavigation({
  tabs,
  activeTab,
  onChange,
}: TabNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-lg mx-auto flex h-14" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onChange(tab.id)}
            aria-label={tab.label}
            className={`flex-1 flex items-center justify-center transition-colors ${
              activeTab === tab.id
                ? "text-blue-600 border-t-2 border-blue-500 -mt-px"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className="[&>svg]:h-6 [&>svg]:w-6">{tab.icon}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
