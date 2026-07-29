import { NextResponse } from "next/server";
import { getUsersScheduledToday } from "@/lib/routines";
import { sendPushToUser } from "@/lib/push";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const scheduled = await getUsersScheduledToday();
  await Promise.all(
    scheduled.map((s) =>
      sendPushToUser(s.userId, {
        title: "Hoy toca entrenar 💪",
        body: `Tienes agendada: ${s.routineName}`,
        url: "/app",
      }),
    ),
  );

  return NextResponse.json({ sent: scheduled.length });
}
