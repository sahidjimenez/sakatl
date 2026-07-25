"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  ApiError,
  completeSession,
  createRoutine,
  deleteRoutine,
  followRoutine,
  startSession,
  updateRoutine,
  updateWeeklyGoal,
  upsertSetLog,
  type RoutineInput,
} from "@/lib/routines";

export type FormActionResult = { error: string } | { ok: true; id: string };

export async function createRoutineAction(input: RoutineInput): Promise<FormActionResult> {
  const userId = await requireUser();
  try {
    const routine = await createRoutine(userId, input);
    revalidatePath("/app");
    revalidatePath("/app/rutinas");
    return { ok: true, id: routine!.id };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    throw err;
  }
}

export async function updateRoutineAction(
  routineId: string,
  input: RoutineInput,
): Promise<FormActionResult> {
  const userId = await requireUser();
  try {
    const routine = await updateRoutine(routineId, userId, input);
    revalidatePath("/app");
    revalidatePath("/app/rutinas");
    revalidatePath(`/app/rutinas/${routineId}`);
    return { ok: true, id: routine!.id };
  } catch (err) {
    if (err instanceof ApiError) return { error: err.message };
    throw err;
  }
}

export async function deleteRoutineAction(routineId: string) {
  const userId = await requireUser();
  await deleteRoutine(routineId, userId);
  revalidatePath("/app");
  revalidatePath("/app/rutinas");
  redirect("/app");
}

export async function updateWeeklyGoalAction(formData: FormData) {
  const userId = await requireUser();
  const weeklyGoal = Number(formData.get("weeklyGoal"));
  await updateWeeklyGoal(userId, weeklyGoal);
  revalidatePath("/app");
  revalidatePath("/app/perfil");
}

export async function followRoutineAction(routineId: string) {
  const userId = await requireUser();
  const routine = await followRoutine(routineId, userId);
  revalidatePath("/app");
  redirect(`/app/rutinas/${routine!.id}`);
}

export async function startSessionAction(routineId: string) {
  const userId = await requireUser();
  const session = await startSession(routineId, userId);
  redirect(`/app/sesiones/${session.id}`);
}

export async function completeSessionAction(sessionId: string) {
  const userId = await requireUser();
  await completeSession(sessionId, userId);
  revalidatePath(`/app/sesiones/${sessionId}`);
  redirect(`/app/sesiones/${sessionId}`);
}

export async function logSetFormAction(sessionId: string, formData: FormData) {
  const userId = await requireUser();
  const blockExerciseId = String(formData.get("blockExerciseId") ?? "");
  const setNumber = Number(formData.get("setNumber"));
  const weightRaw = formData.get("weight");
  const repsRaw = formData.get("reps");

  await upsertSetLog(sessionId, userId, {
    blockExerciseId,
    setNumber,
    weight: weightRaw ? Number(weightRaw) : null,
    reps: repsRaw ? Number(repsRaw) : null,
    completed: true,
  });
  revalidatePath(`/app/sesiones/${sessionId}`);
}
