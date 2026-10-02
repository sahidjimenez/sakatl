import assert from "node:assert/strict";
import { groupExerciseHistory } from "../lib/exercise-history";
import { getGuestExerciseHistory, type GuestRoutine, type GuestSession } from "../lib/guest/storage";

const grouped = groupExerciseHistory([
  { id: "b", exerciseId: "squat", sessionId: "old", date: "2026-09-01T12:00:00Z", routineName: "Pierna", setNumber: 2, weight: null, reps: 10 },
  { id: "a", exerciseId: "squat", sessionId: "old", date: "2026-09-01T12:00:00Z", routineName: "Pierna", setNumber: 1, weight: 0, reps: 12 },
  { id: "c", exerciseId: "squat", sessionId: "recent", date: "2026-09-03T12:00:00Z", routineName: "Full body", setNumber: 1, weight: 25, reps: 8 },
]);
assert.deepEqual(grouped.squat.map(session => session.sessionId), ["recent", "old"]);
assert.deepEqual(grouped.squat[1].sets.map(set => set.weight), [0, null]);
assert.deepEqual(groupExerciseHistory([]), {});

const data = new Map<string, string>();
Object.defineProperty(globalThis, "window", { value: { localStorage: {
  getItem: (key: string) => data.get(key) ?? null,
  setItem: (key: string, value: string) => data.set(key, value),
  removeItem: (key: string) => data.delete(key),
} }, configurable: true });
const routine: GuestRoutine = {
  id: "routine", name: "Pierna", description: null, scheduledDays: [], createdAt: "", updatedAt: "",
  blocks: [{ id: "block", type: "single", exercises: [{ id: "exercise", exerciseId: "squat", exerciseName: "Sentadilla", exerciseImage: null, plannedSets: 3, targetRepsMin: null, targetRepsMax: null, targetWeight: null }] }],
};
const previous: GuestSession = {
  id: "previous", routineId: routine.id, startedAt: "2026-09-01T12:00:00Z", completedAt: null, notes: null,
  setLogs: [
    { blockExerciseId: "exercise", setNumber: 1, weight: 30, reps: 10, completed: true, completedAt: null },
    { blockExerciseId: "exercise", setNumber: 2, weight: 35, reps: 8, completed: false, completedAt: null },
    { blockExerciseId: "extra", setNumber: 1, weight: 20, reps: 12, completed: true, completedAt: null },
  ],
  extraBlocks: [{ id: "extra-block", type: "single", exercises: [{ ...routine.blocks[0].exercises[0], id: "extra", exerciseId: "press" }] }],
};
const current = { ...previous, id: "current", startedAt: "2026-09-02T12:00:00Z" };
const future = { ...previous, id: "future", startedAt: "2026-09-03T12:00:00Z" };
const otherRoutine = { ...routine, id: "other", name: "Full body" };
const otherSession = { ...previous, id: "other-session", routineId: "other" };
data.set("sakatl:guest:routines", JSON.stringify([routine, otherRoutine]));
data.set("sakatl:guest:sessions", JSON.stringify([previous, current, future, otherSession]));
const history = getGuestExerciseHistory(current);
assert.equal(history.squat.length, 2);
assert.ok(history.squat.every(session => session.sets.length === 1 && session.sets[0].weight === 30));
assert.equal(history.press.length, 2);
assert.ok(history.squat.some(session => session.routineName === "Full body"));
assert.ok(Object.values(history).flat().every(session => session.sessionId !== "current" && session.sessionId !== "future"));
console.log("Exercise history: grouping, zero/missing weights, prior sessions, completed sets, cross-routine and extra exercises passed.");
