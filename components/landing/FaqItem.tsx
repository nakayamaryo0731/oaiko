"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-200 rounded-lg bg-white">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full p-4 text-left flex items-center justify-between gap-4"
      >
        <span className="font-medium text-slate-800 text-sm">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 pb-4 text-sm text-slate-600">{a}</div>}
    </div>
  );
}
