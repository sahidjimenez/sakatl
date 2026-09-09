import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/routines";
import { assertBillingRequest } from "@/lib/billing/stripe";
import { startCheckout } from "@/lib/billing/service";

const input = z.object({ interval: z.enum(["month", "year"]), attemptId: z.uuid(), consent: z.literal(true) }).strict();
export async function POST(request: Request) {
  try {
    assertBillingRequest(request);
    const userId = await requireUser();
    const raw = await request.text();
    if (raw.length > 2048) return Response.json({ error: "Solicitud demasiado grande." }, { status: 413 });
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return Response.json({ error: "Solicitud no válida." }, { status: 400 }); }
    const parsed = input.safeParse(body);
    if (!parsed.success) return Response.json({ error: "Selecciona un plan y acepta la renovación antes de continuar." }, { status: 400 });
    const user = await currentUser();
    const url = await startCheckout(userId, parsed.data.interval, parsed.data.attemptId, user?.primaryEmailAddress?.emailAddress);
    return Response.json({ url }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return handleApiError(error); }
}
