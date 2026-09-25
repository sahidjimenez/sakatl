import assert from "node:assert/strict";
import { summarizeSets, summaryDuration } from "../lib/session-summary";

assert.deepEqual(summarizeSets([]), { volumeKg: 0, exercises: 0 });
assert.deepEqual(summarizeSets([
  { blockExerciseId: "squat", completed: true, weight: 20, reps: 10 },
  { blockExerciseId: "squat", completed: true, weight: 22.5, reps: 8 },
  { blockExerciseId: "pushup", completed: true, weight: null, reps: 12 },
  { blockExerciseId: "skipped", completed: false, weight: 100, reps: 10 },
]), { volumeKg: 380, exercises: 2 });
assert.equal(summaryDuration(0), "0:00");
assert.equal(summaryDuration(65), "1:05");
assert.equal(summaryDuration(3661), "61:01");
console.log("Session summary checks passed.");
