import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getSessionDetail } from "@/lib/routines";
import { completeSessionAction, logSetFormAction } from "@/lib/actions/routines";

const BLOCK_LABELS: Record<string, string> = {
  single: "Ejercicio suelto",
  bi_series: "Bi-serie",
  tri_series: "Tri-serie",
};

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUser();
  const session = await getSessionDetail(id, userId);
  if (!session.routine) notFound();

  const logsByKey = new Map(
    session.setLogs.map((log) => [`${log.blockExerciseId}-${log.setNumber}`, log]),
  );

  return (
    <div className="flex-1 px-[clamp(20px,5vw,72px)] py-10">
      <div className="mx-auto flex max-w-[720px] flex-col gap-8">
        <div>
          <Link
            href={`/app/rutinas/${session.routine.id}`}
            className="mb-2 inline-block text-xs font-semibold text-[#9099a3] hover:text-[#f1f3f4]"
          >
            ← {session.routine.name}
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-extrabold">
              {session.completedAt ? "Sesión completada" : "Entrenando"}
            </h1>
            {!session.completedAt && (
              <form action={completeSessionAction.bind(null, session.id)}>
                <button
                  type="submit"
                  className="rounded-[10px] bg-[#22c55e] px-5 py-2.5 text-sm font-bold text-[#08150d]"
                >
                  Completar sesión
                </button>
              </form>
            )}
          </div>
          <p className="mt-2 text-sm text-[#9099a3]">
            Empezada el {new Date(session.startedAt).toLocaleString("es")}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {session.routine.blocks.map((block, i) => (
            <div key={block.id} className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
              <p className="mb-4 text-xs font-bold tracking-wide text-[#4ade80] uppercase">
                Bloque {i + 1} · {BLOCK_LABELS[block.type]}
              </p>
              <div className="flex flex-col gap-5">
                {block.exercises.map((ex) => (
                  <div key={ex.id}>
                    <div className="mb-2 flex items-center gap-3">
                      {ex.exercise?.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/exercises/${ex.exercise.image}`}
                          alt={ex.exercise.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      )}
                      <p className="text-sm font-semibold text-[#f1f3f4]">
                        {ex.exercise?.name ?? ex.exerciseId}
                        {(ex.targetRepsMin || ex.targetRepsMax) && (
                          <span className="ml-2 text-xs font-normal text-[#9099a3]">
                            objetivo: {ex.targetRepsMin ?? "?"}-{ex.targetRepsMax ?? "?"} reps
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {Array.from({ length: ex.plannedSets }, (_, setIdx) => {
                        const setNumber = setIdx + 1;
                        const log = logsByKey.get(`${ex.id}-${setNumber}`);
                        return (
                          <form
                            key={setNumber}
                            action={logSetFormAction.bind(null, session.id)}
                            className="flex flex-wrap items-center gap-3 rounded-xl border border-[#23272e] bg-[#0d0f12] p-3.5"
                          >
                            <input type="hidden" name="blockExerciseId" value={ex.id} />
                            <input type="hidden" name="setNumber" value={setNumber} />
                            <span className="w-14 shrink-0 text-sm font-semibold text-[#9099a3]">
                              Set {setNumber}
                            </span>
                            <input
                              type="number"
                              name="weight"
                              step="0.5"
                              min={0}
                              placeholder={ex.targetWeight != null ? String(ex.targetWeight) : "kg"}
                              defaultValue={log?.weight ?? undefined}
                              className="min-h-[48px] w-24 rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-3.5 text-base text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
                            />
                            <input
                              type="number"
                              name="reps"
                              min={0}
                              placeholder="reps"
                              defaultValue={log?.reps ?? undefined}
                              className="min-h-[48px] w-24 rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-3.5 text-base text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
                            />
                            <button
                              type="submit"
                              className={`ml-auto min-h-[48px] rounded-[10px] px-4 text-sm font-bold ${
                                log?.completed
                                  ? "bg-[#22c55e]/20 text-[#4ade80]"
                                  : "border border-[#2a2f37] text-[#f1f3f4] hover:border-[#4ade80]"
                              }`}
                            >
                              {log?.completed ? "✓ Hecho" : "Marcar"}
                            </button>
                          </form>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
