"use client";

import { useSessionCompletion } from "@/app/components/SessionCompletion";

export function CompleteSessionButton({ className }: { className?: string }) {
  const ctx = useSessionCompletion();

  return (
    <>
      <button type="button" onClick={() => ctx?.requestComplete()} className={className}>
        Completar sesión
      </button>
      {ctx?.error && <p className="mt-1 w-full text-xs font-semibold text-red-400">{ctx.error}</p>}
    </>
  );
}
