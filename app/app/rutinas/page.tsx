import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listMyRoutines } from "@/lib/routines";
import { formatRelativeDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Mis rutinas — Sakatl",
};

function CalendarIcon({ className }: { className?: string }) {
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
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </svg>
  );
}

export default async function RutinasPage() {
  const userId = await requireUser();
  const myRoutines = await listMyRoutines(userId);

  return (
    <div className="flex-1 px-[clamp(20px,5vw,56px)] py-10">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold">Mis rutinas</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/app/rutinas/calendario"
              aria-label="Ver calendario de rutinas"
              className="flex items-center gap-2 rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-4 py-2.5 text-sm font-bold text-[#f1f3f4] hover:border-[#4ade80]"
            >
              <CalendarIcon className="h-4 w-4" />
              Calendario
            </Link>
            <Link
              href="/app/nueva"
              className="rounded-[10px] bg-[#22c55e] px-5 py-2.5 text-sm font-bold text-[#08150d]"
            >
              + Nueva rutina
            </Link>
          </div>
        </div>

        {myRoutines.length === 0 ? (
          <p className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-6 py-12 text-center text-[#9099a3]">
            Todavía no armaste ninguna rutina.{" "}
            <Link href="/app/nueva" className="text-[#4ade80]">
              Crea la primera
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myRoutines.map((routine) => (
              <Link
                key={routine.id}
                href={`/app/rutinas/${routine.id}`}
                className="flex flex-col gap-3 rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5 transition-colors hover:border-[#4ade80]"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-base font-bold text-[#f1f3f4]">{routine.name}</span>
                  {routine.originalRoutineId && (
                    <span className="shrink-0 rounded-full bg-[#4ade80]/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#4ade80] uppercase">
                      Seguida
                    </span>
                  )}
                </div>

                {routine.description && (
                  <span className="line-clamp-2 text-sm text-[#9099a3]">
                    {routine.description}
                  </span>
                )}

                {routine.exerciseThumbnails.length > 0 && (
                  <div className="flex">
                    {routine.exerciseThumbnails.map((img, i) => (
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
                    {routine.blockCount} bloque{routine.blockCount !== 1 ? "s" : ""}
                  </span>
                  <span>{formatRelativeDate(routine.lastSessionAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
