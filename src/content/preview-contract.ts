import type { ContentPack, Condition } from "../domain/schemas.js";
import { TOY_CAR_CHAIN, TOY_CAR_ROOT } from "./toy-car-story.js";

/** Release authoring invariant, not a second runtime scheduler or selector. */
export function validatePreviewContract(content: ContentPack): void {
  const fail = () => { throw new Error("Preview guarantee contract violated"); };
  const event = (id: string) => content.events.find(event => event.id === id) ?? fail();
  const idsEqual = (actual: readonly string[], expected: readonly string[]) =>
    actual.length === expected.length && actual.every((id,index) => id === expected[index]);
  const follows = (condition: Condition, id: string): boolean => condition.kind === "eventCompleted" && condition.eventId === id;
  const excludes = (condition: Condition, id: string): boolean =>
    condition.kind === "eventNotCompleted" && condition.eventId === id ||
    condition.kind === "all" && condition.conditions.some(child => excludes(child, id));
  const [root, revisit, choice, close] = TOY_CAR_CHAIN.map(event);
  if (!root || !revisit || !choice || !close) fail();
  if (root!.immediateFollowUpEventIds.length || root!.scheduledFollowUps.length !== 1 ||
      root!.scheduledFollowUps[0]!.eventId !== revisit!.id || root!.scheduledFollowUps[0]!.delayTurns !== 1 ||
      root!.scheduledFollowUps[0]!.condition !== undefined ||
      (root!.scheduledFollowUps[0]!.targetAgeStageId ?? root!.ageStageId) !== "age-stage-8") fail();
  if (!idsEqual(revisit!.immediateFollowUpEventIds, [choice!.id]) || !idsEqual(choice!.immediateFollowUpEventIds, [close!.id]) ||
      !follows(revisit!.eligibility, root!.id) || !follows(choice!.eligibility, revisit!.id) || !follows(close!.eligibility, choice!.id)) fail();
  for (const node of [root!, revisit!, choice!, close!]) {
    if (node.ageStageId !== "age-stage-8" || node.repeatable || node.cooldownTurns || node.terminationGuard) fail();
    if (node !== root && node.scheduledFollowUps.length) fail();
    if (node.kind === "choice" && (node.choices.length < 2 || node.choices.some(option => option.requirements ||
      option.immediateFollowUpEventIds.length || option.scheduledFollowUps.length))) fail();
    for (const poolId of node.reactionPoolIds) {
      if (content.reactionPools.find(pool => pool.id === poolId)!.entries.some(reaction =>
        reaction.followUpEventIds.length || reaction.scheduledFollowUps?.length)) fail();
    }
  }
  if (close!.immediateFollowUpEventIds.length || revisit!.kind === "choice" || close!.kind === "choice" ||
      choice!.choices.some(option => !option.storyEntries?.some(entry => entry.kind === "repair"))) fail();
  const stage = content.ageStages.find(stage => stage.id === "age-stage-8")!;
  if (!idsEqual([...stage.entryEventIds].sort(), ["preschool-handoff-choice", TOY_CAR_ROOT].sort()) ||
      !excludes(root!.eligibility, "preschool-handoff-choice") || !excludes(event("preschool-handoff-choice").eligibility, TOY_CAR_ROOT)) fail();
  if (!idsEqual(content.ageStages.find(stage => stage.id === "age-stage-1")!.entryEventIds, ["night-handoff-choice"])) fail();
  for (const prefix of ["night-handoff", "preschool-handoff"]) {
    const first = event(`${prefix}-choice`), reflection = event(`${prefix}-reflection`);
    const support = event(`${prefix}-support`), strain = event(`${prefix}-strain`);
    const reconnect = event(`${prefix}-reconnect`), repair = event(`${prefix}-repair`);
    if (!idsEqual(first.immediateFollowUpEventIds, [reflection.id]) || first.scheduledFollowUps.length ||
        !follows(reflection.eligibility, first.id) || reflection.immediateFollowUpEventIds.length || reflection.scheduledFollowUps.length ||
        first.choices.filter(option => !option.requirements).length < 2 || first.planningLoadDelta && first.planningLoadDelta < 0) fail();
    for (const option of first.choices) {
      const scheduled = option.scheduledFollowUps[0];
      if (option.scheduledFollowUps.length !== 1 || option.immediateFollowUpEventIds.length || !scheduled ||
          scheduled.eventId !== (option.id === "carry" ? strain.id : support.id) || scheduled.delayTurns !== 1 ||
          scheduled.condition || (option.id === "carry" && (option.planningLoadDelta ?? 0) < 3)) fail();
    }
    for (const poolId of first.reactionPoolIds) {
      if (content.reactionPools.find(pool => pool.id === poolId)!.entries.some(reaction =>
        (reaction.planningLoadDelta ?? 0) < 0 || reaction.followUpEventIds.length || reaction.scheduledFollowUps?.length)) fail();
    }
    if (!follows(support.eligibility, first.id) || strain.eligibility.kind !== "planningLoadAtLeast" || strain.eligibility.value !== 3 ||
        !idsEqual(support.immediateFollowUpEventIds, [reconnect.id]) || !idsEqual(strain.immediateFollowUpEventIds, [reconnect.id]) ||
        !idsEqual(reconnect.immediateFollowUpEventIds, [repair.id]) || !follows(repair.eligibility, reconnect.id) ||
        reconnect.choices.length < 2 || reconnect.choices.some(option => option.requirements || option.scheduledFollowUps.length || option.immediateFollowUpEventIds.length) ||
        repair.kind !== "repair" || repair.immediateFollowUpEventIds.length || repair.scheduledFollowUps.length) fail();
  }
  // Existing deterministic support/planning anchor: no actor/response/wealth gate.
  const planning = event("shared-ownership-choice"), support = event("shared-ownership-reflection");
  if (!idsEqual(content.ageStages.find(stage => stage.id === "age-stage-6")!.entryEventIds, [planning.id]) ||
      planning.eligibility.kind !== "always" || !idsEqual(planning.immediateFollowUpEventIds, [support.id]) ||
      support.kind !== "support" || !follows(support.eligibility, planning.id) ||
      planning.choices.some(option => !option.storyEntries?.some(entry => entry.kind === "planning"))) fail();
}
