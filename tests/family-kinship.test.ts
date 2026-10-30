import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createFamilyRun } from "../src/engine/index.js";
import { resolveFamilyMembers, resolveEventIdentity } from "../src/engine/actor-profiles.js";
import { createMvpContent } from "../src/content/mvp.js";
import { serializeGame, restoreGame, createLocalSaveStore, LOCAL_SAVE_KEY } from "../src/persistence/index.js";
import { replayFamilyRun } from "../src/engine/index.js";
import { unknownActorProfiles } from "../src/domain/actor-profiles.js";

it("freezes the v2 generated introduction independently of game mechanics", () => {
  const run = createFamilyRun({ seed: 42 });
  expect(resolveFamilyMembers(run.state, run.actors)).toEqual([
    { id: "child-1", displayName: "孩子（小禾）", relationship: "你的孩子", lifeDetail: "常伸手摸摸身邊的小玩具。" },
    { id: "caregiver-2", displayName: "太太", relationship: "太太", lifeDetail: "習慣出門前把鑰匙和購物袋放在門邊。" },
  ]);
});

it("rejects a replay origin that would silently change a saved person's identity", () => {
  const raw = JSON.parse(serializeGame(createFamilyRun({ seed: 4294967295 }).state));
  raw.state.replayOrigin.actorProfiles["support-1"].name = "另一位長輩";
  const bytes = JSON.stringify(raw);
  expect(restoreGame(bytes)).toMatchObject({ status: "error", rawData: bytes });
});

it("generates explicit elder kinship and displays titles instead of stored names across family structures", () => {
  const titles = new Set<string>();
  const structures = new Set<string>();
  for (let seed = 0; seed < 256; seed++) {
    const run = createFamilyRun({ seed });
    structures.add(run.state.family.householdComposition);
    const members = resolveFamilyMembers(run.state, run.actors);
    expect(() => serializeGame(run.state)).not.toThrow();
    for (const actor of run.actors.filter(actor => actor.role !== "child")) {
      const profile = run.state.actorProfiles![actor.id]!;
      const member = members.find(member => member.id === actor.id)!;
      expect(profile.source).toBe("generated-v2");
      expect(member.lifeDetail).toBeTruthy();
      const title = member.displayName.replace("（不同住）", "");
      titles.add(title);
      if (actor.role === "grandparent") {
        expect(["媽媽", "爸爸", "婆婆", "公公", "岳母", "岳父", "伴侶的媽媽", "伴侶的爸爸"]).toContain(title);
        if (profile.source !== "legacy-unknown") {
          expect(profile.name).not.toMatch(/^小/);
          expect(member.displayName).not.toContain(profile.name);
        }
        const event = createMvpContent(run.actors).events.find(event => event.id === "grandparent-boundary-choice")!;
        expect(resolveEventIdentity(event, run.state).text).toContain(title);
      } else expect(["先生", "太太", "伴侶"]).toContain(title);
    }
  }
  expect([...structures].sort()).toEqual(["multigenerational", "singleCaregiver", "twoCaregivers"]);
  expect([...titles].sort()).toEqual(["先生", "太太", "伴侶", "媽媽", "爸爸", "婆婆", "公公", "岳母", "岳父", "伴侶的媽媽", "伴侶的爸爸"].sort());
});

it.each([
  { relation: "mother", partner: "partner", title: "媽媽", linked: false },
  { relation: "father", partner: "partner", title: "爸爸", linked: false },
  { relation: "husbandMother", partner: "husband", title: "婆婆", linked: true },
  { relation: "husbandFather", partner: "husband", title: "公公", linked: true },
  { relation: "wifeMother", partner: "wife", title: "岳母", linked: true },
  { relation: "wifeFather", partner: "wife", title: "岳父", linked: true },
  { relation: "partnerMother", partner: "partner", title: "伴侶的媽媽", linked: true },
  { relation: "partnerFather", partner: "partner", title: "伴侶的爸爸", linked: true },
] as const)("preserves and validates explicit $relation as $title without guessing from names", ({ relation, partner, title, linked }) => {
  const run = createFamilyRun({ seed: 4294967295 });
  const raw = JSON.parse(serializeGame(run.state));
  for (const profiles of [raw.state.actorProfiles, raw.state.replayOrigin.actorProfiles]) {
    profiles["caregiver-2"].relationshipToPlayer = partner;
    profiles["support-1"].relationshipToPlayer = relation;
    // A name is never evidence of gender or kinship.
    profiles["support-1"].name = "小羽";
    delete profiles["support-1"].relatedActorId;
    if (linked) profiles["support-1"].relatedActorId = "caregiver-2";
  }
  const result = restoreGame(JSON.stringify(raw));
  expect(result.status).toBe("restored");
  if (result.status !== "restored") throw new Error("expected explicit kinship");
  const member = resolveFamilyMembers(result.state, run.actors).find(member => member.id === "support-1")!;
  expect(member.displayName).toBe(title);
  expect(replayFamilyRun(result.state).state.actorProfiles).toEqual(result.state.actorProfiles);
  if (linked) {
    raw.state.actorProfiles["caregiver-2"].relationshipToPlayer = partner === "husband" ? "wife" : "husband";
    expect(restoreGame(JSON.stringify(raw)).status).toBe("error");
    raw.state.actorProfiles["caregiver-2"].relationshipToPlayer = partner;
    delete raw.state.actorProfiles["support-1"].relatedActorId;
  } else raw.state.actorProfiles["support-1"].relatedActorId = "caregiver-2";
  const broken = JSON.stringify(raw);
  expect(restoreGame(broken)).toMatchObject({ status: "error", rawData: broken });
});

it("migrates frozen v4 saves without inventing kinship, rewriting history or losing original bytes", () => {
  const fixtures = JSON.parse(readFileSync(new URL("./helpers/v4-family-saves.json", import.meta.url), "utf8"));
  for (const fixture of fixtures) {
    const raw = JSON.stringify(fixture);
    const values = new Map([[LOCAL_SAVE_KEY, raw]]);
    let fail = true;
    const store = createLocalSaveStore({ getItem: key => values.get(key) ?? null, setItem: (key, value) => {
      if (fail && key === LOCAL_SAVE_KEY) throw new DOMException("full", "QuotaExceededError");
      values.set(key, value);
    } });
    const loaded = store.load();
    expect(loaded).toMatchObject({ status: "restored", migratedFrom: 4, state: fixture.state, rawData: raw });
    if (loaded.status !== "restored") throw new Error("expected v4 migration");
    expect(replayFamilyRun(loaded.state).state.actorProfiles).toEqual(fixture.state.actorProfiles);
    expect(store.migrate(raw).status).toBe("error");
    expect(values.get(LOCAL_SAVE_KEY)).toBe(raw);
    expect(values.get(`${LOCAL_SAVE_KEY}.preserved.0`)).toBe(raw);
    fail = false;
    expect(store.migrate(raw).status).toBe("saved");
    const saved = JSON.parse(values.get(LOCAL_SAVE_KEY)!);
    expect(saved).toEqual({ ...fixture, schemaVersion: 5 });
    expect(store.load()).toMatchObject({ status: "restored", migratedFrom: null, state: fixture.state });
    const elder = resolveFamilyMembers(loaded.state, fixture.state.replayOrigin.actors).find(member => member.id === "support-1");
    if (elder) expect(elder.displayName).not.toMatch(/^(媽媽|爸爸|婆婆|公公|岳母|岳父)/);
  }
  const forgedV4 = JSON.parse(serializeGame(createFamilyRun({ seed: 0 }).state));
  forgedV4.schemaVersion = 4;
  const raw = JSON.stringify(forgedV4);
  expect(restoreGame(raw)).toMatchObject({ status: "error", rawData: raw });
});

it.each([true, false])("keeps v4 legacy-unknown relatives neutral with opening snapshot=%s", withOrigin => {
  const fixture = JSON.parse(readFileSync(new URL("./helpers/v4-family-saves.json", import.meta.url), "utf8"))[0];
  const profiles = unknownActorProfiles(fixture.state.family);
  fixture.state.actorProfiles = profiles;
  if (withOrigin) fixture.state.replayOrigin.actorProfiles = profiles;
  else delete fixture.state.replayOrigin;
  const raw = JSON.stringify(fixture);
  const result = restoreGame(raw);
  expect(result).toMatchObject({ status: "restored", migratedFrom: 4, rawData: raw, state: fixture.state });
  if (result.status !== "restored") throw new Error("expected unknown legacy identities");
  const members = resolveFamilyMembers(result.state, createFamilyRun({ seed: 0 }).actors);
  expect(members[1]).toMatchObject({ displayName: "不同住的支持家人", lifeDetail: null });
  expect(replayFamilyRun(result.state).state.actorProfiles).toEqual(profiles);
});
