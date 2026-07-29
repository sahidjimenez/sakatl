"use client";

import { useEffect } from "react";

export function RouteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 px-[clamp(20px,5vw,56px)] py-10">
      <div className="mx-auto flex max-w-[600px] flex-col items-center gap-4 rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-6 py-12 text-center">
        <p className="text-base font-bold text-[#f1f3f4]">Algo salió mal</p>
        <p className="text-sm text-[#9099a3]">
          Intenta de nuevo. Si el problema sigue, vuelve más tarde.
        </p>
        <button
          type="button"
          onClick={retry}
          className="rounded-[10px] bg-[#22c55e] px-5 py-2.5 text-sm font-bold text-[#08150d]"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
