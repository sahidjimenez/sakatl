"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clockAction } from "@/lib/actions/session-timing";
import { formatStopwatch } from "@/lib/format";

type Clock = Awaited<ReturnType<typeof clockAction>>;
export function PersistentSessionTimer({ sessionId, initial }: { sessionId: string; initial: Clock }) {
  const router = useRouter();
  const [clock, setClock] = useState(initial);
  const [received, setReceived] = useState(0);
  const [now, setNow] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    const mountedAt = Date.now();
    // Start ticking immediately, even while the first server sync is pending.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReceived(mountedAt);
    setNow(mountedAt);
    async function sync() {
      try {
        const next = await clockAction(sessionId, "read");
        if (!cancelled) { setClock(next); setReceived(Date.now()); setNow(Date.now()); }
      } catch { if (!cancelled) setError("No se pudo sincronizar el tiempo."); }
    }
    void sync();
    const poll = setInterval(sync, 15000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    window.addEventListener("focus", sync);
    return () => { cancelled = true; clearInterval(poll); clearInterval(tick); window.removeEventListener("focus", sync); };
  }, [sessionId, initial]);
  const delta = received ? Math.max(0, now - received) : 0;
  const remaining = clock.deadline === null ? Infinity : Math.max(0, clock.deadline - clock.serverNow);
  const paused = clock.paused || (!clock.completed && delta >= remaining);
  const seconds = clock.activeSeconds + (!clock.paused && !clock.completed ? Math.floor(Math.min(delta, remaining) / 1000) : 0);
  async function change(operation: "pause" | "resume") {
    setBusy(true); setError("");
    try {
      const next = await clockAction(sessionId, operation);
      setClock(next); setReceived(Date.now()); setNow(Date.now()); router.refresh();
    } catch { setError("No se pudo guardar. Intenta de nuevo."); }
    finally { setBusy(false); }
  }
  return <div className="flex flex-wrap items-center gap-2 text-sm">
    <span role="timer" aria-label="Tiempo de entrenamiento" className="text-lg font-bold tabular-nums text-[#4ade80]">{formatStopwatch(seconds)}</span>
    {!clock.completed && <button type="button" disabled={busy} aria-label={paused ? "Continuar entrenamiento" : "Pausar entrenamiento"} title={paused ? "Continuar" : "Pausar"} onClick={() => change(paused ? "resume" : "pause")} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#2a2f37] text-[#4ade80] disabled:opacity-40">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        {paused ? <path d="M8 5v14l11-7Z" /> : <><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></>}
      </svg>
    </button>}
    {paused && <span className="text-xs text-[#9099a3]">Pausada</span>}
    {error && <p role="alert" className="w-full text-red-400">{error}</p>}
  </div>;
}
