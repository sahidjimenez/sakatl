import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { customExercisesEnabled } from "@/lib/custom-exercises";
import { ApiError } from "@/lib/errors";
import { MAX_GIF_BYTES } from "@/lib/exercise-input";
import { deleteCustomExercise, editCustomExercise } from "@/lib/manage-custom-exercise";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

async function mutate(request: Request, context: Context, remove: boolean) {
  try {
    const ownerId = await requireUser();
    if (!customExercisesEnabled()) throw new ApiError(503, "Los ejercicios personalizados no están habilitados.");
    if (!checkRateLimit(`exercise-manage:${ownerId}`, 60, 60 * 60 * 1000).allowed) throw new ApiError(429, "Intenta de nuevo más tarde.");
    const { id } = await context.params;
    let exercise;
    if (remove) await deleteCustomExercise(id, ownerId);
    else {
      if (Number(request.headers.get("content-length")) > MAX_GIF_BYTES + 30_000) throw new ApiError(413, "El GIF supera 3 MB.");
      exercise = await editCustomExercise(id, ownerId, await request.formData());
    }
    revalidatePath("/app", "layout");
    revalidatePath("/ejercicios");
    return Response.json({ ok: true, id, exercise });
  } catch (error) {
    if (error instanceof ApiError) return Response.json({ error: error.message }, { status: error.status });
    console.error("Exercise management failed", error instanceof Error ? error.name : "Unknown error");
    return Response.json({ error: "No se pudo guardar el cambio. Intenta de nuevo." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: Context) { return mutate(request, context, false); }
export async function DELETE(request: Request, context: Context) { return mutate(request, context, true); }
