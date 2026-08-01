"use client";

import { startRestTimer } from "@/app/components/RestTimer";
import { ICON_BUTTON_CLASS } from "@/app/components/IconModalButton";

function TimerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 2h4" />
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5" />
      <path d="M19 6.5l1.5-1.5" />
    </svg>
  );
}

export function ManualRestButton({ seconds = 90 }: { seconds?: number }) {
  return (
    <button
      type="button"
      onClick={() => startRestTimer(seconds)}
      aria-label="Iniciar descanso"
      title="Iniciar descanso"
      className={ICON_BUTTON_CLASS}
    >
      <TimerIcon className="h-5 w-5" />
    </button>
  );
}
