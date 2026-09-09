import { requireUser } from "@/lib/auth";
import { handleApiError } from "@/lib/routines";
import { assertBillingRequest } from "@/lib/billing/stripe";
import { openPortal } from "@/lib/billing/service";
export async function POST(request: Request) {
  try {
    assertBillingRequest(request);
    return Response.json({ url: await openPortal(await requireUser()) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return handleApiError(error); }
}
