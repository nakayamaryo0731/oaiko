"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type FABProps = {
  href: string;
  icon: ReactNode;
  label: string;
};

export function FAB({ href, icon, label }: FABProps) {
  return (
    <Link
      href={href}
      className="absolute -top-5 right-0 z-20 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
      aria-label={label}
    >
      <span className="[&>svg]:h-6 [&>svg]:w-6">{icon}</span>
    </Link>
  );
}
