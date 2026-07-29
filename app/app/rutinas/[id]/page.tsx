import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getRoutineDetail, listRoutineSessions } from "@/lib/routines";
import { deleteRoutineAction, followRoutineAction, startSessionAction } from "@/lib/actions/routines";
import { ExerciseThumb } from "@/app/components/ExerciseThumb";

const BLOCK_LABELS: Record<string, string> = {
  single: "Ejercicio suelto",
  bi_series: "Bi-serie",
  tri_series: "Tri-serie",
};

export default async function RoutineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUser();
  const routine = await getRoutineDetail(id);
  if (!routine) notFound();

  const isOwner = routine.ownerId === userId;
  const sessions = isOwner ? await listRoutineSessions(id, userId) : [];

  return (
    <div className="flex-1 px-[clamp(20px,5vw,72px)] py-10">
      <div className="mx-auto flex max-w-[900px] flex-col gap-10">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold">{routine.name}</h1>
              <p className="mt-1 text-xs font-semibold tracking-wide text-[#9099a3] uppercase">
                {isOwner ? (
                  "Tu rutina"
                ) : (
                  <>
                    de{" "}
                    <Link
                      href={`/app/comunidad/${routine.ownerId}`}
                      className="normal-case text-[#9099a3] underline decoration-dotted hover:text-[#4ade80]"
                    >
                      {routine.ownerDisplayName ?? "otro usuario"}
                    </Link>
                  </>
                )}
              </p>
              {routine.description && (
                <p className="mt-2 max-w-[58ch] text-[15px] text-[#9099a3]">
                  {routine.description}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {isOwner ? (
                <>
                  <form action={startSessionAction.bind(null, routine.id)}>
                    <button
                      type="submit"
                      className="rounded-[10px] bg-[#22c55e] px-5 py-2.5 text-sm font-bold text-[#08150d]"
                    >
                      Empezar entrenamiento
                    </button>
                  </form>
                  <Link
                    href={`/app/rutinas/${routine.id}/editar`}
                    className="rounded-[10px] border border-[#2a2f37] px-5 py-2.5 text-sm font-bold text-[#f1f3f4] hover:border-[#4ade80]"
                  >
                    Editar
                  </Link>
                  <form action={deleteRoutineAction.bind(null, routine.id)}>
                    <button
                      type="submit"
                      className="rounded-[10px] border border-[#2a2f37] px-5 py-2.5 text-sm font-bold text-[#9099a3] hover:border-red-500 hover:text-red-400"
                    >
                      Borrar
                    </button>
                  </form>
                </>
              ) : (
                <form action={followRoutineAction.bind(null, routine.id)}>
                  <button
                    type="submit"
                    className="rounded-[10px] bg-[#22c55e] px-5 py-2.5 text-sm font-bold text-[#08150d]"
                  >
                    Seguir esta rutina
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {routine.blocks.map((block, i) => (
            <div key={block.id} className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
              <p className="mb-3 text-xs font-bold tracking-wide text-[#4ade80] uppercase">
                Bloque {i + 1} · {BLOCK_LABELS[block.type]}
              </p>
              <div className="flex flex-col gap-3">
                {block.exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center gap-3 rounded-xl border border-[#23272e] bg-[#0d0f12] p-3"
                  >
                    {ex.exercise?.image && (
                      <ExerciseThumb
                        exerciseId={ex.exerciseId}
                        image={ex.exercise.image}
                        name={ex.exercise.name}
                        imgClassName="h-12 w-12 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#f1f3f4]">
                        {ex.exercise?.name ?? ex.exerciseId}
                      </p>
                      <p className="text-xs text-[#9099a3]">
                        {ex.plannedSets} series
                        {(ex.targetRepsMin || ex.targetRepsMax) &&
                          ` · ${ex.targetRepsMin ?? "?"}-${ex.targetRepsMax ?? "?"} reps`}
                        {ex.targetWeight != null && ` · ${ex.targetWeight} kg`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {isOwner && (
          <div>
            <h2 className="mb-4 text-xl font-extrabold">Historial</h2>
            {sessions.length === 0 ? (
              <p className="text-sm text-[#9099a3]">Todavía no entrenaste esta rutina.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {sessions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/app/sesiones/${s.id}`}
                    className="flex items-center justify-between rounded-xl border border-[#2a2f37] bg-[#1c2026] px-4 py-3 text-sm hover:border-[#4ade80]"
                  >
                    <span className="text-[#f1f3f4]">
                      {new Date(s.startedAt).toLocaleString("es")}
                    </span>
                    <span className={s.completedAt ? "text-[#4ade80]" : "text-[#9099a3]"}>
                      {s.completedAt ? "Completada" : "En curso"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
