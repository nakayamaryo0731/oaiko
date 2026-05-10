"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type FABProps = {
  icon: ReactNode;
  label: string;
} & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

const className =
  "absolute -top-5 right-0 z-20 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center";

export function FAB({ href, onClick, icon, label }: FABProps) {
  const content = <span className="[&>svg]:h-6 [&>svg]:w-6">{icon}</span>;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={className}
        aria-label={label}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={className} aria-label={label}>
      {content}
    </Link>
  );
}
