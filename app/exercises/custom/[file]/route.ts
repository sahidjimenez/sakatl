import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { exerciseMedia } from "@/lib/db/schema";
import { customExercisesEnabled } from "@/lib/custom-exercises";

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.gif$/.test(file) || !customExercisesEnabled()) {
    return new Response(null, { status: 404 });
  }
  const [media] = await getDb().select({ data: exerciseMedia.data }).from(exerciseMedia).where(eq(exerciseMedia.exerciseId, file.slice(0, -4))).limit(1);
  if (!media) return new Response(null, { status: 404 });
  return new Response(Uint8Array.from(media.data), { headers: {
    "Content-Type": "image/gif",
    "Content-Length": String(media.data.length),
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  } });
}
