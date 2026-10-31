import { z } from "zod";
import type { GameState } from "./schemas.js";

export function validateJournal(state: GameState, ctx: z.RefinementCtx): void {
  const ids = new Set<string>();
  const usedChoices = new Set<number>();
  const usedReactions = new Set<number>();
  const familyActors = [state.family.childId, ...state.family.persistentActorIds];
  const reactionRows = state.history.filter(entry => entry.kind === "reaction");
  let latestAnchor: GameState["history"][number] | undefined;
  let lastChoiceIndex = -1;
  let lastReactionIndex = -1;
  const fail = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  state.history.forEach((entry, historyIndex) => {
    if (entry.resolvedEventId) latestAnchor = entry;
    entry.journal?.forEach((item, sequence) => {
      const anchorMatches = state.history.filter(anchor => anchor.id === item.eventHistoryId);
      const anchor = anchorMatches[0];
      if (ids.has(item.id) || item.id !== `${entry.id}-journal-${sequence}` ||
          item.sourceHistoryId !== entry.id || item.sequence !== sequence ||
          state.history.filter(source => source.id === entry.id).length !== 1 ||
          anchorMatches.length !== 1 || !anchor || anchor !== latestAnchor || anchor.resolvedEventId !== item.eventId ||
          anchor.turnId !== entry.turnId || anchor.ageStageId !== entry.ageStageId ||
          state.history.indexOf(anchor) > historyIndex) fail("invalid journal source or ordering");
      ids.add(item.id);
      if (new Set(item.actorIds).size !== item.actorIds.length) fail("duplicate journal actors");
      if (item.kind === "choice") {
        const choice = state.choiceHistory[item.choiceHistoryIndex];
        const sameOccurrence = (other: { eventId?: string | undefined; resolvedEventId?: string | undefined; turnId: string; ageStageId: string }) =>
          (other.eventId ?? other.resolvedEventId) === item.eventId && other.turnId === entry.turnId && other.ageStageId === entry.ageStageId;
        const anchors = state.history.filter(sameOccurrence);
        const choices = state.choiceHistory.map((other, index) => ({ other, index })).filter(({ other }) => sameOccurrence(other));
        const unambiguous = anchors.length === choices.length;
        if (usedChoices.has(item.choiceHistoryIndex) || item.choiceHistoryIndex <= lastChoiceIndex ||
            (unambiguous && choices[anchors.indexOf(entry)]?.index !== item.choiceHistoryIndex) ||
            item.eventHistoryId !== entry.id || entry.kind !== "event" ||
            !choice || choice.eventId !== item.eventId || choice.turnId !== entry.turnId ||
            choice.ageStageId !== entry.ageStageId || !item.text.endsWith(item.choiceText) ||
            item.actorIds.some(id => !familyActors.includes(id))) fail("invalid journal choice occurrence");
        usedChoices.add(item.choiceHistoryIndex);
        lastChoiceIndex = item.choiceHistoryIndex;
      } else if (item.reactionHistoryIndex !== undefined) {
        const reaction = state.reactionHistory?.[item.reactionHistoryIndex];
        if (usedReactions.has(item.reactionHistoryIndex) || item.reactionHistoryIndex <= lastReactionIndex ||
            (reactionRows.length === state.reactionHistory?.length && reactionRows.indexOf(entry) !== item.reactionHistoryIndex) ||
            entry.kind !== "reaction" || !reaction ||
            reaction.kind === "none" || !reaction.reactionId || !reaction.actorId ||
            reaction.eventId !== item.eventId || reaction.turnId !== entry.turnId ||
            reaction.ageStageId !== entry.ageStageId || reaction.text !== entry.text ||
            !item.text.endsWith(reaction.text) || item.actorIds.length !== 1 || item.actorIds[0] !== reaction.actorId)
          fail("invalid journal reaction occurrence");
        usedReactions.add(item.reactionHistoryIndex);
        lastReactionIndex = item.reactionHistoryIndex;
      } else if (entry.kind === "reaction" || item.actorIds.some(id => !familyActors.includes(id))) {
        fail("invalid journal result actors");
      }
    });
  });
}
