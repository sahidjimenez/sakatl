import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getUserProfile, listMyRoutines } from "@/lib/routines";
import { followRoutineAction } from "@/lib/actions/routines";
import { formatRelativeDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Perfil de usuario — Sakatl",
};

export default async function PerfilUsuarioPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const currentUserId = await requireUser();
  const profile = await getUserProfile(userId);
  if (!profile) notFound();

  const isSelf = userId === currentUserId;
  const routines = await listMyRoutines(userId);

  return (
    <div className="flex-1 px-[clamp(20px,5vw,56px)] py-10">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
        <Link
          href="/app/comunidad"
          className="text-sm font-semibold text-[#9099a3] hover:text-[#f1f3f4]"
        >
          ← Comunidad
        </Link>

        <div className="flex items-center gap-4 rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt=""
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#23272e] text-lg font-bold text-[#9099a3]">
              {profile.displayName?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <p className="text-xl font-extrabold text-[#f1f3f4]">
              {profile.displayName ?? "Usuario"}
              {isSelf && <span className="ml-2 text-sm font-normal text-[#9099a3]">(tú)</span>}
            </p>
            <p className="text-sm text-[#9099a3]">Meta semanal: {profile.weeklyGoal} entrenamientos</p>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-extrabold">{isSelf ? "Tus rutinas" : "Sus rutinas"}</h2>

          {routines.length === 0 ? (
            <p className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] px-6 py-12 text-center text-[#9099a3]">
              Todavía no tiene rutinas creadas.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {routines.map((routine) => (
                <div
                  key={routine.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/app/rutinas/${routine.id}`}
                      className="text-base font-bold text-[#f1f3f4] hover:text-[#4ade80]"
                    >
                      {routine.name}
                    </Link>
                    {routine.originalRoutineId && (
                      <span className="shrink-0 rounded-full bg-[#4ade80]/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#4ade80] uppercase">
                        Seguida
                      </span>
                    )}
                  </div>

                  {routine.description && (
                    <p className="line-clamp-2 text-sm text-[#9099a3]">{routine.description}</p>
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

                  <div className="flex items-center justify-between border-t border-[#23272e] pt-3 text-xs text-[#9099a3]">
                    <span>
                      {routine.blockCount} bloque{routine.blockCount !== 1 ? "s" : ""}
                    </span>
                    <span>{formatRelativeDate(routine.lastSessionAt)}</span>
                  </div>

                  {!isSelf && (
                    <form action={followRoutineAction.bind(null, routine.id)}>
                      <button
                        type="submit"
                        className="w-full rounded-[10px] border border-[#2a2f37] px-4 py-2 text-sm font-bold text-[#f1f3f4] transition-colors hover:border-[#4ade80]"
                      >
                        Seguir esta rutina
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
