import { expect, it } from "vitest";
import { createFamilyRun, createFamilyReview, getPlayerView, getReviewMomentEntries,
  projectJournal, selectReviewMoments, transitionGame } from "../src/engine/index.js";
import { createMvpContent } from "../src/content/mvp.js";
import { validateContentPack } from "../src/domain/content-validation.js";
import { createLocalSaveStore, LOCAL_SAVE_KEY, restoreGame, serializeGame } from "../src/persistence/index.js";
import { createPlayerSession } from "../src/ui/player-session.js";
import { UX_V2_FAMILIES } from "./helpers/ux-v2-scenarios.js";

for (const scenario of UX_V2_FAMILIES) {
  it.each(["coordinate", "carry"] as const)(`${scenario.name} seed=${scenario.seed}: %s crosses all UX boundaries for twelve stages`, async path => {
    const run = createFamilyRun({ seed: scenario.seed });
    expect(run.state.family).toMatchObject({ householdComposition: scenario.household, careParticipation: scenario.care });
    const content = createMvpContent(run.actors);
    expect(validateContentPack(content).success).toBe(true);
    const familyIds = new Set([run.state.family.childId, ...run.state.family.persistentActorIds]);
    const values = new Map<string, string>();
    const store = createLocalSaveStore({ getItem: key => values.get(key) ?? null,
      setItem: (key, value) => { values.set(key, value); } });
    let nextSeed: number = scenario.seed;
    let session = createPlayerSession(store, () => nextSeed);
    await session.check(); await session.newStory(); session.reveal(); await session.startFamily();
    let expected = transitionGame(run.state, content, { type: "ADVANCE" }).state;
    let restoredPending = false; let restoredMidTurn = false;
    let deferredSchedulesChecked = 0;
    for (let step = 0; step < 200; step++) {
      const loaded = store.load();
      if (loaded.status !== "restored") throw new Error("missing checkpoint");
      expect(loaded.state).toEqual(expected);
      const game = session.getSnapshot().game!;
      expect(projectJournal({ history: game.history, choiceHistory: game.choices, reactionHistory: game.reactions }))
        .toEqual(projectJournal(expected));
      if (getPlayerView(expected, content).completed) break;
      const decision = session.getSnapshot().decision;
      expect(decision?.event ?? null).toEqual(getPlayerView(expected, content).pendingEvent);
      const choiceId = decision?.event.id.endsWith("-reconnect") ? "pause" : path;
      const input = decision ? { type: "CHOOSE" as const, choiceId } : game.nextInput!;
      const next = transitionGame(expected, content, input);
      for (const scheduled of next.state.scheduledFollowUps.filter(row => row.status === "pending" &&
          !next.state.completedEventIds.includes(row.eventId))) {
        deferredSchedulesChecked++;
        expect(next.state.history.some(entry => entry.resolvedEventId === scheduled.eventId)).toBe(false);
        expect(next.state.history.some(entry => entry.journal?.some(record =>
          record.kind !== "daily" && record.eventId === scheduled.eventId))).toBe(false);
      }
      if (decision) {
        if (!decision.event.id.endsWith("-reconnect"))
          expect(decision.event.choices.some(choice => choice.id === "handoff")).toBe(familyIds.has("caregiver-2"));
        // Reconnect choices intentionally have no family-specific handoff action.
        if (decision.event.id.endsWith("-reconnect")) {
          expect(decision.event.choices.map(choice => choice.id)).toEqual(["talk", "pause"]);
        }
        const submitted = session.choose(choiceId, decision.key);
        await session.choose(choiceId, decision.key);
        await submitted;
      } else await session.advance();
      for (const checkpoint of next.trace) {
        const restored = restoreGame(serializeGame(checkpoint.afterState));
        expect(restored).toMatchObject({ status: "restored", state: checkpoint.afterState });
        expect(checkpoint.afterState.turn?.nodeCount ?? 0).toBeLessThanOrEqual(4);
        expect(checkpoint.afterState.ageStageProgress?.nodeCount ?? 0).toBeLessThanOrEqual(6);
      }
      expected = next.state;
      if ((!restoredPending && expected.turn?.status === "awaitingInput") ||
          (!restoredMidTurn && expected.turn?.status === "active" && expected.turn.nodeCount > 0)) {
        restoredPending ||= expected.turn?.status === "awaitingInput";
        restoredMidTurn ||= expected.turn?.status === "active";
        const raw = values.get(LOCAL_SAVE_KEY);
        session = createPlayerSession(store, () => nextSeed);
        await session.check(); await session.resume();
        expect(values.get(LOCAL_SAVE_KEY)).toBe(raw);
      }
    }
    expect(restoredPending).toBe(true); expect(restoredMidTurn).toBe(true);
    expect(deferredSchedulesChecked).toBeGreaterThan(0);
    expect(expected.completedAgeStages).toHaveLength(12);
    expect(session.getSnapshot().game!.review).toEqual(createFamilyReview(expected, content));
    const journal = projectJournal(expected);
    expect(new Set(journal.map(row => row.id)).size).toBe(journal.length);
    const daily = journal.filter(row => row.kind === "daily");
    expect(daily).toHaveLength(4);
    expect(new Set(daily.map(row => row.text)).size).toBe(daily.length);
    expect(new Set(daily.map(row => row.turnId)).size).toBe(daily.length);
    for (const reaction of expected.reactionHistory ?? []) {
      if (!reaction.actorId) continue;
      const actor = content.actors.find(actor => actor.id === reaction.actorId);
      expect(actor).toBeDefined();
      if (actor?.role === "partner" || actor?.role === "grandparent" || actor?.role === "child")
        expect(familyIds.has(reaction.actorId)).toBe(true);
    }
    for (const entry of expected.history) for (const record of entry.journal ?? []) {
      for (const id of record.actorIds) {
        const actor = content.actors.find(actor => actor.id === id);
        expect(actor).toBeDefined();
        if (actor?.role === "partner" || actor?.role === "grandparent" || actor?.role === "child")
          expect(familyIds.has(id)).toBe(true);
      }
      if (record.kind === "result" && record.reactionHistoryIndex !== undefined) {
        const actual = expected.reactionHistory![record.reactionHistoryIndex]!;
        expect(actual.kind).not.toBe("none");
        expect(record.actorIds).toEqual([actual.actorId]);
        expect(record.text.endsWith(actual.text)).toBe(true);
      }
    }
    const moments = getReviewMomentEntries(expected.history, expected.choiceHistory).slice(-3).reverse().map(row => row.id);
    await session.selectMoments(moments);
    const selected = selectReviewMoments(expected, content, moments);
    expect(store.load()).toMatchObject({ status: "restored", state: selected });
    const review = createFamilyReview(selected, content);
    const dailyIds = new Set(daily.map(row => row.sourceHistoryId));
    expect([...review.keyMomentIds, ...review.supportMomentIds, ...review.repairMomentIds].some(id => dailyIds.has(id))).toBe(false);
    expect(review.timeline.flatMap(stage => stage.storyEntryIds)).toEqual(selected.history.map(row => row.id));
    expect(createFamilyReview({ ...selected, history: selected.history.filter(row => !dailyIds.has(row.id)) }, content).themes).toEqual(review.themes);
    expect(review.safeShareText).not.toMatch(/rngState|seed|finances|energy|PRIVATE/);
    const completedRaw = values.get(LOCAL_SAVE_KEY)!;
    if (path === "coordinate") {
      await session.replay(); await session.confirmNew(); await session.startFamily();
      expect(store.load()).toMatchObject({ status: "restored", state: transitionGame(run.state, content, { type: "ADVANCE" }).state });
    } else {
      nextSeed = scenario.seed + 1000;
      await session.newStory(); await session.confirmNew(); session.reveal(); await session.startFamily();
      expect(store.load()).toMatchObject({ status: "restored", state: { seed: nextSeed, choiceHistory: [] } });
    }
    expect([...values].some(([key, raw]) => key.startsWith(`${LOCAL_SAVE_KEY}.preserved.`) && raw === completedRaw)).toBe(true);
  });
}
