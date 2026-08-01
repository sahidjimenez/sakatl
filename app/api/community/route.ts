import { NextRequest, NextResponse } from "next/server";
import { handleApiError, listCommunityRoutines, searchCommunityUsers } from "@/lib/routines";

// Lectura pública, sin autenticación: usada por /comunidad para que los
// invitados puedan explorar rutinas sin crear cuenta. No expone likes/follow
// (eso sigue requiriendo sesión) y no excluye a ningún dueño ("" no coincide
// con ningún userId real de Clerk).
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const offset = Number(params.get("offset") ?? 0) || 0;
    const limit = Math.min(Number(params.get("limit") ?? 24) || 24, 60);
    const q = params.get("q") ?? undefined;

    const [items, people] = await Promise.all([
      listCommunityRoutines("", offset, limit, q),
      q ? searchCommunityUsers("", q) : Promise.resolve([]),
    ]);

    return NextResponse.json({ items, people });
  } catch (error) {
    return handleApiError(error);
  }
}
