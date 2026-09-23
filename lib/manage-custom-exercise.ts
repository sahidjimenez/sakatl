import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import sharp from "sharp";
import { z } from "zod";
import { getDb } from "./db";
import { customExercises, exerciseMedia } from "./db/schema";
import { ApiError } from "./errors";
import { exerciseInput, MAX_GIF_BYTES } from "./exercise-input";
import { ASSISTING_MUSCLES, MUSCLE_GROUPS } from "./exercise-muscles";

export function ownedExerciseFilter(id: string, ownerId: string) {
  if (!z.string().uuid().safeParse(id).success) throw new ApiError(404, "Ejercicio no encontrado.");
  return and(eq(customExercises.id, id), eq(customExercises.ownerId, ownerId),
    sql`${customExercises.record}->>'deleted_at' IS NULL`);
}

export async function editCustomExercise(id: string, ownerId: string, form: FormData) {
  const filter = ownedExerciseFilter(id, ownerId);
  let raw: unknown;
  try { raw = JSON.parse(String(form.get("exercise") ?? "{}")); }
  catch { throw new ApiError(400, "Los datos del ejercicio no son válidos."); }
  const parsed = exerciseInput.safeParse(raw);
  if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message ?? "Revisa los datos del ejercicio.");
  const file = form.get("gif");
  let bytes: Buffer | undefined;
  if (file !== null) {
    if (!(file instanceof File) || file.type !== "image/gif" || !file.size || file.size > MAX_GIF_BYTES) {
      throw new ApiError(400, "Sube un GIF válido de hasta 3 MB.");
    }
    bytes = Buffer.from(await file.arrayBuffer());
    try {
      const metadata = await sharp(bytes, { animated: true, limitInputPixels: 480 * 480 * 100 }).metadata();
      if (metadata.format !== "gif" || !metadata.width || metadata.width > 480 || (metadata.pageHeight ?? metadata.height ?? 0) > 480 || (metadata.pages ?? 1) > 100) throw new Error("Invalid GIF");
      await sharp(bytes, { animated: true, limitInputPixels: 480 * 480 * 100 }).stats();
    } catch { throw new ApiError(400, "El GIF es inválido. Genera la vista previa de nuevo."); }
  }
  return getDb().transaction(async tx => {
    const [existing] = await tx.select().from(customExercises).where(filter).for("update");
    if (!existing) throw new ApiError(404, "Ejercicio no encontrado o no te pertenece.");
    const input = parsed.data;
    if (!bytes && !existing.record.gif_url && !input.videoUrl) throw new ApiError(400, "Conserva un enlace de video o agrega un GIF.");
    const muscle = MUSCLE_GROUPS.find(group => group.label === input.muscleGroup)!.muscles[0];
    const image = bytes ? `custom/${id}.gif?v=${randomUUID()}` : existing.record.image;
    const record = { ...existing.record, name: input.name, category: input.muscleGroup,
      video_url: input.videoUrl,
      secondary_muscles: input.assistingMuscles.map(label => ASSISTING_MUSCLES.find(muscle => muscle.label === label)!.value),
      body_part: muscle, equipment: input.equipment, instructions: { es: input.description },
      instruction_steps: { es: input.steps }, muscle_group: muscle, target: muscle,
      image, gif_url: bytes ? image : existing.record.gif_url };
    await tx.update(customExercises).set({ record }).where(filter);
    if (bytes) await tx.insert(exerciseMedia).values({ exerciseId: id, data: bytes }).onConflictDoUpdate({ target: exerciseMedia.exerciseId, set: { data: bytes } });
    return record;
  });
}

export async function deleteCustomExercise(id: string, ownerId: string) {
  // Keep existing routine and session references resolvable after removal from the catalog.
  const rows = await getDb().update(customExercises).set({
    record: sql`jsonb_set(${customExercises.record}, '{deleted_at}', to_jsonb(${new Date().toISOString()}::text))`,
  }).where(ownedExerciseFilter(id, ownerId)).returning({ id: customExercises.id });
  if (!rows.length) throw new ApiError(404, "Ejercicio no encontrado o no te pertenece.");
}
