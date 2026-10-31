import type { ContentPack, EventNode, GameState, JournalEntry } from "../domain/schemas.js";
import { describeActor, resolveNarrativeText } from "./actor-profiles.js";

type JournalState = Pick<GameState, "history" | "choiceHistory" | "reactionHistory">;
export interface JournalRecord {
  id: string; sourceHistoryId: string; eventHistoryId: string;
  ageStageId: string; turnId: string; kind: "choice" | "result" | "daily";
  text: string; choiceText?: string; legacy: boolean;
}

// History append order and source-local sequence are the only ordering authority.
// No content lookup: saved prose remains readable after content updates.
export function projectJournal(state: JournalState): JournalRecord[] {
  return state.history.flatMap((entry): JournalRecord[] => {
    const record = (id: string, kind: JournalRecord["kind"], text: string, choiceText?: string): JournalRecord => ({
      id, sourceHistoryId: entry.id, eventHistoryId: entry.id, ageStageId: entry.ageStageId,
      turnId: entry.turnId, kind, text, ...(choiceText ? { choiceText } : {}), legacy: true,
    });
    if (entry.journal !== undefined) return entry.journal.map(item => ({ ...item,
      eventHistoryId: "eventHistoryId" in item ? item.eventHistoryId : entry.id, ageStageId: entry.ageStageId, turnId: entry.turnId, legacy: false }));
    const reactions = (state.reactionHistory ?? []).filter(reaction => reaction.turnId === entry.turnId &&
      reaction.ageStageId === entry.ageStageId && reaction.text === entry.text);
    if (entry.kind === "reaction" && reactions.length === 1 && reactions[0]!.kind === "none") return [];
    const records = [record(`${entry.id}-legacy-0`, "result", entry.text)];
    if (!entry.resolvedEventId) return records;
    const choices = state.choiceHistory.filter(choice => choice.eventId === entry.resolvedEventId &&
      choice.turnId === entry.turnId && choice.ageStageId === entry.ageStageId);
    const occurrences = state.history.filter(other => other.resolvedEventId === entry.resolvedEventId &&
      other.turnId === entry.turnId && other.ageStageId === entry.ageStageId);
    if (choices.length === 1 && occurrences.length === 1) {
      const text = "你在這次事件做了選擇。";
      records.push(record(`${entry.id}-legacy-1`, "choice", text, text));
    }
    return records;
  });
}

// Called inside the same resolution, before trace construction or persistence.
export function snapshotJournal(before: GameState, after: GameState, event: EventNode,
  content: ContentPack, choice: EventNode["choices"][number] | null): GameState {
  const start = before.history.length;
  const anchor = after.history[start]!;
  let reactionOffset = 0;
  const seenResults = new Set<string>();
  const boundActors = (item: { actorText?: { actorId: string } | undefined }) =>
    item.actorText && [after.family.childId, ...after.family.persistentActorIds].includes(item.actorText.actorId)
      ? [item.actorText.actorId] : [];
  const effectTemplates = [...(event.storyEntries ?? []), ...(choice?.storyEntries ?? []),
    ...(after.reactionHistory ?? []).slice(before.reactionHistory?.length ?? 0).flatMap(reaction =>
      content.reactionPools.find(pool => pool.id === reaction.poolId)?.entries
        .find(entry => entry.id === reaction.reactionId)?.storyEntries ?? [])];
  let effectIndex = 0;
  const history = after.history.map((entry, index) => {
    if (index < start) return entry;
    const source = { id: `${entry.id}-journal-0`, sourceHistoryId: entry.id, eventHistoryId: anchor.id,
      eventId: event.id, sequence: 0, actorIds: [] as string[] };
    let journal: JournalEntry[];
    if (index === start && event.id === content.fallbackEventId) {
      journal = [];
    } else if (index === start && choice) {
      const context = event.journalContext ? resolveNarrativeText(event.journalContext, before) : anchor.text;
      journal = [{ ...source, kind: "choice", text: `${event.title}：${context}\n你選擇：${choice.text}`,
        choiceText: choice.text, choiceHistoryIndex: after.choiceHistory.length - 1,
        actorIds: [...new Set([...boundActors(event.journalContext ?? event), ...boundActors(choice)])] }];
    } else if (entry.kind === "reaction") {
      const reactionHistoryIndex = (before.reactionHistory?.length ?? 0) + reactionOffset++;
      const reaction = after.reactionHistory![reactionHistoryIndex]!;
      const actor = reaction.actorId && content.actors.find(actor => actor.id === reaction.actorId);
      journal = reaction.kind === "none" || !actor || !reaction.reactionId ? [] : [{ ...source, kind: "result",
        reactionHistoryIndex, actorIds: [actor.id],
        text: `${event.title}時，${describeActor(after, actor.id) ?? actor.displayName}：${reaction.text}` }];
    } else {
      journal = [{ ...source, kind: "result", text: `${event.title}：${entry.text}`,
        actorIds: index === start ? boundActors(event) : boundActors(effectTemplates[effectIndex++] ?? {}) }];
    }
    journal = journal.filter(item => {
      if (item.kind === "choice") return true;
      if (seenResults.has(item.text)) return false;
      seenResults.add(item.text); return true;
    });
    return { ...entry, journal };
  });
  return { ...after, history };
}
