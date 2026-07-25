import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getRoutineDetail } from "@/lib/routines";
import RoutineForm from "../../../RoutineForm";

export default async function EditarRutinaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUser();
  const routine = await getRoutineDetail(id);
  if (!routine || routine.ownerId !== userId) notFound();

  return (
    <div className="flex-1 px-[clamp(20px,5vw,72px)] py-10">
      <div className="mx-auto max-w-[720px]">
        <p className="mb-2 text-xs font-semibold tracking-wide text-[#9099a3] uppercase">
          Editar rutina
        </p>
        <h1 className="mb-8 text-3xl font-extrabold">{routine.name}</h1>
        <RoutineForm
          mode="edit"
          routineId={routine.id}
          initial={{
            name: routine.name,
            description: routine.description,
            scheduledDays: routine.scheduledDays,
            blocks: routine.blocks.map((b) => ({
              type: b.type,
              exercises: b.exercises.map((e) => ({
                exerciseId: e.exerciseId,
                exerciseName: e.exercise?.name ?? null,
                exerciseImage: e.exercise?.image ?? null,
                plannedSets: e.plannedSets,
                targetRepsMin: e.targetRepsMin,
                targetRepsMax: e.targetRepsMax,
                targetWeight: e.targetWeight,
              })),
            })),
          }}
        />
      </div>
    </div>
  );
}
