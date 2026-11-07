// Isolated development preview; production index keeps the existing release.
import { createRoot } from "react-dom/client";
import { App } from "../ui/App.js";
import { createPlayerSession } from "../ui/player-session.js";
import { createLocalSaveStore } from "../persistence/index.js";
import { createFamilyRun, transitionGame } from "../engine/index.js";
import { bindNarrativeRun, createRunContent } from "../content/releases.js";
import { DOOR } from "../content/narrative-a1.js";
import "../ui/styles.css";

const params = new URLSearchParams(location.search);
const story = params.get("story") === "door" ? "door" : params.get("story") === "full" ? "full" : "night";
const attempt = params.get("attempt") ?? "first";
const namespace = `parenthood-simulator.preview-nqa1.${story}.${attempt}.`;
const store = createLocalSaveStore({ getItem: key => sessionStorage.getItem(namespace + key),
  setItem: (key, value) => sessionStorage.setItem(namespace + key, value) });
let setupError: string | null = null;
if (store.load().status === "empty") {
  const seed = Number(params.get("seed") ?? 9) >>> 0;
  const run = bindNarrativeRun(createFamilyRun({ seed, firstAgeStageId: story === "door" ? "age-stage-8" : "age-stage-1" }));
  const content = createRunContent(run.state);
  // Path-only shortcut. Full play and distribution tests use the unfiltered catalogue.
  if (story === "door") content.ageStages[7]!.entryEventIds = [DOOR.root];
  const saved = store.save(transitionGame(run.state, content, { type: "ADVANCE" }).state, null);
  if (saved.status === "error") setupError = saved.error.message;
}
const session = createPlayerSession(store);
await session.check();
if (session.getSnapshot().home.kind === "active") await session.resume();
createRoot(document.getElementById("root")!).render(setupError ? <p role="alert">{setupError}</p> : <>
  <aside className="panel" aria-label="故事試玩">
    <p>凌晨用品／教室門口新版試玩。紀錄留在此分頁，可續玩至家庭回顧。</p>
    <nav aria-label="試玩故事">
      <a href="?story=night">凌晨用品</a>{" · "}<a href="?story=door">教室門口</a>{" · "}<a href="?story=full">完整家庭生活</a>{" · "}
      <a href={`?story=${story}&seed=${params.get("seed") ?? 9}&attempt=${Date.now()}`}>重新試玩</a>
    </nav>
  </aside>
  <App session={session} />
</>);
