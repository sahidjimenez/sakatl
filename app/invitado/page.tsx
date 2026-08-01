"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listGuestRoutines, type GuestRoutine } from "@/lib/guest/storage";
import { formatRelativeDate } from "@/lib/format";

export default function InvitadoHomePage() {
  const [routines, setRoutines] = useState<GuestRoutine[] | null>(null);

  useEffect(() => {
    // localStorage solo existe en el cliente: se lee tras montar para no
    // desincronizar el HTML del servidor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRoutines(listGuestRoutines());
  }, []);

  return (
    <div className="px-[clamp(20px,5vw,56px)] py-10">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Mis rutinas (invitado)</h1>
            <p className="mt-1 text-[#9099a3]">Guardadas solo en este navegador.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/invitado/asistente"
              className="rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-5 py-2.5 text-sm font-bold text-[#f1f3f4] hover:border-[#4ade80]"
            >
              ✨ Crear con IA
            </Link>
            <Link
              href="/invitado/nueva"
              className="rounded-[10px] bg-[#22c55e] px-5 py-2.5 text-sm font-bold text-[#08150d]"
            >
              + Nueva rutina
            </Link>
          </div>
        </div>

        {routines === null ? null : routines.length === 0 ? (
          <p className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-6 py-12 text-center text-[#9099a3]">
            Todavía no armaste ninguna rutina.{" "}
            <Link href="/invitado/nueva" className="text-[#4ade80]">
              Crea la primera
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {routines.map((routine) => {
              const lastSessionAt = null; // el historial se ve dentro de cada rutina
              const thumbnails = routine.blocks
                .flatMap((b) => b.exercises)
                .map((ex) => ex.exerciseImage)
                .filter((img): img is string => Boolean(img))
                .slice(0, 4);

              return (
                <Link
                  key={routine.id}
                  href={`/invitado/rutinas/${routine.id}`}
                  className="flex flex-col gap-3 rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5 transition-colors hover:border-[#4ade80]"
                >
                  <span className="text-base font-bold text-[#f1f3f4]">{routine.name}</span>

                  {routine.description && (
                    <span className="line-clamp-2 text-sm text-[#9099a3]">{routine.description}</span>
                  )}

                  {thumbnails.length > 0 && (
                    <div className="flex">
                      {thumbnails.map((img, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={`/exercises/${img}`}
                          alt=""
                          className="h-8 w-8 -ml-2 rounded-full border-2 border-[#1c2026] object-cover first:ml-0"
                        />
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-[#23272e] pt-3 text-xs text-[#9099a3]">
                    <span>
                      {routine.blocks.length} bloque{routine.blocks.length !== 1 ? "s" : ""}
                    </span>
                    <span>{formatRelativeDate(lastSessionAt)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
