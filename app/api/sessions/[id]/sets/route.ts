import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { handleApiError, upsertSetLog } from "@/lib/routines";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const log = await upsertSetLog(id, userId, body);
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
