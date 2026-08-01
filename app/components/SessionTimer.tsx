"use client";

import { useEffect, useState } from "react";

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M7 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 7 5.5Z" />
    </svg>
  );
}

function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function SessionTimer({
  startedAt,
  endedAt,
}: {
  startedAt: string | number | Date;
  endedAt?: string | number | Date | null;
}) {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : null;
  // Arranca igual en servidor y cliente (elapsed 0) para evitar mismatch de hidratación;
  // el useEffect corrige al tiempo real justo después de montar.
  const [now, setNow] = useState(start);
  const [paused, setPaused] = useState(false);
  const [pausedMs, setPausedMs] = useState(0);

  useEffect(() => {
    if (end || paused) return;
    // Corrige el "0:00" inicial (igual en servidor y cliente) al tiempo real apenas monta.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [end, paused, start]);

  const elapsed = (end ?? now) - start - pausedMs;

  if (end) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2a2f37] bg-[#0d0f12] px-3 py-1.5 text-sm font-bold tabular-nums text-[#4ade80]">
        {formatElapsed(elapsed)}
      </span>
    );
  }

  function togglePause() {
    if (paused) {
      setPausedMs((p) => p + (Date.now() - now));
      setPaused(false);
    } else {
      setNow(Date.now());
      setPaused(true);
    }
  }

  return (
    <button
      type="button"
      onClick={togglePause}
      aria-label={paused ? "Reanudar el tiempo de la sesión" : "Pausar el tiempo de la sesión"}
      title={paused ? "Reanudar" : "Pausar"}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold tabular-nums ${
        paused
          ? "border-[#4ade80] bg-[#0d0f12] text-[#9099a3]"
          : "border-[#2a2f37] bg-[#0d0f12] text-[#4ade80]"
      }`}
    >
      {paused ? <PlayIcon className="h-4 w-4 shrink-0" /> : <PauseIcon className="h-4 w-4 shrink-0" />}
      {formatElapsed(elapsed)}
    </button>
  );
}
