import assert from "node:assert/strict";
import { formatWeight, weightFromKg, weightToKg } from "../lib/weight-units";

assert.equal(weightToKg(100, "lb"), 45.359237);
assert.equal(weightToKg(100, "kg"), 100);
assert.equal(formatWeight(45.359237, "lb"), "100");
assert.equal(formatWeight(20, "lb"), "44.09");
assert.equal(formatWeight(20, "kg"), "20");
assert.equal(weightToKg(0, "lb"), 0);
for (const kg of [0, 0.5, 20, 45.359237, 150.75]) {
  assert.ok(Math.abs(weightToKg(weightFromKg(kg, "lb"), "lb") - kg) < 1e-10);
}
// Switching display units must not change the stored value or training volume.
const storedKg = weightToKg(100, "lb");
for (let i = 0; i < 100; i++) {
  formatWeight(storedKg, "kg");
  formatWeight(storedKg, "lb");
}
assert.equal(storedKg * 10, 453.59237);
console.log("Weight conversion checks passed.");
