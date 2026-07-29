"use client";

import { startRestTimer } from "@/app/components/RestTimer";

export function SetMarkButton({ completed }: { completed: boolean }) {
  return (
    <button
      type="submit"
      onClick={() => {
        if (!completed) startRestTimer();
      }}
      className={`ml-auto min-h-[48px] rounded-[10px] px-4 text-sm font-bold ${
        completed
          ? "bg-[#22c55e]/20 text-[#4ade80]"
          : "border border-[#2a2f37] text-[#f1f3f4] hover:border-[#4ade80]"
      }`}
    >
      {completed ? "✓ Hecho" : "Marcar"}
    </button>
  );
}
