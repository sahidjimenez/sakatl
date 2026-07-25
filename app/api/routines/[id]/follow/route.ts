import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { followRoutine, handleApiError } from "@/lib/routines";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUser();
    const { id } = await params;
    const routine = await followRoutine(id, userId);
    return NextResponse.json(routine, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
