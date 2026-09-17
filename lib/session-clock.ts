export type ClockInput = { activeSeconds: number; runningSince: Date | null; lastActivityAt: Date; completedAt: Date | null };

export function calculateSessionClock(session: ClockInput, minutes: number, now = new Date()) {
  const deadline = session.runningSince && minutes > 0
    ? session.lastActivityAt.getTime() + minutes * 60_000 : null;
  const end = Math.min(now.getTime(), deadline ?? now.getTime());
  const activeSeconds = session.activeSeconds + (session.runningSince && !session.completedAt
    ? Math.max(0, Math.floor((end - session.runningSince.getTime()) / 1000)) : 0);
  const paused = !session.completedAt && (!session.runningSince || (deadline !== null && now.getTime() >= deadline));
  return { activeSeconds, paused, deadline, completed: Boolean(session.completedAt) };
}
