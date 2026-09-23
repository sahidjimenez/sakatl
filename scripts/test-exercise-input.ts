import assert from "node:assert/strict";
import { exerciseInput } from "../lib/exercise-input";
import { parseExerciseVideo } from "../lib/exercise-video";
import { ASSISTING_MUSCLES, assistingMuscleLabel } from "../lib/exercise-muscles";

const base = { name: "Press de banca", description: "Empuja la barra con control.", muscleGroup: "Pecho", equipment: "Barra", steps: ["Colócate en el banco."] };
assert.deepEqual(exerciseInput.parse(base).assistingMuscles, []);
assert.equal(exerciseInput.parse(base).videoUrl, "");
assert.ok(exerciseInput.safeParse({ ...base, assistingMuscles: ["Hombros", "Tríceps"] }).success);
const detailed = ["Deltoides anterior", "Deltoides posterior", "Trapecio", "Sóleo"];
assert.ok(exerciseInput.safeParse({ ...base, assistingMuscles: detailed }).success);
assert.deepEqual(detailed.map(label => assistingMuscleLabel(ASSISTING_MUSCLES.find(muscle => muscle.label === label)!.value)), detailed);
assert.equal(exerciseInput.safeParse({ ...base, assistingMuscles: ["Pectoral mayor"] }).success, false);
for (const assistingMuscles of [["Pecho"], ["Tríceps", "Tríceps"], ["Desconocido"]]) {
  assert.equal(exerciseInput.safeParse({ ...base, assistingMuscles }).success, false);
}
assert.equal(exerciseInput.safeParse({ ...base, muscleGroup: "", assistingMuscles: ["Hombros"] }).success, false);
for (const url of ["https://youtu.be/M7lc1UVf-VE?si=test", "https://www.youtube.com/shorts/M7lc1UVf-VE", "https://www.youtube.com/watch?v=M7lc1UVf-VE"]) {
  assert.equal(parseExerciseVideo(url)?.embedUrl, "https://www.youtube.com/embed/M7lc1UVf-VE");
  assert.ok(exerciseInput.safeParse({ ...base, videoUrl: url }).success);
}
assert.equal(parseExerciseVideo("https://www.instagram.com/reel/Abc_123/?igsh=test")?.embedUrl, "https://www.instagram.com/reel/Abc_123/embed/");
assert.equal(parseExerciseVideo("https://www.tiktok.com/@scout2015/video/6718335390845095173")?.embedUrl, "https://www.tiktok.com/player/v1/6718335390845095173");
for (const url of ["javascript:alert(1)", "https://youtube.com.evil.test/watch?v=M7lc1UVf-VE", "https://youtube.com@evil.test/watch?v=M7lc1UVf-VE", "http://www.youtube.com/watch?v=M7lc1UVf-VE", "https://www.instagram.com/some-profile/", "https://www.youtube.com/watch?v=invalid", "https://www.youtube.com:8443/watch?v=M7lc1UVf-VE"]) {
  assert.equal(parseExerciseVideo(url), null);
  assert.equal(exerciseInput.safeParse({ ...base, videoUrl: url }).success, false);
}
console.log("Exercise input and video validation checks passed.");
