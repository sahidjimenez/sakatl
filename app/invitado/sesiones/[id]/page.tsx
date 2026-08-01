"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  completeGuestSession,
  deleteGuestSetLog,
  getGuestRoutine,
  getGuestSession,
  updateGuestSessionNotes,
  upsertGuestSetLog,
  type GuestRoutine,
  type GuestSession,
  type GuestSetLog,
} from "@/lib/guest/storage";
import { RestTimer } from "@/app/components/RestTimer";
import { SetMarkButton } from "@/app/components/SetMarkButton";
import { ConfirmButton } from "@/app/components/ConfirmButton";

const BLOCK_LABELS: Record<string, string> = {
  single: "Ejercicio suelto",
  bi_series: "Bi-serie",
  tri_series: "Tri-serie",
};

export default function InvitadoSesionPage() {
  const { id } = useParams<{ id: string }>();
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

  function handleSaveNotes(e: React.FormEvent) {
    e.preventDefault();
    updateGuestSessionNotes(session!.id, notes);
    refresh();
  }

  return (
    <div className="px-[clamp(20px,5vw,72px)] py-10">
      <RestTimer />
      <div className="mx-auto flex max-w-[720px] flex-col gap-8">
        <div>
          <Link
            href={`/invitado/rutinas/${routine.id}`}
            className="mb-2 inline-block text-xs font-semibold text-[#9099a3] hover:text-[#f1f3f4]"
          >
            ← {routine.name}
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-extrabold">
              {session.completedAt ? "Sesión completada" : "Entrenando"}
            </h1>
            {!session.completedAt && (
              <button
                type="button"
                onClick={handleComplete}
                className="rounded-[10px] bg-[#22c55e] px-5 py-2.5 text-sm font-bold text-[#08150d]"
              >
                Completar sesión
              </button>
            )}
          </div>
          <p className="mt-2 text-sm text-[#9099a3]">
            Empezada el {new Date(session.startedAt).toLocaleString("es")}
          </p>
        </div>

        <div className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
          <p className="mb-3 text-sm font-bold text-[#f1f3f4]">Notas de la sesión</p>
          <form onSubmit={handleSaveNotes} className="flex flex-col gap-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="¿Cómo te sentiste? ¿Algún dolor o molestia?"
              className="w-full resize-none rounded-[10px] border border-[#2a2f37] bg-[#0d0f12] px-3.5 py-3 text-sm text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
            />
            <button
              type="submit"
              className="self-start rounded-[10px] border border-[#2a2f37] px-4 py-2 text-sm font-bold text-[#f1f3f4] hover:border-[#4ade80]"
            >
              Guardar nota
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-4">
          {routine.blocks.map((block, i) => (
            <div key={block.id} className="rounded-2xl border border-[#2a2f37] bg-[#1c2026] p-5">
              <p className="mb-4 text-xs font-bold tracking-wide text-[#4ade80] uppercase">
                Bloque {i + 1} · {BLOCK_LABELS[block.type]}
              </p>
              <div className="flex flex-col gap-5">
                {block.exercises.map((ex) => (
                  <div key={ex.id}>
                    <div className="mb-2 flex items-center gap-3">
                      {ex.exerciseImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/exercises/${ex.exerciseImage}`}
                          alt={ex.exerciseName ?? ""}
                          className="h-10 w-10 rounded-lg object-cover"
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
              </div>
            </div>
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
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#23272e] bg-[#0d0f12] p-3.5">
      <form onSubmit={mark} className="flex flex-1 flex-wrap items-center gap-3">
        <span className="w-14 shrink-0 text-sm font-semibold text-[#9099a3]">Set {setNumber}</span>
        <input
          type="number"
          step="0.5"
          min={0}
          placeholder={targetWeight != null ? String(targetWeight) : "kg"}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="min-h-[48px] w-24 rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-3.5 text-base text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
        />
        <input
          type="number"
          min={0}
          placeholder="reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="min-h-[48px] w-24 rounded-[10px] border border-[#2a2f37] bg-[#1c2026] px-3.5 text-base text-[#f1f3f4] placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#4ade80]"
        />
        <SetMarkButton completed={Boolean(log?.completed)} />
      </form>
      {log?.completed && (
        <ConfirmButton
          action={remove}
          label="✕"
          ariaLabel="Borrar este registro"
          confirmLabel=""
          confirmActionLabel="Borrar"
          className="flex min-h-[48px] items-center justify-center rounded-[10px] border border-[#2a2f37] px-3 text-sm text-[#9099a3] hover:border-red-500 hover:text-red-400"
        />
      )}
    </div>
  );
}
