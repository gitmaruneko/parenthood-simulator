import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { afterAll, expect, it } from "vitest";
import { bindNarrativeA3Run, createRunContent } from "../src/content/releases.js";
import { createFamilyRun, transitionGame } from "../src/engine/index.js";
import { familyLifeDirectionIdSchema } from "../src/domain/family-life-direction.js";

const corpus = Array.from({ length: 4096 }, (_, index) =>
  createHash("sha256").update(`issue42-entry-v1/${index}`).digest().readUInt32BE(0));
const evidence: object[] = [];
afterAll(() => {
  if (process.env.NQA3_WRITE_EVIDENCE === "1") writeFileSync("docs/examples/NARRATIVE-A3-DISTRIBUTION.json",
    JSON.stringify({ releaseId: "narrative-quality-a3-v1", scope: "isolated stage 8; family seed 9; rngState from fixed corpus; not full #42 coverage",
      corpusSha256: "1d0459e3c86c7d6cc1510dba7c2e104a581540e494de14c14a6f3e60329adcc0", rows: evidence }, null, 2) + "\n");
});

it("pins the approved corpus before inspecting any selection results", () => {
  expect(new Set(corpus).size).toBe(4096);
  expect(createHash("sha256").update(corpus.map(seed => `${seed}\n`).join("")).digest("hex"))
    .toBe("1d0459e3c86c7d6cc1510dba7c2e104a581540e494de14c14a6f3e60329adcc0");
});

it.each(familyLifeDirectionIdSchema.options)("samples A3 release entries within predeclared tolerances: %s", direction => {
  const run = bindNarrativeA3Run(createFamilyRun({ seed: 9, firstAgeStageId: "age-stage-8" }));
  const content = createRunContent(run.state);
  const counts: Record<string, number> = { "nqa1-door-choice": 0, "toy-car-story-choice": 0 };
  for (const rngState of corpus) {
    const selected = transitionGame({ ...run.state, rngState, activeFamilyLifeDirectionId: direction }, content, { type: "ADVANCE" });
    expect(selected.pendingEvent).not.toBeNull();
    counts[selected.pendingEvent!.id]!++;
  }
  // Authored weights: both base=2; parent-child-time E=1.25, 08A=1.15; others=1.
  const p = direction === "parent-child-time" ? 1.15 / 2.4 : 0.5;
  const frequency = counts["toy-car-story-choice"]! / corpus.length;
  const tolerance = Math.max(0.025, 5 * Math.sqrt(p * (1 - p) / corpus.length));
  expect(Object.values(counts).reduce((a,b) => a+b)).toBe(4096);
  expect(Math.abs(frequency - p), JSON.stringify({ direction, counts, p, frequency, tolerance })).toBeLessThanOrEqual(tolerance);
  expect(Object.values(counts).every(count => count > 0)).toBe(true);
  evidence.push({ direction, n: corpus.length, counts, expectedToyCarProbability: p, toyCarFrequency: frequency,
    absoluteDeviation: Math.abs(frequency - p), tolerance, passed: true });
});

