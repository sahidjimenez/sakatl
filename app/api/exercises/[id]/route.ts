import { NextResponse } from "next/server";
import { getExerciseById } from "@/lib/exercises";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const exercise = getExerciseById(id);
  if (!exercise) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(exercise);
}
