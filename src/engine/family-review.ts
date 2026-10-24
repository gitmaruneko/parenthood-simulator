import { reviewDataSchema, type ContentPack, type GameState } from "../domain/schemas.js";
import { describeFamily, createFamilyRun, type FamilyRun } from "./family-opening.js";
import { getPlayerView } from "./event-engine.js";

export const REVIEW_THEMES = {
  "growing-together": "一起慢慢長大",
  "dual-income-routine": "忙碌的雙薪日常",
  "supported-journey": "有人同行的旅程",
  "learning-self-care": "學著照顧自己",
  "repair-after-conflict": "一邊衝突一邊修復",
  "unexpected-growth": "意想不到的成長",
} as const;
export type FamilyReview = NonNullable<GameState["review"]>;

export function createFamilyReview(state: GameState, content: ContentPack): FamilyReview {
  if (!getPlayerView(state, content).completed) throw new Error("Review requires a completed story");
  const moments = state.history.filter((entry) => entry.kind === "event" && state.choiceHistory.some(
    (choice) => choice.eventId === entry.resolvedEventId && choice.turnId === entry.turnId));
  if (moments.length < 3) throw new Error("Review requires three recorded choices");
  const support = state.history.filter((entry) => entry.kind === "support");
  const repair = state.history.filter((entry) => entry.kind === "repair");
  const planning = state.history.filter((entry) => entry.kind === "planning");
  const confirmedChoices = state.choiceHistory.flatMap((choice) => {
    const selected = content.events.find((event) => event.id === choice.eventId)?.choices.find((item) => item.id === choice.choiceId);
    return selected ? [selected] : [];
  });
  // Frequency selects overlapping story descriptions, never a parenting score.
  // Ties follow this fixed catalogue order so the same history stays reproducible.
  const evidence: [FamilyReview["themes"][number], number][] = [
    ["growing-together", state.relationshipMemories.filter((memory) => memory.category === "connection").length],
    ["dual-income-routine", state.family.workArrangement === "dualIncome"
      ? confirmedChoices.filter((choice) => (choice.resourceDeltas.finances ?? 0) !== 0).length : 0],
    ["supported-journey", support.length],
    ["learning-self-care", confirmedChoices.filter((choice) => (choice.resourceDeltas.energy ?? 0) > 0).length],
    ["repair-after-conflict", repair.length],
    ["unexpected-growth", (state.reactionHistory ?? []).filter((reaction) =>
      reaction.kind === "understanding" && state.choiceHistory.some((choice) =>
        choice.turnId === reaction.turnId && choice.eventId === reaction.eventId && choice.anticipatedJudgment)).length],
  ];
  const themes = evidence.filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([theme]) => theme);
  if (!themes.length) themes.push("growing-together");
  const summary = describeFamily(state.family);
  const eligibleIds = new Set(moments.map((entry) => entry.id));
  const savedIds = state.review?.keyMomentIds;
  const savedSelection = savedIds?.length === 3 && new Set(savedIds).size === 3 && savedIds.every((id) => eligibleIds.has(id));
  const review: FamilyReview = {
    familySummary: summary.conditions.map((condition) => condition.neutralSummary).join("\n"),
    narrativeOverview: `從出生後的日常到約六歲，這個家庭留下了 ${state.choiceHistory.length} 次選擇。安排、記掛與收尾穿過不同階段；${support.length ? "有人接住生活中的一部分，" : "支持並非總在需要時出現，"}${repair.length ? "也有重新靠近的片刻。" : "有些事情仍留待以後再談。"}這些經歷可以同時包含疲憊、快樂與未完成的事。`,
    timeline: [...content.ageStages].sort((a, b) => a.order - b.order).map((stage) => ({
      ageStageId: stage.id, title: `${stage.childAgeMonths} 個月`,
      storyEntryIds: state.history.filter((entry) => entry.ageStageId === stage.id).map((entry) => entry.id),
    })),
    keyMomentIds: savedSelection ? [...savedIds] : [moments[0]!.id, moments[Math.floor(moments.length / 2)]!.id, moments.at(-1)!.id],
    supportMomentIds: support.map((entry) => entry.id),
    repairMomentIds: repair.map((entry) => entry.id),
    endStateResources: { ...state.resources },
    themes,
    // Allowlist only static text and controlled theme labels. No interpolation of save text.
    safeShareText: `《今天也在養小孩》\n從出生後到約六歲，我走過了一段家庭日常。\n${themes.map((theme) => REVIEW_THEMES[theme]).join("、")}\n支持、疲憊與重新靠近，都可以留在同一段故事裡。這是遊戲中的家庭紀錄，沒有標準育兒答案。`,
  };
  return reviewDataSchema.parse(review);
}

export function selectReviewMoments(state: GameState, content: ContentPack, ids: readonly string[]): GameState {
  const generated = createFamilyReview(state, content);
  const eligible = new Set(state.history.filter((entry) => entry.kind === "event" && state.choiceHistory.some(
    (choice) => choice.eventId === entry.resolvedEventId && choice.turnId === entry.turnId)).map((entry) => entry.id));
  if (ids.length !== 3 || new Set(ids).size !== 3 || ids.some((id) => !eligible.has(id)))
    throw new Error("Select three distinct recorded choices");
  return { ...state, review: { ...generated, keyMomentIds: [...ids] } };
}

export function replayFamilyRun(state: GameState): FamilyRun {
  const run = createFamilyRun({ seed: state.seed });
  const origin = state.replayOrigin;
  // Legacy saves replay the default seed opening because no opening snapshot exists.
  if (!origin) return run;
  return { ...run, actors: structuredClone(origin.actors),
    state: { ...run.state, family: structuredClone(state.family), resources: { ...origin.resources },
      tendencies: { ...origin.tendencies }, rngState: origin.rngState, replayOrigin: structuredClone(origin) },
    summary: describeFamily(state.family) };
}
