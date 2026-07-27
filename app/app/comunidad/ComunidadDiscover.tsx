"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { followRoutineAction } from "@/lib/actions/routines";

type CommunityRoutine = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  ownerDisplayName: string | null;
};

export function ComunidadDiscover() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<CommunityRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  const runSearch = useCallback(async (search: string) => {
    const id = ++requestId.current;
    setLoading(true);
    const params = new URLSearchParams({ scope: "community", limit: "24" });
    if (search) params.set("q", search);
    const res = await fetch(`/api/routines?${params.toString()}`);
    const data = await res.json();
    if (id !== requestId.current) return;
    setItems(data.items);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => runSearch(q), 200);
    return () => clearTimeout(timeout);
  }, [q, runSearch]);

  return (
    <div className="flex flex-col gap-4">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por persona o nombre de rutina…"
        className="min-h-[48px] w-full max-w-md rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-4 text-base text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
      />

      {loading ? (
        <p className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-6 py-12 text-center text-[#9099a3]">
          Buscando…
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-6 py-12 text-center text-[#9099a3]">
          {q ? "No encontramos a nadie con ese nombre." : "Todavía no hay rutinas de otros usuarios para seguir."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((routine) => (
            <div
              key={routine.id}
              className="flex flex-col gap-3 rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5"
            >
              <div>
                <Link
                  href={`/app/rutinas/${routine.id}`}
                  className="text-base font-bold text-[#f1f3f4] hover:text-[#4ade80]"
                >
                  {routine.name}
                </Link>
                <p className="mt-1 text-xs text-[#9099a3]">
                  de {routine.ownerDisplayName ?? "otro usuario"}
                </p>
              </div>
              {routine.description && (
                <p className="line-clamp-2 text-sm text-[#9099a3]">{routine.description}</p>
              )}
              <form action={followRoutineAction.bind(null, routine.id)}>
                <button
                  type="submit"
                  className="w-full rounded-[10px] border border-[#2a2f37] px-4 py-2 text-sm font-bold text-[#f1f3f4] transition-colors hover:border-[#4ade80]"
                >
                  Seguir esta rutina
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
