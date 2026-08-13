import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getSessionDetail } from "@/lib/routines";
import {
  addExtraExerciseAction,
  cancelSessionAction,
  completeSessionForCelebrationAction,
  deleteSetLogAction,
  logSetFormAction,
  reopenSessionAction,
  updateSessionNotesAction,
} from "@/lib/actions/routines";
import { ExerciseThumb } from "@/app/components/ExerciseThumb";
import { RestTimer } from "@/app/components/RestTimer";
import { SetRow } from "@/app/components/SetRow";
import { SessionTimer } from "@/app/components/SessionTimer";
import { SessionNotesModal } from "@/app/components/SessionNotesModal";
import { SessionInfoModal } from "@/app/components/SessionInfoModal";
import { ManualRestButton } from "@/app/components/ManualRestButton";
import { AddExerciseModal } from "@/app/components/AddExerciseModal";
import { CancelSessionButton } from "@/app/components/CancelSessionButton";
import { CollapsibleBlock } from "@/app/components/CollapsibleBlock";
import { CompleteSessionButton } from "@/app/components/CompleteSessionButton";
import { SessionCompletionProvider } from "@/app/components/SessionCompletion";

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

  let templateIdx = 0;
  let extraIdx = 0;
  const blocksWithMeta = session.routine.blocks.map((block) => {
    const label = block.isExtra
      ? `Extra ${++extraIdx} · ${BLOCK_LABELS[block.type]}`
      : `Bloque ${++templateIdx} · ${BLOCK_LABELS[block.type]}`;
    const totalSets = block.exercises.reduce((sum, ex) => sum + ex.plannedSets, 0);
    const completedSets = block.exercises.reduce((sum, ex) => {
      let c = 0;
      for (let s = 1; s <= ex.plannedSets; s++) {
        if (logsByKey.get(`${ex.id}-${s}`)?.completed) c++;
      }
      return sum + c;
    }, 0);
    return { block, label, totalSets, completedSets };
  });
  const sessionTotalSets = blocksWithMeta.reduce((sum, b) => sum + b.totalSets, 0);
  const sessionCompletedSets = blocksWithMeta.reduce((sum, b) => sum + b.completedSets, 0);
  const initialDoneKeys = Array.from(logsByKey.entries())
    .filter(([, log]) => log.completed)
    .map(([key]) => key);

  return (
    <div className="flex-1 px-[clamp(20px,5vw,72px)] py-6 md:py-10">
      <RestTimer />
      <SessionCompletionProvider
        sessionId={session.id}
        routineName={session.routine.name}
        totalSets={sessionTotalSets}
        initialDoneKeys={initialDoneKeys}
        alreadyCompleted={Boolean(session.completedAt)}
        action={completeSessionForCelebrationAction}
      >
      <div className="mx-auto flex max-w-[720px] flex-col gap-6 md:gap-8">
        <div className="sticky top-0 z-30 -mx-[clamp(20px,5vw,72px)] border-b border-[#2a2f37] bg-[#0d0f12]/95 px-[clamp(20px,5vw,72px)] py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
          <Link
            href={`/app/rutinas/${session.routine.id}`}
            className="mb-1.5 inline-block text-xs font-semibold text-[#9099a3] hover:text-[#f1f3f4]"
          >
            ← {session.routine.name}
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-extrabold md:text-3xl">
              {session.completedAt ? "Sesión completada" : "Entrenando"}
            </h1>
            <div className="flex items-center gap-2">
              <SessionTimer startedAt={session.startedAt} endedAt={session.completedAt} />
              {session.completedAt ? (
                <form action={reopenSessionAction.bind(null, session.id)}>
                  <button
                    type="submit"
                    className="min-h-[44px] rounded-[10px] border border-[#2a2f37] px-5 text-sm font-bold text-[#f1f3f4] hover:border-[#4ade80]"
                  >
                    Continuar entrenamiento
                  </button>
                </form>
              ) : (
                <CompleteSessionButton className="min-h-[44px] rounded-[10px] bg-[#22c55e] px-5 text-sm font-bold text-[#08150d]" />
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <SessionInfoModal
              routineName={session.routine.name}
              startedAt={session.startedAt}
              completedAt={session.completedAt}
              completedSets={sessionCompletedSets}
              totalSets={sessionTotalSets}
            />
            <SessionNotesModal hasNotes={Boolean(session.notes)}>
              <form
                action={updateSessionNotesAction.bind(null, session.id)}
                className="flex flex-col gap-3"
              >
                <textarea
                  name="notes"
                  rows={4}
                  defaultValue={session.notes ?? ""}
                  placeholder="¿Cómo te sentiste? ¿Algún dolor o molestia?"
                  autoFocus
                  className="w-full resize-none rounded-[10px] border border-[#2a2f37] bg-[#0d0f12] px-3.5 py-3 text-sm text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
                />
                <button
                  type="submit"
                  className="min-h-[44px] self-start rounded-[10px] bg-[#22c55e] px-5 text-sm font-bold text-[#08150d]"
                >
                  Guardar nota
                </button>
              </form>
            </SessionNotesModal>
            {!session.completedAt && (
              <>
                <ManualRestButton />
                <AddExerciseModal onAdd={addExtraExerciseAction.bind(null, session.id)} />
                <CancelSessionButton
                  action={cancelSessionAction.bind(null, session.id, session.routine.id)}
                />
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {blocksWithMeta.map(({ block, label, totalSets, completedSets }) => (
            <CollapsibleBlock
              key={block.id}
              label={label}
              progressLabel={`${completedSets}/${totalSets}`}
              defaultOpen={completedSets < totalSets}
            >
              <>
                {block.exercises.map((ex) => (
                  <div key={ex.id}>
                    <div className="mb-2 flex items-center gap-3">
                      {ex.exercise?.image && (
                        <ExerciseThumb
                          exerciseId={ex.exerciseId}
                          image={ex.exercise.image}
                          name={ex.exercise.name}
                          imgClassName="h-10 w-10 rounded-lg object-cover"
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
                        const prevLog =
                          setNumber > 1 ? logsByKey.get(`${ex.id}-${setNumber - 1}`) : undefined;
                        return (
                          <SetRow
                            key={setNumber}
                            blockExerciseId={ex.id}
                            setNumber={setNumber}
                            weight={log?.weight ?? null}
                            reps={log?.reps ?? null}
                            completed={Boolean(log?.completed)}
                            targetWeight={ex.targetWeight ?? null}
                            prevWeight={prevLog?.weight ?? null}
                            prevReps={prevLog?.reps ?? null}
                            prevCompleted={Boolean(prevLog?.completed)}
                            logSetAction={logSetFormAction.bind(null, session.id)}
                            onUndo={deleteSetLogAction.bind(null, session.id, ex.id, setNumber)}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            </CollapsibleBlock>
          ))}
        </div>
      </div>
      </SessionCompletionProvider>
    </div>
  );
}
