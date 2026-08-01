"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import RoutineForm, { type RoutineFormInitial } from "@/app/app/RoutineForm";
import { getGuestRoutine, saveGuestRoutine, type GuestRoutine } from "@/lib/guest/storage";

function toInitial(routine: GuestRoutine): RoutineFormInitial {
  return {
    name: routine.name,
    description: routine.description,
    scheduledDays: routine.scheduledDays,
    blocks: routine.blocks.map((b) => ({
      type: b.type,
      exercises: b.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        exerciseImage: ex.exerciseImage,
        plannedSets: ex.plannedSets,
        targetRepsMin: ex.targetRepsMin,
        targetRepsMax: ex.targetRepsMax,
        targetWeight: ex.targetWeight,
      })),
    })),
  };
}

export default function EditarRutinaInvitadoPage() {
  const { id } = useParams<{ id: string }>();
  const [routine, setRoutine] = useState<GuestRoutine | null | undefined>(undefined);

  useEffect(() => {
    // localStorage solo existe en el cliente: se lee tras montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRoutine(getGuestRoutine(id));
  }, [id]);

  if (routine === undefined) return null;
  if (routine === null) {
    return (
      <div className="px-[clamp(20px,5vw,72px)] py-10 text-center text-[#9099a3]">
        No encontramos esa rutina en este navegador.
      </div>
    );
  }

  return (
    <div className="px-[clamp(20px,5vw,56px)] py-10">
      <div className="mx-auto flex max-w-[720px] flex-col gap-8">
        <div>
          <h1 className="text-3xl font-extrabold">Editar rutina</h1>
          <p className="mt-1 text-[#9099a3]">Se guarda solo en este navegador.</p>
        </div>
        <RoutineForm
          mode="edit"
          routineId={routine.id}
          initial={toInitial(routine)}
          onSave={async (input) => saveGuestRoutine(input, routine.id)}
          resultHref={(routineId) => `/invitado/rutinas/${routineId}`}
        />
      </div>
    </div>
  );
}
