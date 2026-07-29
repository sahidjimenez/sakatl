"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { followRoutineAction } from "@/lib/actions/routines";
import { LikeButton } from "@/app/components/LikeButton";

type CommunityRoutine = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  ownerDisplayName: string | null;
  likesCount: number;
  likedByMe: boolean;
};

type CommunityPerson = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
};

function PersonIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.6 3-6.5 7-6.5s7 2.9 7 6.5" />
    </svg>
  );
}

export function ComunidadDiscover() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<CommunityRoutine[]>([]);
  const [people, setPeople] = useState<CommunityPerson[]>([]);
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
    setPeople(data.people ?? []);
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
      ) : items.length === 0 && people.length === 0 ? (
        <p className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-6 py-12 text-center text-[#9099a3]">
          {q ? "No encontramos a nadie con ese nombre." : "Todavía no hay rutinas de otros usuarios para seguir."}
        </p>
      ) : (
        <>
          {people.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold tracking-wide text-[#9099a3] uppercase">Personas</p>
              <div className="flex flex-wrap gap-3">
                {people.map((person) => (
                  <Link
                    key={person.id}
                    href={`/app/comunidad/${person.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-4 py-3 transition-colors hover:border-[#4ade80]"
                  >
                    {person.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={person.avatarUrl}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#23272e] text-sm font-bold text-[#9099a3]">
                        {person.displayName?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    <span className="text-sm font-bold text-[#f1f3f4]">
                      {person.displayName ?? "Usuario"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {items.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((routine) => (
                <div
                  key={routine.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5"
                >
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/app/rutinas/${routine.id}`}
                      className="text-base font-bold text-[#f1f3f4] hover:text-[#4ade80]"
                    >
                      {routine.name}
                    </Link>
                    <Link
                      href={`/app/comunidad/${routine.ownerId}`}
                      className="inline-flex items-center gap-1 text-xs text-[#9099a3] hover:text-[#4ade80]"
                    >
                      <PersonIcon className="h-3.5 w-3.5" />
                      {routine.ownerDisplayName ?? "otro usuario"}
                    </Link>
                  </div>
                  {routine.description && (
                    <p className="line-clamp-2 text-sm text-[#9099a3]">{routine.description}</p>
                  )}
                  <LikeButton
                    routineId={routine.id}
                    initialLiked={routine.likedByMe}
                    initialCount={routine.likesCount}
                  />
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
        </>
      )}
    </div>
  );
}
