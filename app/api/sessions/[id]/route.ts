import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { completeSession, getSessionDetail, handleApiError } from "@/lib/routines";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUser();
    const { id } = await params;
    const session = await getSessionDetail(id, userId);
    return NextResponse.json(session);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUser();
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    if (body.completed !== true) {
      return NextResponse.json(
        { error: "Solo se soporta { completed: true }." },
        { status: 400 },
      );
    }
    const session = await completeSession(id, userId);
    return NextResponse.json(session);
  } catch (error) {
    return handleApiError(error);
  }
}
