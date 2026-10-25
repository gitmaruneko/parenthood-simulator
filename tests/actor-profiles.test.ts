import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { createFamilyRun, getAssessmentQuestions, getPlayerView, replayFamilyRun, transitionGame } from "../src/engine/index.js";
import { resolveEventIdentity, resolveFamilyMembers } from "../src/engine/actor-profiles.js";
import { createLocalSaveStore, LOCAL_SAVE_KEY, restoreGame, serializeGame } from "../src/persistence/index.js";
import { unknownActorProfiles } from "../src/domain/actor-profiles.js";
import { createMvpContent } from "../src/content/mvp.js";
import { validateContentPack } from "../src/domain/content-validation.js";
import type { GameState } from "../src/domain/schemas.js";

it("freezes v1 identity catalogue order and covers neutral partners and both parent relationship branches", () => {
  expect(resolveFamilyMembers(createFamilyRun({ seed: 42 }).state, createFamilyRun({ seed: 42 }).actors)).toEqual([
    { id: "child-1", displayName: "小樹", relationship: "你的孩子", lifeDetail: "常被鮮明的顏色吸引。" },
    { id: "caregiver-2", displayName: "小悠", relationship: "妻子", lifeDetail: "喜歡在空檔泡一杯茶。" },
  ]);
  const relationships = new Set<string>();
  const adultDetails = new Map<string, Set<string>>();
  for (let seed = 0; seed < 128; seed++) {
    const run = createFamilyRun({ seed });
    expect(() => serializeGame(run.state)).not.toThrow();
    for (const [id, profile] of Object.entries(run.state.actorProfiles!)) {
      relationships.add(profile.relationshipToPlayer);
      if (profile.source === "generated-v1" && id !== "child-1") {
        const role = run.actors.find(actor => actor.id === id)!.role;
        const seen = adultDetails.get(role) ?? new Set();
        seen.add(profile.lifeDetail.templateId); adultDetails.set(role, seen);
      }
    }
  }
  expect([...relationships].sort()).toEqual(["child", "husband", "partner", "partnerParent", "playerParent", "wife"]);
  for (const role of ["partner", "grandparent"]) expect([...adultDetails.get(role)!].sort()).toEqual(["check-in", "notes", "tea"]);
});

it("preserves the pre-T2 seeded mechanics while generating stable opening identities", () => {
  const golden = JSON.parse(readFileSync(new URL("./helpers/opening-mechanics-golden.json", import.meta.url), "utf8"));
  for (const expected of golden) {
    const run = createFamilyRun({ seed: expected.seed });
    const { family, resources, rngState } = run.state;
    expect({ seed: run.state.seed, family, resources, rngState, actors: run.actors }).toEqual(expected);
    const members = resolveFamilyMembers(run.state, run.actors);
    expect(members.map(member => member.id)).toEqual([family.childId, ...family.persistentActorIds]);
    expect(members.every(member => member.displayName !== "孩子" && member.lifeDetail)).toBe(true);
    const answers = getAssessmentQuestions().map(question => question.choices[0]!.id);
    expect(createFamilyRun({ seed: expected.seed, answers }).state.actorProfiles).toEqual(run.state.actorProfiles);
    expect(replayFamilyRun(run.state).state.actorProfiles).toEqual(run.state.actorProfiles);
    expect(restoreGame(serializeGame(run.state))).toMatchObject({ status: "restored", state: run.state });
  }
});

it("migrates v1/v2/v3 identities as unknown and keeps original bytes and historical strings", () => {
  const run = createFamilyRun({ seed: 42 });
  const state = structuredClone(run.state);
  delete state.actorProfiles;
  delete state.replayOrigin!.actorProfiles;
  state.history.push({ id: "old-text", ageStageId: "age-stage-1", turnId: "old-turn", kind: "event", text: "孩子與共同照顧者的往事。" });
  for (const version of [1, 2, 3]) {
    const raw = JSON.stringify(version === 1 ? state : { schemaVersion: version, state });
    const result = restoreGame(raw);
    expect(result).toMatchObject({ status: "restored", migratedFrom: version, rawData: raw });
    if (result.status !== "restored") throw new Error("migration failed");
    const members = resolveFamilyMembers(result.state, run.actors);
    expect(members.every(member => member.lifeDetail === null)).toBe(true);
    expect(members[0]!.displayName).toBe("孩子");
    expect(result.state.history).toEqual(state.history);
    expect(replayFamilyRun(result.state).state.actorProfiles).toEqual(result.state.actorProfiles);
  }
});

it("rejects invalid profile references, relationship chains and unsupported versions", () => {
  const run = createFamilyRun({ seed: 42 });
  for (const change of [
    (raw: any) => { raw.state.actorProfiles.ghost = raw.state.actorProfiles["child-1"]; },
    (raw: any) => { Object.assign(raw.state.actorProfiles["child-1"], { relationshipToPlayer: "partnerParent", relatedActorId: "missing" }); },
    (raw: any) => { raw.state.actorProfiles["child-1"].profileVersion = 99; },
    (raw: any) => { delete raw.state.actorProfiles; },
    (raw: any) => { delete raw.state.replayOrigin.actorProfiles; },
    (raw: any) => { raw.state.replayOrigin.actors[0].id = "missing"; },
    (raw: any) => { raw.state.actorProfiles["child-1"].lifeDetail.templateId = "tea"; },
    (raw: any) => { raw.state.actorProfiles["child-1"].unexpected = true; },
  ]) {
    const raw = JSON.parse(serializeGame(run.state));
    change(raw);
    expect(restoreGame(JSON.stringify(raw)).status).toBe("error");
  }
});

it.each([1, 2, 3])("preserves v%s bytes and stops when migration cannot write, then safely retries", version => {
  const state = structuredClone(createFamilyRun({ seed: 42 }).state);
  delete state.actorProfiles; delete state.replayOrigin!.actorProfiles;
  const raw = JSON.stringify(version === 1 ? state : { schemaVersion: version, state });
  const values = new Map([[LOCAL_SAVE_KEY, raw]]);
  let fail = true;
  const store = createLocalSaveStore({ getItem: key => values.get(key) ?? null, setItem: (key, value) => {
    if (fail && key === LOCAL_SAVE_KEY) throw new DOMException("full", "QuotaExceededError");
    values.set(key, value);
  } });
  expect(store.migrate(raw).status).toBe("error");
  expect(values.get(LOCAL_SAVE_KEY)).toBe(raw);
  expect(values.get(`${LOCAL_SAVE_KEY}.preserved.0`)).toBe(raw);
  fail = false;
  expect(store.migrate(raw).status).toBe("saved");
  expect(store.load()).toMatchObject({ status: "restored", migratedFrom: null,
    state: { rngState: state.rngState, actorProfiles: unknownActorProfiles(state.family) } });
});

it("binds authored text to existing actors and leaves neutral fallback for absent identities", () => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  const event = content.events[0]!;
  expect(resolveEventIdentity(event, run.state).text).toContain("小樹");
  const absent = { ...event, actorText: { actorId: "support-1", prefix: "與", suffix: "同行" } };
  expect(resolveEventIdentity(absent, run.state).text).toBe(event.text);
  content.events[0] = { ...event, actorText: { actorId: "ghost", prefix: "", suffix: "" } };
  expect(validateContentPack(content).success).toBe(false);
});

it("keeps event order, reactions, effects and RNG identical with identities across a whole game", () => {
  const run = createFamilyRun({ seed: 42 });
  const content = createMvpContent(run.actors);
  let named = run.state;
  let neutral: GameState = { ...run.state, actorProfiles: unknownActorProfiles(run.state.family) };
  for (let step = 0; step < 250; step++) {
    const view = getPlayerView(named, content);
    if (view.completed) return;
    const input = view.pendingEvent ? { type: "CHOOSE" as const, choiceId: view.pendingEvent.choices[0]!.id } : view.nextInput!;
    named = transitionGame(named, content, input).state;
    neutral = transitionGame(neutral, content, input).state;
    for (const field of ["rngState", "resources", "planningLoad", "completedEventIds", "reactionHistory", "choiceHistory", "scheduledFollowUps"] as const)
      expect(named[field]).toEqual(neutral[field]);
  }
  throw new Error("story did not complete");
});
