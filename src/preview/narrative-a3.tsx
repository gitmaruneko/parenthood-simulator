import { unknownActorProfiles } from "../domain/actor-profiles.js";
// Isolated development preview; production index keeps the existing release.
import { createRoot } from "react-dom/client";
import { App } from "../ui/App.js";
import { createPlayerSession } from "../ui/player-session.js";
import { createLocalSaveStore } from "../persistence/index.js";
import { createFamilyRun, getPlayerView, transitionGame } from "../engine/index.js";
import { bindNarrativeA3Run, createRunContent } from "../content/releases.js";
import { A3_STORIES } from "../content/narrative-a3.js";
import "../ui/styles.css";

const params = new URLSearchParams(location.search);
const selected = A3_STORIES.find(story => story.key === params.get("story"));
const story = selected?.key ?? "full";
const attempt = params.get("attempt") ?? "first";
const namespace = `parenthood-simulator.preview-nqa3.${story}.${attempt}.`;
const store = createLocalSaveStore({ getItem: key => sessionStorage.getItem(namespace + key),
  setItem: (key, value) => sessionStorage.setItem(namespace + key, value) });
let setupError: string | null = null;
if (store.load().status === "empty") {
  const seed = Number(params.get("seed") ?? 9) >>> 0;
  const opening = createFamilyRun({ seed });
  if (selected?.key === "work") opening.state.family.workArrangement = "dualIncome";
  if (selected?.key === "bag") opening.state.family.workArrangement = "singleFullTimeCare";
  if (selected?.key === "message" && !opening.state.family.persistentActorIds.includes("support-1")) {
    const elder = createFamilyRun({ seed: 9 }).actors.find(actor => actor.id === "support-1")!;
    (opening.actors as typeof elder[]).push(structuredClone(elder));
    opening.state.family.persistentActorIds.push("support-1");
  }
  if (selected?.key === "shoes") opening.state.family.persistentActorIds = opening.state.family.persistentActorIds.filter(id => id !== "support-1");
  const actors = opening.actors.filter(actor => selected?.key !== "shoes" || actor.id !== "support-1");
  opening.state.replayOrigin!.actors = structuredClone(actors);
  opening.state.actorProfiles = unknownActorProfiles(opening.state.family);
  opening.state.replayOrigin!.actorProfiles = structuredClone(opening.state.actorProfiles);
  const run = bindNarrativeA3Run({ ...opening, actors });
  const content = createRunContent(run.state);
  let state = run.state;
  for (let step = 0; step < 220 && state.currentAgeStageId !== `age-stage-${selected?.stage ?? 1}`; step++) {
    const view = getPlayerView(state, content);
    state = transitionGame(state, content, view.pendingEvent
      ? { type: "CHOOSE", choiceId: view.pendingEvent.choices[0]!.id } : view.nextInput!).state;
  }
  const saved = store.save(transitionGame(state, content, { type: "ADVANCE" }).state, null);
  if (saved.status === "error") setupError = saved.error.message;
}
const session = createPlayerSession(store);
await session.check();
if (session.getSnapshot().home.kind === "active") await session.resume();
createRoot(document.getElementById("root")!).render(setupError ? <p role="alert">{setupError}</p> : <>
  <aside className="panel" aria-label="故事試玩">
    <p>工作／作息／通知／相聚／新階段 A3 試玩，含外出袋與找鞋兩個生活變體。紀錄留在此分頁，可續玩至家庭回顧。</p>
    <p>故事捷徑的前段以第一個選項試走，可在生活紀錄查看。</p>
    <nav aria-label="試玩故事">
      {A3_STORIES.map(item => <span key={item.key}><a href={`?story=${item.key}`}>{({ work: "工作", bag: "外出袋", message: "作息訊息", shoes: "找鞋", notice: "通知", gathering: "相聚草稿", map: "新教室" })[item.key]}</a>{" · "}</span>)}
      <a href="?story=full">完整家庭生活</a>{" · "}
      <a href={`?story=${story}&seed=${params.get("seed") ?? 9}&attempt=${Date.now()}`}>重新試玩</a>
    </nav>
  </aside>
  <App session={session} />
</>);
