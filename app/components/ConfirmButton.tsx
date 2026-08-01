"use client";

import { useState, useTransition, type ReactNode } from "react";

export function ConfirmButton({
  action,
  label,
  ariaLabel,
  title,
  confirmLabel = "¿Seguro?",
  confirmActionLabel = "Sí, borrar",
  className,
}: {
  action: () => Promise<void> | void;
  label: ReactNode;
  ariaLabel?: string;
  title?: string;
  confirmLabel?: string;
  confirmActionLabel?: string;
  className?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {confirmLabel && <span className="text-xs text-[#9099a3]">{confirmLabel}</span>}
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await action();
            })
          }
          className="rounded-[10px] bg-red-500 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
        >
          {isPending ? "…" : confirmActionLabel}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setConfirming(false)}
          className="rounded-[10px] border border-[#2a2f37] px-3 py-1.5 text-xs font-bold text-[#9099a3] hover:text-[#f1f3f4] disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={ariaLabel}
      title={title}
      className={className}
    >
      {label}
    </button>
  );
}
