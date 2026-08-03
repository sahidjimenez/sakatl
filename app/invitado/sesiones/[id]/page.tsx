"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  addGuestExtraExercise,
  completeGuestSession,
  deleteGuestSession,
  deleteGuestSetLog,
  getGuestRoutine,
  getGuestSession,
  reopenGuestSession,
  updateGuestSessionNotes,
  upsertGuestSetLog,
  type GuestBlock,
  type GuestRoutine,
  type GuestSession,
  type GuestSetLog,
} from "@/lib/guest/storage";
import { RestTimer } from "@/app/components/RestTimer";
import { SetMarkButton } from "@/app/components/SetMarkButton";
import { SessionTimer } from "@/app/components/SessionTimer";
import { SessionNotesModal } from "@/app/components/SessionNotesModal";
import { SessionInfoModal } from "@/app/components/SessionInfoModal";
import { ManualRestButton } from "@/app/components/ManualRestButton";
import { AddExerciseModal } from "@/app/components/AddExerciseModal";
import { CancelSessionButton } from "@/app/components/CancelSessionButton";
import { CollapsibleBlock } from "@/app/components/CollapsibleBlock";
import { ExerciseThumb } from "@/app/components/ExerciseThumb";

const BLOCK_LABELS: Record<string, string> = {
  single: "Ejercicio suelto",
  bi_series: "Bi-serie",
  tri_series: "Tri-serie",
};

export default function InvitadoSesionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<GuestSession | null | undefined>(undefined);
  const [routine, setRoutine] = useState<GuestRoutine | null>(null);
  const [notes, setNotes] = useState("");

  const refresh = useCallback(() => {
    const s = getGuestSession(id);
    setSession(s ?? null);
    if (s) {
      setRoutine(getGuestRoutine(s.routineId));
      setNotes(s.notes ?? "");
    }
  }, [id]);

  useEffect(() => {
    // localStorage solo existe en el cliente: se lee tras montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  if (session === undefined) return null;
  if (session === null || !routine) {
    return (
      <div className="px-[clamp(20px,5vw,72px)] py-10 text-center text-[#9099a3]">
        No encontramos esa sesión en este navegador.
      </div>
    );
  }

  const logsByKey = new Map(session.setLogs.map((log) => [`${log.blockExerciseId}-${log.setNumber}`, log]));

  function handleComplete() {
    completeGuestSession(session!.id);
    refresh();
  }

  function handleReopen() {
    reopenGuestSession(session!.id);
    refresh();
  }

  function handleSaveNotes(e: React.FormEvent) {
    e.preventDefault();
    updateGuestSessionNotes(session!.id, notes);
    refresh();
  }

  function handleCancel() {
    deleteGuestSession(session!.id);
    router.push(`/invitado/rutinas/${routine!.id}`);
  }

  async function handleAddExtra(exerciseId: string, plannedSets: number) {
    let exerciseName: string | null = null;
    let exerciseImage: string | null = null;
    try {
      const res = await fetch(`/api/exercises/${exerciseId}`);
      if (res.ok) {
        const detail = await res.json();
        exerciseName = detail.name ?? null;
        exerciseImage = detail.image ?? null;
      }
    } catch {
      // Sin conexión o error puntual: se agrega igual, mostrando el id como nombre.
    }
    addGuestExtraExercise(session!.id, { exerciseId, exerciseName, exerciseImage }, plannedSets);
    refresh();
  }

  const combinedBlocks: Array<GuestBlock & { isExtra: boolean }> = [
    ...routine.blocks.map((b) => ({ ...b, isExtra: false })),
    ...(session.extraBlocks ?? []).map((b) => ({ ...b, isExtra: true })),
  ];

  let templateIdx = 0;
  let extraIdx = 0;
  const blocksWithMeta = combinedBlocks.map((block) => {
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

  return (
    <div className="px-[clamp(20px,5vw,72px)] py-6 md:py-10">
      <RestTimer />
      <div className="mx-auto flex max-w-[720px] flex-col gap-6 md:gap-8">
        <div className="sticky top-0 z-30 -mx-[clamp(20px,5vw,72px)] border-b border-[#2a2f37] bg-[#0d0f12]/95 px-[clamp(20px,5vw,72px)] py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
          <Link
            href={`/invitado/rutinas/${routine.id}`}
            className="mb-1.5 inline-block text-xs font-semibold text-[#9099a3] hover:text-[#f1f3f4]"
          >
            ← {routine.name}
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-extrabold md:text-3xl">
              {session.completedAt ? "Sesión completada" : "Entrenando"}
            </h1>
            <div className="flex items-center gap-2">
              <SessionTimer startedAt={session.startedAt} endedAt={session.completedAt} />
              {session.completedAt ? (
                <button
                  type="button"
                  onClick={handleReopen}
                  className="min-h-[44px] rounded-[10px] border border-[#2a2f37] px-5 text-sm font-bold text-[#f1f3f4] hover:border-[#4ade80]"
                >
                  Continuar entrenamiento
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  className="min-h-[44px] rounded-[10px] bg-[#22c55e] px-5 text-sm font-bold text-[#08150d]"
                >
                  Completar sesión
                </button>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <SessionInfoModal
              routineName={routine.name}
              startedAt={session.startedAt}
              completedAt={session.completedAt}
              completedSets={sessionCompletedSets}
              totalSets={sessionTotalSets}
            />
            <SessionNotesModal hasNotes={Boolean(session.notes)}>
              <form onSubmit={handleSaveNotes} className="flex flex-col gap-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
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
                <AddExerciseModal onAdd={handleAddExtra} />
                <CancelSessionButton action={handleCancel} />
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
                      {ex.exerciseImage && (
                        <ExerciseThumb
                          exerciseId={ex.exerciseId}
                          image={ex.exerciseImage}
                          name={ex.exerciseName ?? ""}
                          imgClassName="h-10 w-10 rounded-lg object-cover"
                        />
                      )}
                      <p className="text-sm font-semibold text-[#f1f3f4]">
                        {ex.exerciseName ?? ex.exerciseId}
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
                          <SetRow
                            key={setNumber}
                            sessionId={session!.id}
                            blockExerciseId={ex.id}
                            setNumber={setNumber}
                            targetWeight={ex.targetWeight}
                            log={log}
                            onChange={refresh}
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
    </div>
  );
}

function SetRow({
  sessionId,
  blockExerciseId,
  setNumber,
  targetWeight,
  log,
  onChange,
}: {
  sessionId: string;
  blockExerciseId: string;
  setNumber: number;
  targetWeight: number | null;
  log: GuestSetLog | undefined;
  onChange: () => void;
}) {
  const [weight, setWeight] = useState(log?.weight != null ? String(log.weight) : "");
  const [reps, setReps] = useState(log?.reps != null ? String(log.reps) : "");

  function mark(e: React.FormEvent) {
    e.preventDefault();
    upsertGuestSetLog(sessionId, {
      blockExerciseId,
      setNumber,
      weight: weight ? Number(weight) : null,
      reps: reps ? Number(reps) : null,
      completed: true,
    });
    onChange();
  }

  function remove() {
    deleteGuestSetLog(sessionId, blockExerciseId, setNumber);
    onChange();
  }

  return (
    <form
      onSubmit={mark}
      className="flex flex-nowrap items-center gap-2 rounded-xl border border-[#23272e] bg-[#0d0f12] p-3 sm:gap-3 sm:p-3.5"
    >
      <span className="w-5 shrink-0 text-sm font-semibold text-[#9099a3] sm:w-14">
        <span className="hidden sm:inline">Set </span>
        {setNumber}
      </span>
      <input
        type="number"
        step="0.5"
        min={0}
        placeholder={targetWeight != null ? String(targetWeight) : "kg"}
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className="min-h-[48px] w-16 min-w-0 flex-1 rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-2.5 text-base text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#4ade80] sm:w-24 sm:flex-none sm:px-3.5"
      />
      <input
        type="number"
        min={0}
        placeholder="reps"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        className="min-h-[48px] w-16 min-w-0 flex-1 rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-2.5 text-base text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#4ade80] sm:w-24 sm:flex-none sm:px-3.5"
      />
      <SetMarkButton completed={Boolean(log?.completed)} onUndo={remove} />
    </form>
  );
}
