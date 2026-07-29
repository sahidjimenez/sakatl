import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { removeSubscription } from "@/lib/push";

export async function POST(request: Request) {
  await requireUser();
  const { endpoint } = (await request.json()) as { endpoint?: string };
  if (typeof endpoint === "string" && endpoint) {
    await removeSubscription(endpoint);
  }
  return NextResponse.json({ ok: true });
}
