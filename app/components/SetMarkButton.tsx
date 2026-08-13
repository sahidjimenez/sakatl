"use client";

import { useState, useTransition } from "react";
import { startRestTimer } from "@/app/components/RestTimer";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12.5 9.5 17 19 7" />
    </svg>
  );
}

export function SetMarkButton({
  completed,
  onUndo,
  onMark,
}: {
  completed: boolean;
  onUndo: () => Promise<void> | void;
  onMark?: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!completed) {
    return (
      <button
        type="submit"
        onClick={() => {
          startRestTimer();
          onMark?.();
        }}
        aria-label="Marcar set como hecho"
        title="Marcar"
        className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-[#2a2f37] text-[#9099a3] transition-colors duration-75 hover:border-[#4ade80] hover:text-[#4ade80]"
      >
        <CheckIcon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label="Deshacer este set"
        title="Deshacer"
        className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[#22c55e]/20 text-[#4ade80] transition-colors duration-75 hover:bg-[#22c55e]/30"
      >
        <CheckIcon className="h-5 w-5" />
      </button>

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => !isPending && setConfirming(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-4 text-sm font-semibold text-[#f1f3f4]">¿Deshacer este set?</p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setConfirming(false)}
                className="min-h-[44px] flex-1 rounded-[10px] border border-[#2a2f37] text-sm font-bold text-[#9099a3] hover:text-[#f1f3f4] disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await onUndo();
                    setConfirming(false);
                  })
                }
                className="min-h-[44px] flex-1 rounded-[10px] bg-red-500 text-sm font-bold text-white disabled:opacity-60"
              >
                {isPending ? "…" : "Sí"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
