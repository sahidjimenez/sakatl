import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import {
  createRoutine,
  handleApiError,
  listCommunityRoutines,
  listMyRoutines,
  searchCommunityUsers,
} from "@/lib/routines";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUser();
    const params = request.nextUrl.searchParams;
    const scope = params.get("scope") === "community" ? "community" : "mine";

    if (scope === "community") {
      const offset = Number(params.get("offset") ?? 0) || 0;
      const limit = Math.min(Number(params.get("limit") ?? 24) || 24, 60);
      const q = params.get("q") ?? undefined;
      const [items, people] = await Promise.all([
        listCommunityRoutines(userId, offset, limit, q),
        q ? searchCommunityUsers(userId, q) : Promise.resolve([]),
      ]);
      return NextResponse.json({ items, people });
    }

    const items = await listMyRoutines(userId);
    return NextResponse.json({ items });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUser();
    const body = await request.json();
    const routine = await createRoutine(userId, body);
    return NextResponse.json(routine, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
