import { describe, expect, it } from "vitest";
import { eventNodeSchema, gameStateSchema, reactionEntrySchema } from "../src/domain/schemas.js";

import {
  initializePrngState,
  nextPrng,
  transitionGame,
  type EngineTransition,
} from "../src/engine/index.js";
import { AGE_STAGE_MONTHS, type ContentPack, type EventNode, type GameState } from "../src/domain/index.js";
import { createPlanningStory } from "../src/content/planning-story.js";

const makeChoiceEvent = (id: string, weight = 1): EventNode => ({
  id,
  ageStageId: "age-stage-1",
  kind: "choice",
  mode: "PLAYER_INPUT_REQUIRED",
  title: `事件 ${id}`,
  text: "今天的家庭生活需要做一個選擇。",
  weight,
  eligibility: { kind: "always" },
  actorIds: [],
  choices: [
    {
      id: "rest",
      text: "先休息一下",
      resourceDeltas: { energy: 10 },
      setFlags: [],
      relationshipMemoryIds: [],
      immediateFollowUpEventIds: [],
      scheduledFollowUps: [],
      knowledgeCardIds: [],
    },
    {
      id: "continue",
      text: "照原本的安排繼續",
      resourceDeltas: { energy: -5 },
      setFlags: [],
      relationshipMemoryIds: [],
      immediateFollowUpEventIds: [],
      scheduledFollowUps: [],
      knowledgeCardIds: [],
    },
  ],
  reactionPoolIds: [],
  knowledgeCardIds: [],
  immediateFollowUpEventIds: [],
  scheduledFollowUps: [],
  repeatable: false,
  cooldownTurns: 0,
});

const makeAutoEvent = (
  id: string,
  options: { repeatable?: boolean; maxVisits?: number; weight?: number } = {},
): EventNode => ({
  id,
  ageStageId: "age-stage-1",
  kind: "routine",
  mode: "AUTO_ADVANCE",
  title: `事件 ${id}`,
  text: "日常繼續往前。",
  weight: options.weight ?? 1,
  eligibility: { kind: "always" },
  actorIds: [],
  choices: [],
  reactionPoolIds: [],
  knowledgeCardIds: [],
  immediateFollowUpEventIds: [],
  scheduledFollowUps: [],
  repeatable: options.repeatable ?? false,
  cooldownTurns: 0,
  ...(options.maxVisits === undefined
    ? {}
    : { terminationGuard: { kind: "maxVisits" as const, count: options.maxVisits } }),
});

const makeContent = (events: EventNode[], entryEventIds = events.map((event) => event.id)): ContentPack => {
  const fallback = makeAutoEvent("safe-fallback");
  return {
    schemaVersion: 1,
    entryEventIds,
    fallbackEventId: fallback.id,
    requiredEventIds: [fallback.id, ...entryEventIds],
    ageStages: AGE_STAGE_MONTHS.map((childAgeMonths, order) => ({
      id: `age-stage-${order + 1}`,
      order,
      childAgeMonths,
      entryEventIds: order === 0 ? entryEventIds : [fallback.id],
      turnNodeLimit: 4,
      ageStageNodeLimit: 6,
    })),
    events: [...events, fallback],
    actors: [],
    reactionPools: [],
    knowledgeCards: [],
  };
};

const makeState = (seed = 123456789): GameState => ({
  schemaVersion: 1,
  seed,
  rngState: initializePrngState(seed),
  currentAgeStageId: "age-stage-1",
  currentTurnId: "turn-1",
  turn: {
    id: "turn-1",
    ageStageId: "age-stage-1",
    status: "active",
    nodeCount: 0,
    maxNodeCount: 4,
    activeEventId: null,
    processedEventIds: [],
  },
  eventProgress: null,
  resources: {
    finances: 50,
    energy: 50,
    support: 50,
    timeFlexibility: 50,
    connection: 50,
  },
  planningLoad: 0,
  family: {
    householdComposition: "singleCaregiver",
    careParticipation: "primaryAndBackup",
    workArrangement: "flexible",
    preferredAddress: "照顧者",
    childId: "child-1",
    persistentActorIds: [],
  },
  tendencies: {},
  flags: [],
  relationshipMemories: [],
  completedEventIds: [],
  scheduledFollowUps: [],
  choiceHistory: [],
  history: [],
});

const replay = (state: GameState, content: ContentPack): EngineTransition =>
  transitionGame(state, content, { type: "ADVANCE" });

describe("invisible planning work", () => {
  it.each(["pickup", "meals", "school-notices", "household"])("lets repeated %s responsibility unlock fatigue and support", (task) => {
    const content = makeContent(createPlanningStory("age-stage-1"), ["age-stage-1-planning"]);
    let state = makeState();
    for (let turn = 1; turn <= 2; turn += 1) {
      const waiting = replay(state, content);
      expect(waiting.pendingEvent?.choices.map((choice) => choice.id)).toContain(task);
      state = transitionGame(waiting.state, content, { type: "CHOOSE", choiceId: task }).state;
      if (turn === 1) {
        state = transitionGame(state, content, { type: "END_TURN" }).state;
        state = transitionGame(state, content, { type: "START_TURN" }).state;
      }
    }
    const result = replay(state, content);
    expect(result.state.completedEventIds).toContain("age-stage-1-support");
    expect(result.state.relationshipMemories.filter((memory) => memory.id === `age-stage-1-${task}`)).toHaveLength(2);
  });

  it("retains the stage budget when restoring support history without lifecycle metadata", () => {
    const support = { ...makeAutoEvent("support"), kind: "support" as const };
    const content = makeContent([support]);
    const first = transitionGame(makeState(), content, { type: "ADVANCE" }, { maxAutoAdvanceNodes: 1 });
    const { ageStageProgress, ...legacy } = first.state;
    const result = replay(legacy, content);
    expect(result.state.ageStageProgress?.nodeCount).toBe(2);
  });

  it("keeps large finite burden and tendency changes serializable", () => {
    const event = eventNodeSchema.parse({ ...makeChoiceEvent("heavy-work"),
      planningLoadDelta: Number.MAX_VALUE, tendencyDeltas: { responsibility: Number.MAX_VALUE },
      resourceDeltas: { energy: Number.MAX_VALUE }, choices: [
        { ...makeChoiceEvent("heavy-work").choices[0], planningLoadDelta: Number.MAX_VALUE,
          tendencyDeltas: { responsibility: Number.MAX_VALUE }, resourceDeltas: { energy: Number.MAX_VALUE } },
        makeChoiceEvent("heavy-work").choices[1],
      ] });
    const content = makeContent([event]);
    const initial = makeState();
    const result = transitionGame(replay(initial, content).state, content, { type: "CHOOSE", choiceId: "rest" });
    expect(gameStateSchema.safeParse(result.state).success).toBe(true);
    expect(result.state.planningLoad).toBe(Number.MAX_VALUE);
    expect(result.state.tendencies.responsibility).toBe(Number.MAX_VALUE);
    expect(result.results[0]!.resourceDeltas.energy).toBe(Number.MAX_VALUE);
    expect(JSON.parse(JSON.stringify(result.state))).toEqual(result.state);
  });

  it.each(["rest", "delegate"])("plays repeated responsibilities, support, and %s through a later repair at zero resources", (recovery) => {
    const events = createPlanningStory("age-stage-1");
    const content = makeContent(events, ["age-stage-1-planning"]);
    const initial = makeState();
    initial.resources = { finances: 0, energy: 0, support: 0, timeFlexibility: 0, connection: 0 };
    const play = (start: GameState) => {
      const transitions: EngineTransition[] = [];
      let state = start;
      const act = (input: Parameters<typeof transitionGame>[2]) => {
        const result = transitionGame(state, content, input);
        state = result.state;
        transitions.push(result);
        return result;
      };
      act({ type: "ADVANCE" });
      act({ type: "CHOOSE", choiceId: "pickup" });
      expect(state.planningLoad).toBe(2);
      act({ type: "END_TURN" });
      act({ type: "START_TURN" });
      act({ type: "ADVANCE" });
      act({ type: "CHOOSE", choiceId: "school-notices" });
      expect(state.planningLoad).toBe(4);
      const supported = act({ type: "ADVANCE" });
      expect(supported.pendingEvent?.id).toBe("age-stage-1-coordinate");
      expect(state.planningLoad).toBe(3);
      act({ type: "CHOOSE", choiceId: recovery });
      expect(state.planningLoad).toBe(1);
      expect(state.turn?.status).toBe("safelyEnded");
      act({ type: "START_TURN" });
      act({ type: "ADVANCE" });
      expect(state.planningLoad).toBe(0);
      expect(state.history.some((entry) => entry.kind === "support")).toBe(true);
      expect(state.history.some((entry) => entry.kind === "repair")).toBe(true);
      expect(state.relationshipMemories.map((memory) => memory.category)).toEqual(["care", "care", "conflict", "support", "support", "repair"]);
      expect(state.flags).not.toContain("carrying-alone");
      expect(state.flags).not.toContain("strained");
      expect(state.flags).toContain("shared-plan");
      expect(gameStateSchema.parse(JSON.parse(JSON.stringify(state)))).toEqual(state);
      act({ type: "NEXT_AGE_STAGE" });
      expect(state.currentAgeStageId).toBe("age-stage-2");
      for (let stage = 2; stage <= 12; stage += 1) {
        act({ type: "ADVANCE" });
        const next = act({ type: "NEXT_AGE_STAGE" });
        if (stage === 12) expect(next.stopReason).toBe("GAME_COMPLETED");
      }
      return transitions;
    };
    expect(play(initial)).toEqual(play(gameStateSchema.parse(JSON.parse(JSON.stringify(initial)))));
    expect(initial.planningLoad).toBe(0);
    expect(initial.history).toEqual([]);
  });

  it("lets an independently selected partner response transform burden and remember shared ownership", () => {
    const { state, event, content } = reactionScenario();
    state.planningLoad = 4;
    state.flags = ["strained"];
    event.choices[0]!.planningLoadDelta = 1;
    content.reactionPools[0]!.entries = [reactionEntrySchema.parse({
      id: "take-over", kind: "support", text: "I can handle the whole pickup routine.", weight: 1,
      actorRoles: ["partner"], requirements: { kind: "planningLoadAtLeast", value: 5 },
      planningLoadDelta: -3, resourceDeltas: { energy: 3 }, tendencyDeltas: { sharedCare: 1 },
      clearFlags: ["strained"], setFlags: ["shared-pickup"],
      relationshipMemories: [{ id: "partner-pickup", category: "support", text: "The partner remembered, arranged, and followed up." }],
      storyEntries: [{ kind: "support", text: "The pickup plan has another owner now." }],
    })];
    content.actors[0] = { ...content.actors[0]!, id: "partner-1", role: "partner" };
    state.family.persistentActorIds = ["partner-1"];
    event.actorIds = ["partner-1"];
    const initial = structuredClone(state);
    const result = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" });
    expect(result.state.planningLoad).toBe(2);
    expect(result.state.flags).toEqual(["shared-pickup"]);
    expect(result.state.relationshipMemories).toContainEqual(expect.objectContaining({
      id: "partner-pickup", actorId: "partner-1", createdAtTurn: 1,
    }));
    expect(result.state.tendencies.sharedCare).toBe(1);
    expect(result.state.resources.energy).toBe(63);
    expect(result.results[0]!.resourceDeltas).toEqual({ energy: 13 });
    expect(state).toEqual(initial);
    expect(transitionGame(gameStateSchema.parse(JSON.parse(JSON.stringify(state))), content,
      { type: "CHOOSE", choiceId: "rest" })).toEqual(result);
  });

  it("lets rest, delegation, and repair reduce burden without erasing the relationship story", () => {
    const rest = eventNodeSchema.parse({ ...makeChoiceEvent("respite"), choices: [
      { ...makeChoiceEvent("respite").choices[0], planningLoadDelta: -3, tendencyDeltas: { selfCare: 1 },
        storyEntries: [{ kind: "support", text: "You paused the optional tasks and rested." }] },
      makeChoiceEvent("respite").choices[1],
    ] });
    const coordinate = eventNodeSchema.parse({ ...makeChoiceEvent("coordinate"),
      eligibility: { kind: "planningLoadAtLeast", value: 1 }, choices: [
        { ...makeChoiceEvent("coordinate").choices[0], planningLoadDelta: -4,
          tendencyDeltas: { sharedCare: 1, responsibility: -1 }, setFlags: ["workflow-delegated"],
          clearFlags: ["carrying-alone"],
          relationshipMemories: [{ id: "whole-workflow", category: "support", text: "A helper owns the reminders and follow-through too." }],
          immediateFollowUpEventIds: ["repair"] },
        makeChoiceEvent("coordinate").choices[1],
      ] });
    const repair = eventNodeSchema.parse({ ...makeAutoEvent("repair"), kind: "repair",
      eligibility: { kind: "all", conditions: [
        { kind: "flag", flag: "workflow-delegated" },
        { kind: "relationshipMemory", category: "conflict", withinTurns: 3 },
        { kind: "tendencyAtLeast", tendency: "sharedCare", value: 1 },
      ] }, planningLoadDelta: -4, resourceDeltas: { connection: 5 },
      clearFlags: ["strained"], setFlags: ["repair-started"],
      relationshipMemories: [{ id: "talked-again", category: "repair", text: "We acknowledged the rushed handoff and agreed to check in." }] });
    const content = makeContent([rest, coordinate, repair], [rest.id]);
    const initial = makeState();
    initial.planningLoad = 8;
    initial.flags = ["carrying-alone", "strained"];
    initial.relationshipMemories = [{ id: "handoff", category: "conflict", text: "A rushed handoff.",
      createdAtAgeStageId: initial.currentAgeStageId, createdAtTurn: 1 }];
    let state = transitionGame(replay(initial, content).state, content, { type: "CHOOSE", choiceId: "rest" }).state;
    expect(state.planningLoad).toBe(5);
    content.ageStages[0]!.entryEventIds = [coordinate.id];
    state = transitionGame(replay(state, content).state, content, { type: "CHOOSE", choiceId: "rest" }).state;
    expect(state.planningLoad).toBe(1);
    state = replay(state, content).state;
    expect(state.planningLoad).toBe(0);
    expect(state.flags).toEqual(["workflow-delegated", "repair-started"]);
    expect(state.tendencies).toMatchObject({ selfCare: 1, sharedCare: 1, responsibility: -1 });
    expect(state.relationshipMemories.map((memory) => memory.category)).toEqual(["conflict", "support", "repair"]);
    expect(state.history).toContainEqual(expect.objectContaining({ kind: "repair", text: repair.text }));
    expect(state.resources.connection).toBe(55);
    expect(gameStateSchema.parse(state)).toEqual(state);
  });

  it("turns accumulated work into fatigue and a state-triggered support scene", () => {
    const work = eventNodeSchema.parse({ ...makeChoiceEvent("work"), choices: [
      { ...makeChoiceEvent("work").choices[0], planningLoadDelta: 4, tendencyDeltas: { responsibility: 1 },
        relationshipMemories: [{ id: "school-notice", category: "care", text: "You tracked the school notice." }],
        immediateFollowUpEventIds: ["fatigue"] }, makeChoiceEvent("work").choices[1],
    ] });
    const fatigue = eventNodeSchema.parse({ ...makeAutoEvent("fatigue"),
      eligibility: { kind: "all", conditions: [
        { kind: "planningLoadAtLeast", value: 4 },
        { kind: "tendencyAtLeast", tendency: "responsibility", value: 1 },
        { kind: "relationshipMemory", category: "care", memoryId: "school-notice", withinTurns: 2 },
      ] }, resourceDeltas: { energy: -15 }, setFlags: ["needs-support"],
      relationshipMemories: [{ id: "strained-handoff", category: "conflict", text: "The handoff felt rushed." }],
      storyEntries: [{ kind: "planning", text: "Remembering every detail left you tired at the handoff." }],
      immediateFollowUpEventIds: ["support-scene"] });
    const support = eventNodeSchema.parse({ ...makeAutoEvent("support-scene"), kind: "support",
      eligibility: { kind: "flag", flag: "needs-support" }, planningLoadDelta: -2,
      resourceDeltas: { energy: 5 }, clearFlags: ["needs-support"], setFlags: ["accepted-support"],
      relationshipMemories: [{ id: "shared-list", category: "support", text: "Someone took over tracking the list." }] });
    const content = makeContent([work, fatigue, support], [work.id]);
    const waiting = replay(makeState(), content);
    const chosen = transitionGame(waiting.state, content, { type: "CHOOSE", choiceId: "rest" });
    const result = replay(chosen.state, content);
    expect(result.results.slice(0, 2).map((entry) => entry.eventId)).toEqual(["fatigue", "support-scene"]);
    expect(result.state.planningLoad).toBe(2);
    expect(result.state.resources.energy).toBe(50);
    expect(result.state.flags).toEqual(["accepted-support"]);
    expect(result.state.history).toContainEqual(expect.objectContaining({ kind: "support", text: support.text }));
    expect(result.state.relationshipMemories.map((memory) => memory.category)).toEqual(["care", "conflict", "support"]);
    const declined = transitionGame(waiting.state, content, { type: "CHOOSE", choiceId: "continue" });
    expect(replay(declined.state, content).state.completedEventIds).not.toContain("fatigue");
  });

  it("accumulates repeated planning choices as hidden burden and concrete memories", () => {
    const event = eventNodeSchema.parse({ ...makeChoiceEvent("planning"), repeatable: true,
      choices: [{ ...makeChoiceEvent("planning").choices[0], planningLoadDelta: 2,
        tendencyDeltas: { responsibility: 1 },
        relationshipMemories: [{ id: "remembered-pickup", category: "care", text: "You remembered and arranged pickup." }],
        storyEntries: [{ kind: "planning", text: "You checked the notice, coordinated pickup, and followed through." }] },
      makeChoiceEvent("planning").choices[1]] });
    const content = makeContent([event]);
    const initial = makeState();
    const waiting = replay(initial, content);
    expect(waiting.state.planningLoad).toBe(0);
    let state = transitionGame(waiting.state, content, { type: "CHOOSE", choiceId: "rest" }).state;
    state = transitionGame(state, content, { type: "END_TURN" }).state;
    state = transitionGame(state, content, { type: "START_TURN" }).state;
    state = transitionGame(replay(state, content).state, content, { type: "CHOOSE", choiceId: "rest" }).state;
    expect(state.planningLoad).toBe(4);
    expect(state.resources).not.toHaveProperty("planningLoad");
    expect(state.tendencies.responsibility).toBe(2);
    expect(state.relationshipMemories).toEqual([
      expect.objectContaining({ id: "remembered-pickup", createdAtTurn: 1 }),
      expect.objectContaining({ id: "remembered-pickup", createdAtTurn: 2 }),
    ]);
    expect(state.history.filter((entry) => entry.kind === "planning")).toHaveLength(2);
    expect(initial.planningLoad).toBe(0);
    expect(gameStateSchema.parse(state)).toEqual(state);
  });
});

const reactionScenario = (seed = 1) => {
  const event = makeChoiceEvent("care");
  event.actorIds = ["child-1"];
  event.reactionPoolIds = ["responses"];
  const content = makeContent([event]);
  content.actors = [{ id: "child-1", role: "child", displayName: "Child", availability: 1,
    initiative: 0.5, workflowOwnership: 0.5, reliability: 0.5, boundaryRespect: 0.5 }];
  content.reactionPools = [{ id: "responses", entries: [{ id: "thanks", kind: "support",
    text: "The child smiles.", weight: 1, actorRoles: ["child"], followUpEventIds: [] }] }];
  const state = transitionGame(makeState(seed), content, { type: "ADVANCE" }).state;
  return { state, event, content, entry: content.reactionPools[0]!.entries[0]! };
};

describe("Core Event Engine Public Boundary", () => {
  it("resolves reactions on automatic nodes and carries their effects into a later Turn", () => {
    const { state, event, content, entry } = reactionScenario();
    const automatic = makeAutoEvent("notice");
    automatic.actorIds = event.actorIds;
    automatic.reactionPoolIds = event.reactionPoolIds;
    event.reactionPoolIds = [];
    event.choices[0]!.immediateFollowUpEventIds = [automatic.id];
    entry.setFlags = ["supported"];
    entry.relationshipMemories = [{ id: "help", category: "support", text: "Helped today." }];
    entry.scheduledFollowUps = [{ eventId: "later", delayTurns: 1, priority: 0 }];
    const later = makeChoiceEvent("later");
    later.eligibility = { kind: "all", conditions: [{ kind: "flag", flag: "supported" },
      { kind: "relationshipMemory", category: "support", withinTurns: 1 }] };
    content.events.push(automatic, later);
    let next = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" }).state;
    const reaction = transitionGame(next, content, { type: "ADVANCE" }, { maxAutoAdvanceNodes: 1 });
    expect(reaction.results[0]!.reactions?.[0]?.kind).toBe("support");
    expect(reaction.trace.at(-1)?.afterState).toEqual(reaction.state);
    next = transitionGame(reaction.state, content, { type: "END_TURN" }).state;
    next = transitionGame(next, content, { type: "START_TURN" }).state;
    expect(transitionGame(next, content, { type: "ADVANCE" }).pendingEvent?.id).toBe("later");
  });

  it("honors base pool weights and memory-based weight modifiers", () => {
    const count = (weight: number, memory: boolean) => {
      let support = 0;
      for (let seed = 0; seed < 128; seed++) {
        const { state, content, entry } = reactionScenario(seed);
        content.reactionPools[0]!.entries.push({ ...entry, id: "neutral", kind: "neutral" });
        entry.weight = weight;
        entry.weightModifiers = [{ condition: { kind: "relationshipMemory", category: "support", withinTurns: 1 }, multiplier: 20 }];
        if (memory) state.relationshipMemories = [{ id: "help", actorId: "child-1", category: "support",
          text: "Helped", createdAtAgeStageId: "age-stage-1", createdAtTurn: 1 }];
        const result = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" });
        if (result.results[0]!.reactions?.[0]?.kind === "support") support++;
      }
      return support;
    };
    const baseline = count(1, false);
    expect(count(20, false)).toBeGreaterThan(baseline + 30);
    expect(count(1, true)).toBeGreaterThan(baseline + 30);
  });
  it("evaluates reaction actorAvailable conditions against scene availability, including transient actors", () => {
    const { state, event, content, entry } = reactionScenario();
    content.actors[0]!.id = "teacher-1";
    content.actors[0]!.role = "teacher";
    event.actorIds = ["teacher-1"];
    entry.actorRoles = ["teacher"];
    entry.requirements = { kind: "actorAvailable", actorId: "teacher-1" };
    const result = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" });
    expect(result.results[0]!.reactions?.[0]).toMatchObject({ actorId: "teacher-1", kind: "support" });
  });
  it.each(["child", "partner", "grandparent", "teacher", "colleague", "stranger"] as const)(
    "allows %s responses only when the actor is present and belongs to the scene", (role) => {
      const { state, event, content, entry } = reactionScenario();
      const actor = content.actors[0]!;
      actor.role = role;
      entry.actorRoles = [role];
      state.family.persistentActorIds = role === "partner" || role === "grandparent" ? [actor.id] : [];
      const choose = () => transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" }).results[0]!.reactions?.[0];
      expect(choose()).toMatchObject({ kind: "support", actorId: actor.id });
      actor.availability = 0;
      expect(choose()).toMatchObject({ kind: "none", actorId: null, reactionId: null });
      actor.availability = 1;
      event.actorIds = [];
      expect(choose()?.kind).toBe("none");
      event.actorIds = [actor.id];
      if (role === "partner" || role === "grandparent") {
        state.family.persistentActorIds = [];
        expect(choose()?.kind).toBe("none");
      }
    });

  it("replays complete reaction traces from saved PRNG state and permits all six seeded outcomes for the same choice", () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 128; seed++) {
      const { state, content, entry } = reactionScenario(seed);
      content.reactionPools[0]!.entries = ["support", "understanding", "neutral", "criticism", "conflict", "none"]
        .map((kind) => ({ ...entry, id: kind, kind: kind as typeof entry.kind }));
      const before = structuredClone(state);
      const result = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" });
      seen.add(result.results[0]!.reactions![0]!.kind);
      expect(transitionGame(gameStateSchema.parse(JSON.parse(JSON.stringify(state))), content,
        { type: "CHOOSE", choiceId: "rest" })).toEqual(result);
      expect(state).toEqual(before);
      state.seed = 12345;
      // The current generator state, rather than the original seed, controls continuation.
      expect(transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" }).results).toEqual(result.results);
    }
    expect([...seen].sort()).toEqual(["conflict", "criticism", "neutral", "none", "support", "understanding"]);
  });

  it("preserves support at zero resources across all household types, including probabilistic availability", () => {
    for (const householdComposition of ["singleCaregiver", "twoCaregivers", "multigenerational"] as const) {
      const seen = new Set<string>();
      for (let seed = 0; seed < 64; seed++) {
        const { state, content } = reactionScenario(seed);
        state.family.householdComposition = householdComposition;
        state.resources = { finances: 0, energy: 0, support: 0, timeFlexibility: 0, connection: 0 };
        content.actors[0]!.availability = 0.5;
        const result = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" });
        seen.add(result.results[0]!.reactions![0]!.kind);
      }
      expect([...seen].sort()).toEqual(["none", "support"]);
    }
  });

  it("makes authored silence possible even when an actor is available, and supports explicit weight suppression", () => {
    const { state, content, entry } = reactionScenario();
    entry.weightModifiers = [{ condition: { kind: "always" }, multiplier: 0 }];
    content.reactionPools[0]!.entries.push({ ...entry, id: "silence", kind: "none", text: "No one notices.", weightModifiers: [] });
    const result = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" });
    expect(result.results[0]!.reactions?.[0]).toMatchObject({ reactionId: "silence", kind: "none", actorId: null });
  });

  it("does not let anticipated judgment or content ordering change the observed reaction", () => {
    const { state, event, content, entry } = reactionScenario();
    content.actors.push({ ...content.actors[0]!, id: "teacher-1", role: "teacher" });
    event.actorIds.push("teacher-1");
    entry.actorRoles.push("teacher");
    content.reactionPools[0]!.entries.push({ ...entry, id: "neutral", kind: "neutral" });
    content.reactionPools.push({ id: "second", entries: [{ ...entry }] });
    event.reactionPoolIds.push("second");
    const result = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" });
    event.choices[0]!.anticipatedJudgment = "They will praise me.";
    content.actors.reverse();
    event.actorIds.reverse();
    content.reactionPools.forEach((pool) => pool.entries.reverse());
    content.reactionPools.reverse();
    event.reactionPoolIds.reverse();
    const reordered = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" });
    expect(reordered.results).toEqual(result.results);
    expect(reordered.state.rngState).toBe(result.state.rngState);
    expect(reordered.state.reactionHistory).toEqual(result.state.reactionHistory);
  });

  it("weights reactions by actor tendencies and authored contextual modifiers", () => {
    const counts = (helpful: boolean, boost: boolean) => {
      let support = 0;
      for (let seed = 0; seed < 128; seed++) {
        const { state, content, entry } = reactionScenario(seed);
        content.actors[0]!.initiative = helpful ? 1 : 0;
        content.actors[0]!.reliability = helpful ? 1 : 0;
        content.actors[0]!.boundaryRespect = helpful ? 1 : 0;
        content.reactionPools[0]!.entries.push({ ...entry, id: "criticism", kind: "criticism" });
        entry.weightModifiers = [{ condition: { kind: "flag", flag: "asked" }, multiplier: 20 }];
        state.flags = boost ? ["asked"] : [];
        const result = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" });
        if (result.results[0]!.reactions?.[0]?.kind === "support") support++;
      }
      return support;
    };
    expect(counts(true, false)).toBeGreaterThan(counts(false, false) + 30);
    expect(counts(false, true)).toBeGreaterThan(counts(false, false) + 30);
  });
  it("uses location, situation, recent events, and actor-specific relationship memory for eligibility", () => {
    const { state, event, content, entry } = reactionScenario();
    event.locationId = "school";
    event.contextTags = ["handoff"];
    entry.requirements = { kind: "all", conditions: [
      { kind: "location", locationId: "school" }, { kind: "contextTag", tag: "handoff" },
      { kind: "recentEvent", eventId: "earlier", withinTurns: 2 },
      { kind: "relationshipMemory", category: "support", withinTurns: 2 },
    ] };
    content.events.push(makeAutoEvent("earlier"));
    state.turnNumber = 5;
    state.eventLastResolvedTurn = { earlier: 4 };
    state.relationshipMemories = [{ id: "help", actorId: "child-1", category: "support", text: "Helped",
      createdAtAgeStageId: "age-stage-1", createdAtTurn: 4 }];
    const choose = () => transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" }).results[0]!.reactions?.[0];
    expect(choose()?.kind).toBe("support");
    event.locationId = "home";
    expect(choose()?.kind).toBe("none");
    event.locationId = "school";
    event.contextTags = [];
    expect(choose()?.kind).toBe("none");
    event.contextTags = ["handoff"];
    state.eventLastResolvedTurn.earlier = 1;
    expect(choose()?.kind).toBe("none");
    state.eventLastResolvedTurn.earlier = 4;
    state.relationshipMemories[0]!.actorId = "another-child";
    expect(choose()?.kind).toBe("none");
    state.relationshipMemories[0]!.actorId = "child-1";
    state.relationshipMemories[0]!.createdAtTurn = 1;
    expect(choose()?.kind).toBe("none");
  });
  it("records observed reactions separately from anticipated judgment and applies narrative effects", () => {
    const { state, event, content, entry } = reactionScenario();
    event.choices[0]!.anticipatedJudgment = "Someone might disapprove.";
    entry.setFlags = ["supported"];
    entry.relationshipMemories = [{ id: "shared-care", category: "support", text: "We shared this moment." }];
    entry.followUpEventIds = ["repair"];
    entry.scheduledFollowUps = [{ eventId: "later", delayTurns: 1, priority: 3 }];
    const repair = makeChoiceEvent("repair");
    repair.eligibility = { kind: "flag", flag: "supported" };
    content.events.push(repair, makeChoiceEvent("later"));
    const result = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" });
    expect(result.results[0]!.reactions).toEqual([{ poolId: "responses", reactionId: "thanks",
      actorId: "child-1", kind: "support", text: "The child smiles." }]);
    expect(result.state.choiceHistory.at(-1)?.anticipatedJudgment).toBe("Someone might disapprove.");
    expect(result.state.reactionHistory?.[0]).toMatchObject({ eventId: "care", reactionId: "thanks", actorId: "child-1" });
    expect(result.state.relationshipMemories).toEqual([{ id: "shared-care", actorId: "child-1",
      category: "support", text: "We shared this moment.", createdAtAgeStageId: "age-stage-1", createdAtTurn: 1 }]);
    expect(result.state.scheduledFollowUps).toEqual(expect.arrayContaining([
      expect.objectContaining({ eventId: "later", dueAfterTurns: 1, priority: 3 }),
    ]));
    expect(transitionGame(result.state, content, { type: "ADVANCE" }).pendingEvent?.id).toBe("repair");
    expect(gameStateSchema.parse(JSON.parse(JSON.stringify(result.state)))).toEqual(result.state);
  });
  it("resolves an independent reaction after a choice through the engine", () => {
    const { state, content } = reactionScenario();
    expect(state.history).toEqual([]);
    const resolved = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" });
    expect(resolved.state.history.at(-1)).toMatchObject({ kind: "reaction", text: "The child smiles." });
  });
  it("progresses through an empty waiting Turn while enforcing the stage budget", () => {
    const first = makeChoiceEvent("first");
    const future = makeChoiceEvent("future");
    first.choices[0]!.scheduledFollowUps = [{ eventId: future.id, delayTurns: 2, priority: 0 }];
    const content = makeContent([first, future], [first.id]);
    const run = () => {
      let state = transitionGame(makeState(), content, { type: "ADVANCE" }).state;
      state = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" }).state;
      return transitionGame(state, content, { type: "ADVANCE" }).state;
    };
    let state = run();
    expect(state.ageStageProgress?.status).toBe("active");
    state = transitionGame(state, content, { type: "START_TURN" }).state;
    const waiting = transitionGame(state, content, { type: "ADVANCE" });
    expect(waiting.stopReason).toBe("FALLBACK");
    expect(waiting.state.turn?.status).toBe("completed");
    expect(waiting.state.ageStageProgress?.status).toBe("active");
    state = transitionGame(waiting.state, content, { type: "START_TURN" }).state;
    expect(transitionGame(state, content, { type: "ADVANCE" }).pendingEvent?.id).toBe("future");

    first.choices[0]!.scheduledFollowUps[0]!.delayTurns = 100;
    state = run();
    let last: EngineTransition | undefined;
    for (let i = 0; i < 4; i += 1) {
      state = transitionGame(state, content, { type: "START_TURN" }).state;
      last = transitionGame(state, content, { type: "ADVANCE" });
      state = last.state;
    }
    expect(last?.stopReason).toBe("AGE_STAGE_NODE_LIMIT");
    expect(state.ageStageProgress).toMatchObject({ status: "safelyEnded", nodeCount: 6 });
  });

  it("resumes an interrupted immediate chain before higher-priority same-Turn schedules", () => {
    const first = makeAutoEvent("first");
    first.immediateFollowUpEventIds = ["reaction"];
    first.scheduledFollowUps = [{ eventId: "scheduled", delayTurns: 0, priority: 99 }];
    const reaction = makeChoiceEvent("reaction");
    const content = makeContent([first, reaction, makeChoiceEvent("scheduled")], [first.id]);
    const paused = transitionGame(makeState(), content, { type: "ADVANCE" }, { maxAutoAdvanceNodes: 1 });
    const state = gameStateSchema.parse(JSON.parse(JSON.stringify(paused.state)));
    const resumed = transitionGame(state, content, { type: "ADVANCE" });
    expect(resumed.pendingEvent?.id).toBe("reaction");
    const chosen = transitionGame(resumed.state, content, { type: "CHOOSE", choiceId: "rest" });
    const scheduled = transitionGame(chosen.state, content, { type: "ADVANCE" });
    expect(scheduled.pendingEvent?.id).toBe("scheduled");
    expect(scheduled.state.rngState).toBe(paused.state.rngState);
  });

  it("preserves the run-wide Turn clock across an AgeStage boundary", () => {
    const first = makeChoiceEvent("first");
    const later = makeChoiceEvent("later");
    later.ageStageId = "age-stage-2";
    const content = makeContent([first, later]);
    content.ageStages[1]!.entryEventIds = [later.id];
    let state = transitionGame(makeState(), content, { type: "ADVANCE" }).state;
    state = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" }).state;
    state = transitionGame(state, content, { type: "COMPLETE_AGE_STAGE" }).state;
    state = transitionGame(state, content, { type: "NEXT_AGE_STAGE" }).state;
    state = transitionGame(state, content, { type: "ADVANCE" }).state;
    expect(state.turnNumber).toBe(2);
    expect(state.eventLastResolvedTurn?.first).toBe(1);
  });

  it("keeps causal cycles bounded and every trace state contiguous", () => {
    const a = makeAutoEvent("loop-a", { repeatable: true, maxVisits: 1 });
    const b = makeAutoEvent("loop-b", { repeatable: true, maxVisits: 1 });
    a.immediateFollowUpEventIds = [b.id];
    b.immediateFollowUpEventIds = [a.id];
    const content = makeContent([a, b], [a.id]);
    const result = transitionGame(makeState(), content, { type: "ADVANCE" });
    expect(result.stopReason).toBe("CYCLE_PROTECTED");
    expect(result.results.map((entry) => entry.eventId)).toEqual(["loop-a", "loop-b", "loop-a"]);
    for (let i = 1; i < result.trace.length; i += 1) {
      expect(result.trace[i]!.beforeState).toEqual(result.trace[i - 1]!.afterState);
    }
    expect(result.trace.at(-1)?.afterState).toEqual(result.state);
    a.terminationGuard = { kind: "maxVisits", count: 100 };
    b.terminationGuard = { kind: "maxVisits", count: 100 };
    const bounded = transitionGame(makeState(), content, { type: "ADVANCE" });
    expect(bounded.stopReason).toBe("TURN_NODE_LIMIT");
    expect(bounded.state.turn?.nodeCount).toBe(4);
    const ended = transitionGame(bounded.state, content, { type: "START_TURN" });
    expect(transitionGame(ended.state, content, { type: "ADVANCE" }).stopReason).toBe("AGE_STAGE_NODE_LIMIT");
  });

  it("checks future-stage conditions only when due and orders schedules independently of array order", () => {
    const first = makeChoiceEvent("first");
    const future = makeChoiceEvent("future");
    future.ageStageId = "age-stage-2";
    first.choices[0]!.scheduledFollowUps = [
      { eventId: future.id, targetAgeStageId: "age-stage-2", delayTurns: 1, priority: 10,
        condition: { kind: "flag", flag: "ready" } },
      { eventId: "low", delayTurns: 0, priority: 1 },
      { eventId: "high", delayTurns: 0, priority: 5 },
    ];
    const ready = makeChoiceEvent("ready");
    ready.ageStageId = "age-stage-2";
    ready.choices[0]!.setFlags = ["ready"];
    const content = makeContent([first, future, ready, makeChoiceEvent("low"), makeChoiceEvent("high")], [first.id]);
    content.ageStages[1]!.entryEventIds = [ready.id];
    const run = (reverse: boolean) => {
      const transitions: EngineTransition[] = [];
      let state = makeState();
      const act = (input: Parameters<typeof transitionGame>[2]) => {
        const result = transitionGame(state, content, input);
        transitions.push(result);
        state = result.state;
        return result;
      };
      act({ type: "ADVANCE" });
      act({ type: "CHOOSE", choiceId: "rest" });
      if (reverse) state = { ...state, scheduledFollowUps: [...state.scheduledFollowUps].reverse() };
      const high = act({ type: "ADVANCE" });
      expect(high.pendingEvent?.id).toBe("high");
      expect(high.state.rngState).toBe(transitions[0]!.state.rngState);
      act({ type: "CHOOSE", choiceId: "continue" });
      expect(act({ type: "ADVANCE" }).pendingEvent?.id).toBe("low");
      act({ type: "CHOOSE", choiceId: "continue" });
      act({ type: "COMPLETE_AGE_STAGE" });
      act({ type: "NEXT_AGE_STAGE" });
      expect(act({ type: "ADVANCE" }).pendingEvent?.id).toBe("ready");
      act({ type: "CHOOSE", choiceId: "rest" });
      act({ type: "END_TURN" });
      act({ type: "START_TURN" });
      expect(act({ type: "ADVANCE" }).pendingEvent?.id).toBe("future");
      return transitions;
    };
    const normal = run(false);
    expect(run(false)).toEqual(normal);
    expect(run(true).flatMap((entry) => entry.results)).toEqual(normal.flatMap((entry) => entry.results));
  });

  it.each(["cooldownTurns", "guard"])("defers a scheduled repeat during its %s and resumes after the cooldown", (kind) => {
    const repeat = makeChoiceEvent("repeat");
    repeat.repeatable = true;
    if (kind === "guard") repeat.terminationGuard = { kind: "cooldown", turns: 2 };
    else repeat.cooldownTurns = 2;
    repeat.choices[0]!.scheduledFollowUps = [{ eventId: "repeat", delayTurns: 0, priority: 4 }];
    const ordinary = makeChoiceEvent("ordinary");
    ordinary.eligibility = { kind: "eventCompleted", eventId: "repeat" };
    const content = makeContent([repeat, ordinary]);
    let state = transitionGame(makeState(), content, { type: "ADVANCE" }).state;
    state = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" }).state;
    const cooling = transitionGame(state, content, { type: "ADVANCE" });
    expect(cooling.pendingEvent?.id).toBe("ordinary");
    expect(cooling.state.scheduledFollowUps[0]?.status).toBe("pending");
    state = transitionGame(cooling.state, content, { type: "CHOOSE", choiceId: "continue" }).state;
    state = transitionGame(state, content, { type: "END_TURN" }).state;
    state = transitionGame(state, content, { type: "START_TURN" }).state;
    // Turn 2 is still inside the two-Turn interval; use a new ordinary event.
    const next = makeChoiceEvent("next");
    content.events.push(next);
    content.ageStages[0]!.entryEventIds.push(next.id);
    const during = transitionGame(state, content, { type: "ADVANCE" });
    expect(during.pendingEvent?.id).toBe("next");
    state = transitionGame(during.state, content, { type: "CHOOSE", choiceId: "continue" }).state;
    state = transitionGame(state, content, { type: "END_TURN" }).state;
    state = transitionGame(state, content, { type: "START_TURN" }).state;
    const resumed = transitionGame(gameStateSchema.parse(JSON.parse(JSON.stringify(state))), content, { type: "ADVANCE" });
    expect(resumed.pendingEvent?.id).toBe("repeat");
    expect(resumed.state.scheduledFollowUps[0]?.status).toBe("consumed");
  });

  it("invalidates a chain when its continuation guard becomes false", () => {
    const first = makeChoiceEvent("first");
    const guarded = makeChoiceEvent("guarded");
    guarded.terminationGuard = { kind: "condition", condition: { kind: "not", condition: { kind: "flag", flag: "stop" } } };
    first.choices[0]!.setFlags = ["stop"];
    first.choices[0]!.immediateFollowUpEventIds = ["guarded"];
    const content = makeContent([first, guarded], [first.id]);
    let state = transitionGame(makeState(), content, { type: "ADVANCE" }).state;
    state = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" }).state;
    const result = transitionGame(state, content, { type: "ADVANCE" });
    expect(result.stopReason).toBe("FALLBACK");
    expect(result.state.scheduledFollowUps[0]?.status).toBe("expired");
  });

  it("cancels a pending schedule idempotently without advancing input or randomness", () => {
    const choice = makeChoiceEvent("planning");
    choice.choices[0]!.scheduledFollowUps = [{ eventId: "followup", delayTurns: 0, priority: 9 }];
    const content = makeContent([choice, makeChoiceEvent("followup"), makeChoiceEvent("ordinary")],
      [choice.id, "ordinary"]);
    content.events.find((event) => event.id === "ordinary")!.eligibility = { kind: "eventCompleted", eventId: "planning" };
    const pending = transitionGame(makeState(), content, { type: "ADVANCE" });
    const resolved = transitionGame(pending.state, content, { type: "CHOOSE", choiceId: "rest" });
    const id = resolved.state.scheduledFollowUps[0]!.id;
    const cancelled = transitionGame(resolved.state, content, { type: "CANCEL_SCHEDULED_EVENT", scheduledEventId: id });
    expect(cancelled.state.scheduledFollowUps[0]?.status).toBe("cancelled");
    expect(cancelled.state.rngState).toBe(resolved.state.rngState);
    expect(cancelled.state.turn).toEqual(resolved.state.turn);
    expect(transitionGame(cancelled.state, content, { type: "CANCEL_SCHEDULED_EVENT", scheduledEventId: id }).trace).toEqual([]);
    expect(transitionGame(cancelled.state, content, { type: "ADVANCE" }).pendingEvent?.id).toBe("ordinary");
  });

  it.each(["condition", "missing", "past-stage", "old-turn", "completed", "choices"])(
    "expires an invalid %s schedule and still selects an ordinary entry", (reason) => {
      const target = makeChoiceEvent("scheduled-decision");
      if (reason === "choices") target.choices[0]!.requirements = { kind: "flag", flag: "missing" };
      const content = makeContent([target, makeChoiceEvent("ordinary")], ["ordinary"]);
      const state = makeState();
      state.scheduledFollowUps = [{ id: "invalid", eventId: reason === "missing" ? "missing" : target.id,
        targetAgeStageId: "age-stage-1", dueAfterTurns: 0, priority: 10, status: "pending",
        ...(reason === "condition" ? { condition: { kind: "flag" as const, flag: "missing" } } : {}),
        ...(reason === "old-turn" ? { immediateTurnId: "previous-turn" } : {}),
      }];
      if (reason === "completed") state.completedEventIds = [target.id];
      if (reason === "past-stage") {
        state.currentAgeStageId = "age-stage-2";
        content.events.find((event) => event.id === "ordinary")!.ageStageId = "age-stage-2";
        content.ageStages[1]!.entryEventIds = ["ordinary"];
      }
      const result = transitionGame(state, content, { type: "ADVANCE" });
      expect(result.pendingEvent?.id).toBe("ordinary");
      expect(result.state.scheduledFollowUps[0]?.status).toBe("expired");
      expect(state.scheduledFollowUps[0]?.status).toBe("pending");
    },
  );

  it("continues a chosen three-node story through an immediate reaction and a later Turn", () => {
    const choice = makeChoiceEvent("ask-for-help");
    choice.choices[0]!.immediateFollowUpEventIds = ["partner-agrees"];
    const reaction = makeAutoEvent("partner-agrees");
    reaction.kind = "reaction";
    reaction.text = "Your partner agrees to take the next care shift.";
    reaction.scheduledFollowUps = [{ eventId: "care-handoff", delayTurns: 1, priority: 3,
      condition: { kind: "eventCompleted", eventId: "partner-agrees" } }];
    const handoff = makeChoiceEvent("care-handoff");
    const content = makeContent([choice, reaction, handoff], [choice.id]);
    let state = transitionGame(makeState(), content, { type: "ADVANCE" }).state;
    state = transitionGame(state, content, { type: "CHOOSE", choiceId: "rest" }).state;
    const immediate = transitionGame(state, content, { type: "ADVANCE" });
    expect(immediate.results[0]?.eventId).toBe("partner-agrees");
    expect(immediate.state.history.some((entry) => entry.text === reaction.text)).toBe(true);
    expect(immediate.state.ageStageProgress?.status).toBe("active");
    state = transitionGame(immediate.state, content, { type: "START_TURN" }).state;
    const restored = gameStateSchema.parse(JSON.parse(JSON.stringify(state)));
    const later = transitionGame(restored, content, { type: "ADVANCE" });
    expect(later.pendingEvent?.id).toBe("care-handoff");
    expect(later.state.scheduledFollowUps.map((item) => item.status)).toEqual(["consumed", "consumed"]);
    expect(later).toEqual(transitionGame(state, content, { type: "ADVANCE" }));
  });

  it("enters stage-owned events in milestone order even when content arrays are reversed", () => {
    const content = makeContent([]);
    const events = content.ageStages.map((stage) => ({ ...makeChoiceEvent(`decision-${stage.order}`), ageStageId: stage.id }));
    content.events.push(...events);
    for (const stage of content.ageStages) stage.entryEventIds = [events[stage.order]!.id];
    content.ageStages.reverse();
    content.events.reverse();
    let state = makeState();
    for (let order = 0; order < 12; order += 1) {
      const pending = transitionGame(state, content, { type: "ADVANCE" });
      expect(pending.pendingEvent?.id).toBe(`decision-${order}`);
      const resolved = transitionGame(pending.state, content, { type: "CHOOSE", choiceId: "rest" });
      const complete = transitionGame(resolved.state, content, { type: "COMPLETE_AGE_STAGE" });
      state = transitionGame(complete.state, content, { type: "NEXT_AGE_STAGE" }).state;
    }
    expect(state.completedAgeStages).toHaveLength(12);
  });

  it("enforces hard boundaries immediately after player choices", () => {
    const content = makeContent([makeChoiceEvent("decision")]);
    const pending = transitionGame(makeState(), content, { type: "ADVANCE" });
    const fourth = { ...pending.state, turn: { ...pending.state.turn!, nodeCount: 3 } };
    const turnLimit = transitionGame(fourth, content, { type: "CHOOSE", choiceId: "rest" });
    expect(turnLimit.stopReason).toBe("TURN_NODE_LIMIT");
    expect(turnLimit.state.turn?.status).toBe("safelyEnded");
    const sixth = { ...pending.state, ageStageProgress: { ...pending.state.ageStageProgress!, nodeCount: 5 } };
    const stageLimit = transitionGame(sixth, content, { type: "CHOOSE", choiceId: "rest" });
    expect(stageLimit.stopReason).toBe("AGE_STAGE_NODE_LIMIT");
    expect(stageLimit.state.ageStageProgress?.status).toBe("safelyEnded");
    expect(stageLimit.state.choiceHistory).toHaveLength(1);
    expect(transitionGame(stageLimit.state, content, { type: "ADVANCE" }).state).toBe(stageLimit.state);
  });

  it("ends a multi-node Turn explicitly, starts another, and completes the stage without UI rules", () => {
    const content = makeContent([makeAutoEvent("routine", { repeatable: true, maxVisits: 10 })]);
    const first = transitionGame(makeState(), content, { type: "ADVANCE" }, { maxAutoAdvanceNodes: 2 });
    expect(first.state.turn?.nodeCount).toBe(2);
    const ended = transitionGame(first.state, content, { type: "END_TURN" });
    expect(ended.stopReason).toBe("TURN_COMPLETED");
    expect(ended.state.ageStageProgress?.status).toBe("active");
    expect(transitionGame(ended.state, content, { type: "ADVANCE" }).state).toBe(ended.state);
    const next = transitionGame(ended.state, content, { type: "START_TURN" });
    expect(next.state.currentTurnId).not.toBe(first.state.currentTurnId);
    expect(() => transitionGame(next.state, content, { type: "COMPLETE_AGE_STAGE" })).toThrow();
    const resolved = transitionGame(next.state, content, { type: "ADVANCE" }, { maxAutoAdvanceNodes: 1 });
    const complete = transitionGame(resolved.state, content, { type: "COMPLETE_AGE_STAGE" });
    expect(complete.state.completedAgeStages?.[0]).toMatchObject({ nodeCount: 3, turnCount: 2 });
    expect(complete.state.completedAgeStages?.[0]?.storyEntryIds).toHaveLength(3);
    expect(complete.state.turn?.status).toBe("completed");
    expect(() => transitionGame(first.state, content, { type: "NEXT_AGE_STAGE" })).toThrow();
    expect(() => transitionGame(first.state, content, { type: "START_TURN" })).toThrow();
  });

  it("resumes pending input and completed stages identically after JSON serialization", () => {
    const content = makeContent([makeChoiceEvent("decision")]);
    const pending = transitionGame(makeState(), content, { type: "ADVANCE" });
    expect(() => transitionGame(pending.state, content, { type: "END_TURN" })).toThrow();
    expect(() => transitionGame(pending.state, content, { type: "COMPLETE_AGE_STAGE" })).toThrow();
    const restored = gameStateSchema.parse(JSON.parse(JSON.stringify(pending.state)));
    const input = { type: "CHOOSE", choiceId: "rest" } as const;
    const resolved = transitionGame(pending.state, content, input);
    expect(transitionGame(restored, content, input)).toEqual(resolved);
    const complete = transitionGame(resolved.state, content, { type: "COMPLETE_AGE_STAGE" });
    const saved = gameStateSchema.parse(JSON.parse(JSON.stringify(complete.state)));
    expect(transitionGame(saved, content, { type: "NEXT_AGE_STAGE" })).toEqual(
      transitionGame(complete.state, content, { type: "NEXT_AGE_STAGE" }));
    for (const step of [pending, resolved, complete]) {
      expect(step.trace[0]?.beforeState.rngState).toBe(step.trace[0]?.rngStateBefore);
      expect(step.trace.at(-1)?.afterState).toEqual(step.state);
    }
  });

  it("filters executable choices, rejects hidden choices, and falls back if fewer than two remain", () => {
    const event = makeChoiceEvent("care-decision");
    event.choices.push({ ...event.choices[0]!, id: "ask-partner", requirements: { kind: "actorAvailable", actorId: "partner" } });
    const content = makeContent([event]);
    const pending = transitionGame(makeState(), content, { type: "ADVANCE" });
    expect(pending.pendingEvent?.choices.map((choice) => choice.id)).toEqual(["rest", "continue"]);
    expect(() => transitionGame(pending.state, content, { type: "CHOOSE", choiceId: "ask-partner" })).toThrow();
    event.choices[0]!.requirements = { kind: "resourceAtLeast", resource: "energy", value: 60 };
    const fallback = transitionGame(pending.state, content, { type: "ADVANCE" });
    expect(fallback.stopReason).toBe("FALLBACK");
    expect(fallback.pendingEvent).toBeNull();
    expect(fallback.state.choiceHistory).toEqual([]);
    expect(fallback.state.rngState).toBe(pending.state.rngState);
  });

  it("carries the six-node stage budget across multiple four-node Turns", () => {
    const event = makeAutoEvent("routine", { repeatable: true, maxVisits: 20 });
    const content = makeContent([event]);
    let transition = transitionGame(makeState(), content, { type: "ADVANCE" }, { maxAutoAdvanceNodes: 10 });
    expect(transition.stopReason).toBe("TURN_NODE_LIMIT");
    expect(transition.state.turn?.nodeCount).toBe(4);
    expect(transition.state.ageStageProgress?.nodeCount).toBe(4);
    transition = transitionGame(transition.state, content, { type: "START_TURN" });
    expect(transition.state.turn?.nodeCount).toBe(0);
    transition = transitionGame(transition.state, content, { type: "ADVANCE" }, { maxAutoAdvanceNodes: 2 });
    expect(transition.stopReason).toBe("AGE_STAGE_NODE_LIMIT");
    expect(transition.state.turn?.nodeCount).toBe(2);
    expect(transition.state.ageStageProgress).toMatchObject({ nodeCount: 6, turnCount: 2, status: "safelyEnded" });
    const stopped = transitionGame(transition.state, content, { type: "ADVANCE" });
    expect(stopped.state.history).toHaveLength(6);
    expect(gameStateSchema.parse(JSON.parse(JSON.stringify(stopped.state)))).toEqual(stopped.state);
  });

  it("starts from the family opening and completes all twelve stages in milestone order", () => {
    const content = makeContent([]);
    let state = makeState();
    state.turn = null;
    state.currentTurnId = null;
    const months: number[] = [];
    for (let index = 0; index < 12; index += 1) {
      months.push(content.ageStages.find((stage) => stage.id === state.currentAgeStageId)!.childAgeMonths);
      const completed = transitionGame(state, content, { type: "ADVANCE" });
      expect(completed.state.turn?.status).toBe("completed");
      expect(completed.state.ageStageProgress?.status).toBe("completed");
      expect(completed.state.ageStageProgress?.nodeCount).toBe(1);
      state = transitionGame(completed.state, content, { type: "NEXT_AGE_STAGE" }).state;
    }
    expect(months).toEqual([2, 6, 10, 15, 21, 27, 33, 39, 45, 52, 61, 71]);
    expect(state.completedAgeStages).toHaveLength(12);
    expect(state.completedAgeStages?.map((stage) => stage.storyEntryIds.length)).toEqual(Array(12).fill(1));
    expect(transitionGame(state, content, { type: "ADVANCE" }).stopReason).toBe("GAME_COMPLETED");
  });

  it("keeps the PRNG sequence stable and accepts only unsigned 32-bit state", () => {
    const first = nextPrng(initializePrngState(123456789));

    expect(first).toEqual({
      state: 1955022602,
      value: 0.2577907438389957,
    });
    expect(() => initializePrngState(-1)).toThrow(RangeError);
    expect(() => initializePrngState(0x1_0000_0000)).toThrow(RangeError);
    expect(() => nextPrng(1.5)).toThrow(RangeError);
  });

  it("replays weighted event selection and its transition trace from the same state", () => {
    const state = makeState();
    const content = makeContent([
      makeChoiceEvent("morning-routine", 1),
      makeChoiceEvent("preschool-dropoff", 3),
    ]);

    const firstRun = replay(state, content);
    const secondRun = replay(state, content);

    expect(firstRun).toEqual(secondRun);
    expect(firstRun.mode).toBe("PLAYER_INPUT_REQUIRED");
    expect(firstRun.pendingEvent?.id).toBe("preschool-dropoff");
    expect(firstRun.state.rngState).not.toBe(state.rngState);
    expect(firstRun.trace).toHaveLength(1);
    expect(firstRun.trace[0]).toMatchObject({
      input: { type: "ADVANCE" },
      rngStateBefore: state.rngState,
      rngStateAfter: firstRun.state.rngState,
      result: {
        kind: "AWAITING_INPUT",
        eventId: "preschool-dropoff",
      },
    });
    expect(firstRun.trace[0]?.beforeState).toBe(state);
    expect(firstRun.trace[0]?.afterState).toBe(firstRun.state);
  });

  it("resolves player input immutably and clamps visible resources to 0-100", () => {
    const initialState = makeState();
    initialState.resources = {
      finances: 5,
      energy: 95,
      support: 2,
      timeFlexibility: 3,
      connection: 4,
    };
    const choiceEvent = makeChoiceEvent("evening-routine");
    choiceEvent.choices[0]!.resourceDeltas = {
      finances: -10,
      energy: 10,
      support: -50,
      timeFlexibility: -4,
      connection: -5,
    };
    const content = makeContent([choiceEvent]);
    const awaitingInput = transitionGame(initialState, content, { type: "ADVANCE" });

    const resolved = transitionGame(awaitingInput.state, content, {
      type: "CHOOSE",
      choiceId: "rest",
    });

    expect(initialState.resources).toEqual({
      finances: 5,
      energy: 95,
      support: 2,
      timeFlexibility: 3,
      connection: 4,
    });
    expect(awaitingInput.state.resources).toEqual(initialState.resources);
    expect(resolved.mode).toBe("AUTO_ADVANCE");
    expect(resolved.pendingEvent).toBeNull();
    expect(resolved.state.resources).toEqual({
      finances: 0,
      energy: 100,
      support: 0,
      timeFlexibility: 0,
      connection: 0,
    });
    expect(resolved.state.completedEventIds).toEqual(["evening-routine"]);
    expect(resolved.state.choiceHistory).toEqual([
      {
        eventId: "evening-routine",
        choiceId: "rest",
        ageStageId: "age-stage-1",
        turnId: "turn-1",
      },
    ]);
    expect(resolved.state.turn).toMatchObject({
      status: "active",
      nodeCount: 1,
      activeEventId: null,
      processedEventIds: ["evening-routine"],
    });
    expect(resolved.trace).toHaveLength(1);
    expect(resolved.trace[0]).toMatchObject({
      beforeState: awaitingInput.state,
      input: { type: "CHOOSE", choiceId: "rest" },
      rngStateBefore: awaitingInput.state.rngState,
      rngStateAfter: awaitingInput.state.rngState,
      afterState: resolved.state,
      result: {
        kind: "EVENT_RESOLVED",
        eventId: "evening-routine",
        choiceId: "rest",
        resourceDeltas: {
          finances: -10,
          energy: 10,
          support: -50,
          timeFlexibility: -4,
          connection: -5,
        },
      },
    });
  });

  it("resolves AUTO_ADVANCE nodes and stops at the configured automatic node limit", () => {
    const state = makeState();
    const content = makeContent([makeAutoEvent("morning-passes")]);

    const transition = transitionGame(
      state,
      content,
      { type: "ADVANCE" },
      { maxAutoAdvanceNodes: 1 },
    );

    expect(transition.mode).toBe("AUTO_ADVANCE");
    expect(transition.stopReason).toBe("AUTO_ADVANCE_LIMIT");
    expect(transition.pendingEvent).toBeNull();
    expect(transition.results).toEqual([
      expect.objectContaining({
        kind: "EVENT_RESOLVED",
        eventId: "morning-passes",
        choiceId: null,
      }),
    ]);
    expect(transition.state.turn).toMatchObject({
      status: "active",
      nodeCount: 1,
      activeEventId: null,
      processedEventIds: ["morning-passes"],
    });
    expect(transition.state.completedEventIds).toEqual(["morning-passes"]);
    expect(transition.trace).toHaveLength(1);
    expect(transition.trace[0]?.afterState).toBe(transition.state);
  });

  it("continues through automatic nodes and stops at the next player-input boundary", () => {
    const state = makeState();
    const content = makeContent([
      makeAutoEvent("arrival", { weight: 1000 }),
      makeChoiceEvent("dropoff-decision", 1),
    ]);

    const transition = transitionGame(state, content, { type: "ADVANCE" });

    expect(transition.mode).toBe("PLAYER_INPUT_REQUIRED");
    expect(transition.stopReason).toBe("PLAYER_INPUT_REQUIRED");
    expect(transition.pendingEvent?.id).toBe("dropoff-decision");
    expect(transition.results.map((result) => [result.kind, result.eventId])).toEqual([
      ["EVENT_RESOLVED", "arrival"],
      ["AWAITING_INPUT", "dropoff-decision"],
    ]);
    expect(transition.trace).toHaveLength(2);
    expect(transition.trace[1]?.rngStateBefore).toBe(transition.trace[0]?.rngStateAfter);
    expect(transition.state.turn).toMatchObject({
      status: "awaitingInput",
      nodeCount: 1,
      activeEventId: "dropoff-decision",
      processedEventIds: ["arrival"],
    });
  });

  it("uses a safe fallback without consuming randomness when no event is eligible", () => {
    const state = makeState();
    const blockedEvent = makeChoiceEvent("needs-support");
    blockedEvent.eligibility = { kind: "flag", flag: "support-arranged" };
    const content = makeContent([blockedEvent]);

    const transition = transitionGame(state, content, { type: "ADVANCE" });

    expect(transition.mode).toBe("AUTO_ADVANCE");
    expect(transition.stopReason).toBe("FALLBACK");
    expect(transition.pendingEvent).toBeNull();
    expect(transition.state.rngState).toBe(state.rngState);
    expect(transition.state.resources).toEqual(state.resources);
    expect(transition.state.flags).toEqual(state.flags);
    expect(transition.state.turn).toMatchObject({
      status: "completed",
      nodeCount: 1,
      processedEventIds: ["safe-fallback"],
    });
    expect(transition.results).toEqual([
      expect.objectContaining({
        kind: "SAFE_FALLBACK",
        eventId: "safe-fallback",
      }),
    ]);
    expect(transition.trace[0]).toMatchObject({
      rngStateBefore: state.rngState,
      rngStateAfter: state.rngState,
      beforeState: state,
      afterState: transition.state,
    });
  });

  it("stops safely before selecting another event when the Turn node limit is reached", () => {
    const state = makeState();
    state.turn!.nodeCount = 4;
    state.turn!.processedEventIds = ["event-1", "event-2", "event-3", "event-4"];
    const content = makeContent([makeChoiceEvent("one-more-event")]);

    const transition = transitionGame(state, content, { type: "ADVANCE" });

    expect(transition.mode).toBe("AUTO_ADVANCE");
    expect(transition.stopReason).toBe("TURN_NODE_LIMIT");
    expect(transition.pendingEvent).toBeNull();
    expect(transition.state.rngState).toBe(state.rngState);
    expect(transition.state.turn).toMatchObject({
      status: "safelyEnded",
      nodeCount: 4,
      processedEventIds: ["event-1", "event-2", "event-3", "event-4"],
    });
    expect(transition.results).toEqual([
      expect.objectContaining({
        kind: "TURN_NODE_LIMIT",
        eventId: null,
      }),
    ]);
    expect(transition.trace[0]).toMatchObject({
      beforeState: state,
      rngStateBefore: state.rngState,
      rngStateAfter: state.rngState,
      afterState: transition.state,
    });
  });

  it("allows guarded repeat visits and returns a traceable cycle-protection result", () => {
    const state = makeState();
    const content = makeContent([
      makeAutoEvent("repeating-routine", { repeatable: true, maxVisits: 2 }),
    ]);

    const transition = transitionGame(state, content, { type: "ADVANCE" });

    expect(transition.mode).toBe("AUTO_ADVANCE");
    expect(transition.stopReason).toBe("CYCLE_PROTECTED");
    expect(transition.results.map((result) => result.kind)).toEqual([
      "EVENT_RESOLVED",
      "EVENT_RESOLVED",
      "CYCLE_PROTECTED",
    ]);
    expect(transition.results[2]).toMatchObject({
      eventId: "repeating-routine",
    });
    expect(transition.state.turn).toMatchObject({
      status: "cycleProtected",
      nodeCount: 2,
      activeEventId: null,
      processedEventIds: ["repeating-routine", "repeating-routine"],
    });
    expect(transition.trace).toHaveLength(3);
    expect(transition.trace[2]?.rngStateBefore).toBe(transition.trace[1]?.rngStateAfter);
    expect(transition.trace[2]?.rngStateAfter).toBe(transition.state.rngState);
    expect(transition.trace[2]?.afterState).toBe(transition.state);
  });

  it("completes the Turn when an automatic node reaches the Turn limit", () => {
    const state = makeState();
    state.turn!.nodeCount = 3;
    state.turn!.processedEventIds = ["event-1", "event-2", "event-3"];
    const content = makeContent([makeAutoEvent("final-node")]);

    const transition = transitionGame(state, content, { type: "ADVANCE" });

    expect(transition.stopReason).toBe("TURN_NODE_LIMIT");
    expect(transition.results.map((result) => result.kind)).toEqual([
      "EVENT_RESOLVED",
      "TURN_NODE_LIMIT",
    ]);
    expect(transition.state.turn).toMatchObject({
      status: "safelyEnded",
      nodeCount: 4,
      processedEventIds: ["event-1", "event-2", "event-3", "final-node"],
    });
    expect(transition.trace).toHaveLength(2);
  });

  it("keeps the current player-input boundary stable until a choice is submitted", () => {
    const state = makeState();
    const content = makeContent([makeChoiceEvent("waiting-choice")]);
    const awaitingInput = transitionGame(state, content, { type: "ADVANCE" });

    const repeatedAdvance = transitionGame(awaitingInput.state, content, { type: "ADVANCE" });

    expect(repeatedAdvance.mode).toBe("PLAYER_INPUT_REQUIRED");
    expect(repeatedAdvance.stopReason).toBe("PLAYER_INPUT_REQUIRED");
    expect(repeatedAdvance.pendingEvent?.id).toBe("waiting-choice");
    expect(repeatedAdvance.state).toBe(awaitingInput.state);
    expect(repeatedAdvance.state.rngState).toBe(awaitingInput.state.rngState);
    expect(repeatedAdvance.results).toEqual([]);
    expect(repeatedAdvance.trace).toEqual([]);
  });

  it("does not apply player input beyond the Turn node limit", () => {
    const initialState = makeState();
    const content = makeContent([makeChoiceEvent("late-choice")]);
    const awaitingInput = transitionGame(initialState, content, { type: "ADVANCE" });
    const atLimit: GameState = {
      ...awaitingInput.state,
      turn: {
        ...awaitingInput.state.turn!,
        nodeCount: 4,
        processedEventIds: ["event-1", "event-2", "event-3", "event-4"],
      },
    };

    const transition = transitionGame(atLimit, content, {
      type: "CHOOSE",
      choiceId: "rest",
    });

    expect(transition.stopReason).toBe("TURN_NODE_LIMIT");
    expect(transition.state.resources).toEqual(atLimit.resources);
    expect(transition.state.choiceHistory).toEqual([]);
    expect(transition.state.turn).toMatchObject({
      status: "safelyEnded",
      nodeCount: 4,
      activeEventId: null,
    });
  });

  it("replays the complete event and result trace for the same action sequence", () => {
    const content = makeContent([makeChoiceEvent("shared-evening")]);
    const runSequence = () => {
      const initialState = makeState();
      const awaitingInput = transitionGame(initialState, content, { type: "ADVANCE" });
      const resolved = transitionGame(awaitingInput.state, content, {
        type: "CHOOSE",
        choiceId: "continue",
      });
      return { awaitingInput, resolved };
    };

    const firstRun = runSequence();
    const secondRun = runSequence();

    expect(firstRun).toEqual(secondRun);
    expect(firstRun.resolved.results[0]).toMatchObject({
      eventId: "shared-evening",
      choiceId: "continue",
    });
  });

  it("uses seed only for initialization and continues from the PRNG state", () => {
    const content = makeContent([
      makeChoiceEvent("morning-routine", 1),
      makeChoiceEvent("preschool-dropoff", 3),
    ]);
    const firstState = makeState(1);
    firstState.rngState = initializePrngState(123456789);
    const secondState = makeState(0xffffffff);
    secondState.rngState = initializePrngState(123456789);

    const first = transitionGame(firstState, content, { type: "ADVANCE" });
    const second = transitionGame(secondState, content, { type: "ADVANCE" });

    expect(first.pendingEvent?.id).toBe(second.pendingEvent?.id);
    expect(first.state.rngState).toBe(second.state.rngState);
    expect(first.state.seed).toBe(1);
    expect(second.state.seed).toBe(0xffffffff);
  });

  it("does not depend on the incoming event or entry-ID iteration order", () => {
    const morning = makeChoiceEvent("morning-routine", 1);
    const dropoff = makeChoiceEvent("preschool-dropoff", 3);
    const firstContent = makeContent([morning, dropoff], [morning.id, dropoff.id]);
    const reorderedContent = makeContent([dropoff, morning], [dropoff.id, morning.id]);

    const first = transitionGame(makeState(), firstContent, { type: "ADVANCE" });
    const reordered = transitionGame(makeState(), reorderedContent, { type: "ADVANCE" });

    expect(first.pendingEvent?.id).toBe(reordered.pendingEvent?.id);
    expect(first.state.rngState).toBe(reordered.state.rngState);
  });
});
