import assert from "node:assert/strict";
import { calculateSessionClock } from "../lib/session-clock";

const start = new Date("2026-09-17T12:00:00Z");
const session = { activeSeconds: 0, runningSince: start, lastActivityAt: new Date("2026-09-17T12:30:00Z"), completedAt: null };
const nextDay = new Date("2026-09-18T12:00:00Z");
const forgotten = calculateSessionClock(session, 15, nextDay);
assert.equal(forgotten.activeSeconds, 45 * 60);
assert.equal(forgotten.paused, true);
assert.equal(calculateSessionClock(session, 0, nextDay).activeSeconds, 24 * 3600);
assert.equal(calculateSessionClock(session, 0, nextDay).paused, false);
assert.equal(calculateSessionClock(session, 5, nextDay).activeSeconds, 35 * 60);
assert.equal(calculateSessionClock({ ...session, activeSeconds: 2700, runningSince: null }, 15, nextDay).activeSeconds, 2700);
const resumed = { ...session, activeSeconds: 2700, runningSince: nextDay, lastActivityAt: nextDay };
assert.equal(calculateSessionClock(resumed, 15, new Date(nextDay.getTime() + 5 * 60_000)).activeSeconds, 3000);
assert.equal(calculateSessionClock({ ...resumed, runningSince: null, completedAt: nextDay }, 15, nextDay).activeSeconds, 2700);
console.log("OK: ausencia de un dia, pausa configurable/desactivada, pausa manual, reanudacion y finalizacion.");
