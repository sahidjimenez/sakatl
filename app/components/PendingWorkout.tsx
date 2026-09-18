"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { pendingSessionsAction } from "@/lib/actions/session-timing";

export function PendingWorkout() {
  const pathname = usePathname();
  const [sessions, setSessions] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try { const result = await pendingSessionsAction(); if (!cancelled) setSessions(result); } catch { /* Retry on return. */ }
    }
    void refresh();
    window.addEventListener("focus", refresh);
    return () => { cancelled = true; window.removeEventListener("focus", refresh); };
  }, [pathname]);
  if (!sessions.length || pathname.startsWith("/app/sesiones/")) return null;
  return <aside className="mx-5 mt-5 rounded-xl border border-[#4ade80]/40 bg-[#1c2026] p-4">
    <p className="font-bold">Tienes entrenamientos pendientes</p>
    <p className="mt-1 text-sm text-[#9099a3]">Tus series, pesos y repeticiones están guardados. Abre una sesión para continuar o terminarla.</p>
    <div className="mt-3 flex flex-wrap gap-2">{sessions.map(session => <Link key={session.id} href={`/app/sesiones/${session.id}`} className="rounded-lg border border-[#2a2f37] px-3 py-2 text-sm text-[#4ade80]">Retomar {session.name} →</Link>)}</div>
  </aside>;
}
