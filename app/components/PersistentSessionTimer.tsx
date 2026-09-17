"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clockAction } from "@/lib/actions/session-timing";
import { formatDuration } from "@/lib/format";

type Clock = Awaited<ReturnType<typeof clockAction>>;
export function PersistentSessionTimer({ sessionId, initial }: { sessionId: string; initial: Clock }) {
  const router = useRouter();
  const [clock, setClock] = useState(initial);
  const [received, setReceived] = useState(0);
  const [now, setNow] = useState(0);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
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
  async function change(operation: "pause" | "resume" | "duration", minutes?: number) {
    setBusy(true); setError("");
    try {
      const next = await clockAction(sessionId, operation, minutes);
      setClock(next); setReceived(Date.now()); setNow(Date.now()); setEditing(false); router.refresh();
    } catch { setError("No se pudo guardar. Intenta de nuevo."); }
    finally { setBusy(false); }
  }
  return <div className="flex flex-wrap items-center gap-2 text-sm">
    <span className="font-bold tabular-nums text-[#4ade80]">{formatDuration(seconds * 1000)}{paused && " · Pausada"}</span>
    {!clock.completed && <button disabled={busy} onClick={() => change(paused ? "resume" : "pause")} className="rounded-lg border border-[#2a2f37] px-3 py-2 disabled:opacity-40">{paused ? "Continuar" : "Pausar"}</button>}
    <button disabled={busy} onClick={() => setEditing(!editing)} className="rounded-lg border border-[#2a2f37] px-3 py-2">Editar duración</button>
    {editing && <form onSubmit={event => { event.preventDefault(); void change("duration", Number(new FormData(event.currentTarget).get("minutes"))); }} className="flex w-full flex-wrap items-center gap-2">
      <label>Minutos <input name="minutes" type="number" min="0" max="1440" step="0.1" required defaultValue={Math.round(seconds / 6) / 10} className="w-24 rounded-lg bg-[#1c2026] p-2" /></label>
      <button disabled={busy} className="rounded-lg bg-[#22c55e] px-3 py-2 text-black">Guardar</button>
      <p className="w-full text-xs text-[#9099a3]">Guardar la duración deja el contador en pausa si la sesión sigue abierta.</p>
    </form>}
    {error && <p role="alert" className="w-full text-red-400">{error}</p>}
  </div>;
}
