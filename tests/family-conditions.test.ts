import { describe, expect, it } from "vitest";
import { validateFamilyConditionCatalogue } from "../src/domain/index.js";
import { FAMILY_CONDITIONS } from "../src/content/family-conditions.js";
import { createFamilyRun, describeFamily } from "../src/engine/index.js";

describe("Family condition content validation", () => {
  it("validates complete neutral fictional context and rejects unsourced or unreviewed statistics", () => {
    expect(validateFamilyConditionCatalogue(FAMILY_CONDITIONS).success).toBe(true);
    const withStatistic = (overrides: Record<string, unknown>) => [
      { ...FAMILY_CONDITIONS[0], neutralSummary: "研究中有 35% 的照顧者可能需要協調接送。", ...overrides },
      ...FAMILY_CONDITIONS.slice(1),
    ];
    expect(validateFamilyConditionCatalogue(withStatistic({})).success).toBe(false);
    const sources = [{ title: "Example published survey", url: "https://example.org/survey" }];
    expect(validateFamilyConditionCatalogue(withStatistic({ sourceReferences: sources })).success).toBe(false);
    expect(validateFamilyConditionCatalogue(withStatistic({ sourceReferences: sources, reviewStatus: "reviewed" })).success).toBe(true);
    expect(validateFamilyConditionCatalogue(withStatistic({ sourceReferences: [{ title: "invalid", url: "javascript:alert(1)" }], reviewStatus: "reviewed" })).success).toBe(false);
    const chineseStatistic = withStatistic({ neutralSummary: "約三成家庭可能需要協調接送。" });
    expect(validateFamilyConditionCatalogue(chineseStatistic).success).toBe(false);
  });

  it("rejects incomplete, ambiguous or ranking content with locatable diagnostics", () => {
    const replaceFirst = (fields: Record<string, unknown>) => [{ ...FAMILY_CONDITIONS[0], ...fields }, ...FAMILY_CONDITIONS.slice(1)];
    for (const invalid of [
      FAMILY_CONDITIONS.slice(1), [...FAMILY_CONDITIONS, FAMILY_CONDITIONS[0]],
      replaceFirst({ value: "shared" }), replaceFirst({ careImpacts: [] }),
      replaceFirst({ reviewStatus: "published" }), replaceFirst({ neutralSummary: "這種家庭比較幸福。" }),
      replaceFirst({ neutralSummary: "收入較高一定能讓孩子成功。" }),
      replaceFirst({ neutralSummary: "這是好媽媽的家庭。" }),
      replaceFirst({ statistics: ["此研究的照顧負擔比較結果。"] }),
    ]) {
      const result = validateFamilyConditionCatalogue(invalid);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues.length).toBeGreaterThan(0);
    }
    const result = validateFamilyConditionCatalogue(replaceFirst({ neutralSummary: "35% 的家庭可能需要備援。" }));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]).toMatchObject({ path: [0, "sourceReferences"], message: expect.stringContaining("household-single") });
  });

  it("derives condition IDs only from FamilyProfile and isolates display copies", () => {
    const run = createFamilyRun({ seed: 42 });
    const before = structuredClone(run.summary);
    expect(describeFamily(run.state.family)).toEqual(before);
    run.summary.conditions[0]!.neutralSummary = "caller changed the display copy";
    expect(createFamilyRun({ seed: 42 }).summary).toEqual(before);
    expect(describeFamily(run.state.family)).toEqual(before);
  });
});
