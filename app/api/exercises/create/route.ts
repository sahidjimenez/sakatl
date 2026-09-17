import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { getDb } from "@/lib/db";
import { customExercises, exerciseMedia } from "@/lib/db/schema";
import { customExercisesEnabled } from "@/lib/custom-exercises";
import { exerciseInput, MAX_GIF_BYTES } from "@/lib/exercise-input";
import { MUSCLE_GROUPS } from "@/lib/exercise-muscles";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ExerciseRecord } from "@/lib/exercises";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const ownerId = await requireUser();
    if (!customExercisesEnabled()) throw new ApiError(503, "La creación de ejercicios aún no está habilitada.");
    if (!checkRateLimit(`exercise-create:${ownerId}`, 10, 60 * 60 * 1000).allowed) {
      throw new ApiError(429, "Has creado varios ejercicios. Intenta de nuevo más tarde.");
    }
    if (Number(request.headers.get("content-length")) > MAX_GIF_BYTES + 30_000) throw new ApiError(413, "El GIF supera 3 MB.");
    const form = await request.formData();
    const raw = form.get("exercise");
    let parsed;
    try { parsed = exerciseInput.safeParse(JSON.parse(typeof raw === "string" ? raw : "{}")); }
    catch { throw new ApiError(400, "Los datos del ejercicio no son válidos."); }
    if (!parsed.success) throw new ApiError(400, "Revisa el nombre, descripción, músculo, equipo y pasos del ejercicio.");
    const file = form.get("gif");
    if (!(file instanceof File) || file.type !== "image/gif" || !file.size || file.size > MAX_GIF_BYTES) {
      throw new ApiError(400, "Sube un GIF válido de hasta 3 MB.");
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    try {
      const metadata = await sharp(bytes, { animated: true, limitInputPixels: 480 * 480 * 100 }).metadata();
      if (metadata.format !== "gif" || !metadata.width || metadata.width > 480 || (metadata.pageHeight ?? metadata.height ?? 0) > 480 || (metadata.pages ?? 1) > 100) throw new Error("Invalid GIF");
      await sharp(bytes, { animated: true, limitInputPixels: 480 * 480 * 100 }).stats();
    } catch { throw new ApiError(400, "El GIF es inválido o supera 480 px y 100 cuadros. Genera la vista previa de nuevo."); }
    const id = randomUUID();
    const path = `${id}.gif`;
    const input = parsed.data;
    const muscle = MUSCLE_GROUPS.find((group) => group.label === input.muscleGroup)!.muscles[0];
    const record: ExerciseRecord = {
      id, name: input.name, category: input.muscleGroup, body_part: muscle,
      equipment: input.equipment, instructions: { es: input.description },
      instruction_steps: { es: input.steps }, muscle_group: muscle,
      secondary_muscles: [], target: muscle, media_id: id,
      image: `custom/${path}`, gif_url: `custom/${path}`,
      attribution: "Ejercicio compartido por la comunidad de Sakatl.", created_at: new Date().toISOString(),
    };
    await getDb().transaction(async (tx) => {
      await tx.insert(customExercises).values({ id, ownerId, record });
      await tx.insert(exerciseMedia).values({ exerciseId: id, data: bytes });
    });
    return NextResponse.json({ id, exercise: {
      id, name: record.name, category: record.category, equipment: record.equipment,
      target: record.target, muscle_group: record.muscle_group, image: record.image,
    } }, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Exercise creation failed", error instanceof Error ? error.name : "Unknown error");
    return NextResponse.json({ error: "No se pudo guardar el ejercicio. Intenta de nuevo." }, { status: 500 });
  }
}
