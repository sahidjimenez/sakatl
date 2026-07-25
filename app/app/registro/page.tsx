import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { listAllMySessions } from "@/lib/routines";
import { formatDuration } from "@/lib/format";

export const metadata: Metadata = {
  title: "Registro — Sakatl",
};

export default async function RegistroPage() {
  const userId = await requireUser();
  const sessions = await listAllMySessions(userId);

  return (
    <div className="flex-1 px-[clamp(20px,5vw,56px)] py-10">
      <div className="mx-auto flex max-w-[900px] flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold">Registro</h1>
          <p className="mt-1 text-[#9099a3]">Historial de todos tus entrenamientos.</p>
        </div>

        {sessions.length === 0 ? (
          <p className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-6 py-12 text-center text-[#9099a3]">
            Todavía no registraste ningún entrenamiento.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((s) => {
              const durationMs = s.completedAt ? s.completedAt.getTime() - s.startedAt.getTime() : null;
              return (
                <Link
                  key={s.id}
                  href={`/app/sesiones/${s.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[#2a2f37] bg-[#1c2026] px-4 py-3.5 hover:border-[#4ade80]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#f1f3f4]">{s.routineName}</p>
                    <p className="text-xs text-[#9099a3]">
                      {new Date(s.startedAt).toLocaleDateString("es", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    {durationMs != null ? (
                      <span className="font-semibold text-[#4ade80]">
                        {formatDuration(durationMs)}
                      </span>
                    ) : (
                      <span className="font-semibold text-[#9099a3]">En curso</span>
                    )}
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
