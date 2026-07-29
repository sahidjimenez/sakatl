import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { saveSubscription, type PushSubscriptionInput } from "@/lib/push";

export async function POST(request: Request) {
  const userId = await requireUser();
  const body = (await request.json()) as Partial<PushSubscriptionInput>;

  if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
    return NextResponse.json({ error: "Suscripción inválida." }, { status: 400 });
  }

  await saveSubscription(userId, body as PushSubscriptionInput);
  return NextResponse.json({ ok: true });
}
