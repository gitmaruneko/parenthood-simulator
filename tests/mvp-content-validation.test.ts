import { describe, expect, it } from "vitest";
import { AGE_STAGE_MONTHS, eventNodeSchema, validateContentPack } from "../src/domain/index.js";
import { createMvpContent } from "../src/content/mvp.js";

describe("MVP content contract", () => {
  it("validates all events, references, weights, entry paths and termination guards", () => {
    const content = createMvpContent();
    const result = validateContentPack(content);
    expect(result.success, JSON.stringify(result.issues)).toBe(true);
    expect(content.events.length).toBeGreaterThanOrEqual(30);
    expect(content.ageStages.map((stage) => stage.childAgeMonths)).toEqual(AGE_STAGE_MONTHS);
    expect(new Set(content.requiredEventIds)).toEqual(new Set(content.events.map((event) => event.id)));
    for (const event of content.events) {
      expect(eventNodeSchema.safeParse(event).success, `schema: ${event.id}`).toBe(true);
      expect(event.text.length, `complete narrative: ${event.id}`).toBeGreaterThan(15);
    }
  });

  it("keeps knowledge cards after choices with checkable editorial status", () => {
    const content = createMvpContent();
    expect(content.knowledgeCards.length).toBeGreaterThanOrEqual(12);
    for (const event of content.events.filter((event) => event.kind === "choice")) {
      expect(event.knowledgeCardIds, `pre-answer cards: ${event.id}`).toEqual([]);
      for (const choice of event.choices) {
        expect(choice.knowledgeCardIds.length, `result card: ${event.id}/${choice.id}`).toBeGreaterThan(0);
      }
    }
    for (const card of content.knowledgeCards) {
      expect(card.reviewStatus, `editorial status: ${card.id}`).toBe("draft");
      expect(card.summary, `visible draft: ${card.id}`).toContain("草稿");
      expect(card.medicalDisclaimer, `health boundary: ${card.id}`).toContain("專業");
    }
  });
});
