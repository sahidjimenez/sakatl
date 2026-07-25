import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { deleteRoutine, getRoutineDetail, handleApiError, updateRoutine } from "@/lib/routines";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUser();
    const { id } = await params;
    const routine = await getRoutineDetail(id);
    if (!routine) {
      return NextResponse.json({ error: "Rutina no encontrada." }, { status: 404 });
    }
    return NextResponse.json({ ...routine, isOwner: routine.ownerId === userId });
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
    const body = await request.json();
    const routine = await updateRoutine(id, userId, body);
    return NextResponse.json(routine);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUser();
    const { id } = await params;
    await deleteRoutine(id, userId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
