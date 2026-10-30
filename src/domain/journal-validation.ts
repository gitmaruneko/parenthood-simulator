import { z } from "zod";
import type { GameState } from "./schemas.js";

export function validateJournal(state: GameState, ctx: z.RefinementCtx): void {
  const ids = new Set<string>();
  const usedChoices = new Set<number>();
  const usedReactions = new Set<number>();
  const familyActors = [state.family.childId, ...state.family.persistentActorIds];
  const fail = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  state.history.forEach((entry, historyIndex) => {
    entry.journal?.forEach((item, sequence) => {
      const anchorMatches = state.history.filter(anchor => anchor.id === item.eventHistoryId);
      const anchor = anchorMatches[0];
      if (ids.has(item.id) || item.id !== `${entry.id}-journal-${sequence}` ||
          item.sourceHistoryId !== entry.id || item.sequence !== sequence ||
          state.history.filter(source => source.id === entry.id).length !== 1 ||
          anchorMatches.length !== 1 || !anchor || anchor.resolvedEventId !== item.eventId ||
          anchor.turnId !== entry.turnId || anchor.ageStageId !== entry.ageStageId ||
          state.history.indexOf(anchor) > historyIndex) fail("invalid journal source or ordering");
      ids.add(item.id);
      if (new Set(item.actorIds).size !== item.actorIds.length) fail("duplicate journal actors");
      if (item.kind === "choice") {
        const choice = state.choiceHistory[item.choiceHistoryIndex];
        if (usedChoices.has(item.choiceHistoryIndex) || item.eventHistoryId !== entry.id || entry.kind !== "event" ||
            !choice || choice.eventId !== item.eventId || choice.turnId !== entry.turnId ||
            choice.ageStageId !== entry.ageStageId || !item.text.endsWith(item.choiceText) ||
            item.actorIds.some(id => !familyActors.includes(id))) fail("invalid journal choice occurrence");
        usedChoices.add(item.choiceHistoryIndex);
      } else if (item.reactionHistoryIndex !== undefined) {
        const reaction = state.reactionHistory?.[item.reactionHistoryIndex];
        if (usedReactions.has(item.reactionHistoryIndex) || entry.kind !== "reaction" || !reaction ||
            reaction.kind === "none" || !reaction.reactionId || !reaction.actorId ||
            reaction.eventId !== item.eventId || reaction.turnId !== entry.turnId ||
            reaction.ageStageId !== entry.ageStageId || reaction.text !== entry.text ||
            !item.text.endsWith(reaction.text) || item.actorIds.length !== 1 || item.actorIds[0] !== reaction.actorId)
          fail("invalid journal reaction occurrence");
        usedReactions.add(item.reactionHistoryIndex);
      } else if (entry.kind === "reaction" || item.actorIds.some(id => !familyActors.includes(id))) {
        fail("invalid journal result actors");
      }
    });
  });
}
