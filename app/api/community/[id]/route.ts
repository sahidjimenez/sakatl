import { NextResponse } from "next/server";
import { getRoutineDetail } from "@/lib/routines";

// Lectura pública, sin autenticación: usada por /comunidad para que un
// invitado pueda "seguir" (clonar a su localStorage) una rutina de otro
// usuario sin crear cuenta.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const routine = await getRoutineDetail(id);
  if (!routine) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(routine);
}
