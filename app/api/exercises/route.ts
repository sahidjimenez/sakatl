import { NextRequest, NextResponse } from "next/server";
import { searchExercises } from "@/lib/exercises";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const equipment = params.get("equipment") ?? "";
  const offset = Number(params.get("offset") ?? 0) || 0;
  const limit = Math.min(Number(params.get("limit") ?? 24) || 24, 60);

  const result = searchExercises({ q, category, equipment, offset, limit });
  return NextResponse.json(result);
}
