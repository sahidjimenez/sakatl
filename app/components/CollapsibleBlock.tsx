"use client";

import { useState, type ReactNode } from "react";

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CollapsibleBlock({
  label,
  progressLabel,
  defaultOpen = true,
  children,
}: {
  label: string;
  progressLabel?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="text-xs font-bold tracking-wide text-[#4ade80] uppercase">{label}</span>
        <span className="flex items-center gap-2 shrink-0">
          {progressLabel && (
            <span className="rounded-full bg-[#0d0f12] px-2.5 py-1 text-[11px] font-bold text-[#9099a3]">
              {progressLabel}
            </span>
          )}
          <ChevronIcon
            className={`h-4 w-4 text-[#9099a3] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {open && <div className="mt-4 flex flex-col gap-5">{children}</div>}
    </div>
  );
}
