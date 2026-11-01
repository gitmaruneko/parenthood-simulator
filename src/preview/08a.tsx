// Development-only Vite entry, excluded from the production index.html build.
// A dedicated sessionStorage namespace leaves the player's localStorage story alone.
import { createRoot } from "react-dom/client";
import { App } from "../ui/App.js";
import { createPlayerSession } from "../ui/player-session.js";
import { createLocalSaveStore } from "../persistence/index.js";
import { createFamilyRun, transitionGame } from "../engine/index.js";
import { bindPreviewRun, createRunContent } from "../content/releases.js";
import { TOY_CAR_ROOT } from "../content/toy-car-story.js";
import "../ui/styles.css";

const attempt = new URLSearchParams(location.search).get("attempt") ?? "first";
const namespace = `parenthood-simulator.preview-08a.${attempt}.`;
const store = createLocalSaveStore({
  getItem: key => sessionStorage.getItem(namespace + key),
  setItem: (key, value) => sessionStorage.setItem(namespace + key, value),
});
let setupError: string | null = null;
if (store.load().status === "empty") {
  const run = bindPreviewRun(createFamilyRun({ seed: 9, firstAgeStageId: "age-stage-8" }));
  const content = createRunContent(run.state);
  // Explicit playtest fixture; selection distribution is tested with the full catalogue.
  content.ageStages[7]!.entryEventIds = [TOY_CAR_ROOT];
  const saved = store.save(transitionGame(run.state, content, { type: "ADVANCE" }).state, null);
  if (saved.status === "error") setupError = saved.error.message;
}
const session = createPlayerSession(store);
await session.check();
if (session.getSnapshot().home.kind === "active") await session.resume();
createRoot(document.getElementById("root")!).render(setupError ? <p role="alert">{setupError}</p> : <>
  <aside className="panel" aria-label="故事試玩">
    <p>這是一段直接進入小車故事的獨立試玩。試玩紀錄留在此分頁，原本的家庭存檔不受影響。</p>
    <a href={`preview-08a.html?attempt=${Date.now()}`}>重新體驗這段故事</a>
  </aside>
  <App session={session} />
</>);
