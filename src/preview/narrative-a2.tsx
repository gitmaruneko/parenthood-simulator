// Isolated development preview; production index keeps the existing release.
import { createRoot } from "react-dom/client";
import { App } from "../ui/App.js";
import { createPlayerSession } from "../ui/player-session.js";
import { createLocalSaveStore } from "../persistence/index.js";
import { createFamilyRun, transitionGame } from "../engine/index.js";
import { bindNarrativeA2Run, createRunContent } from "../content/releases.js";
import { A2_STORIES } from "../content/narrative-a2.js";
import "../ui/styles.css";

const params = new URLSearchParams(location.search);
const selected = A2_STORIES.find(story => story.key === params.get("story"));
const story = selected?.key ?? "full";
const attempt = params.get("attempt") ?? "first";
const namespace = `parenthood-simulator.preview-nqa2.${story}.${attempt}.`;
const store = createLocalSaveStore({ getItem: key => sessionStorage.getItem(namespace + key),
  setItem: (key, value) => sessionStorage.setItem(namespace + key, value) });
let setupError: string | null = null;
if (store.load().status === "empty") {
  const seed = Number(params.get("seed") ?? 9) >>> 0;
  const run = bindNarrativeA2Run(createFamilyRun({ seed, firstAgeStageId: `age-stage-${selected?.stage ?? 1}` }));
  const content = createRunContent(run.state);
  const saved = store.save(transitionGame(run.state, content, { type: "ADVANCE" }).state, null);
  if (saved.status === "error") setupError = saved.error.message;
}
const session = createPlayerSession(store);
await session.check();
if (session.getSnapshot().home.kind === "active") await session.resume();
createRoot(document.getElementById("root")!).render(setupError ? <p role="alert">{setupError}</p> : <>
  <aside className="panel" aria-label="故事試玩">
    <p>餐桌／用品／公園／雨天／休息 A2 試玩。紀錄留在此分頁，可續玩至家庭回顧。</p>
    <nav aria-label="試玩故事">
      <a href="?story=meal">餐桌</a>{" · "}<a href="?story=supplies">用品</a>{" · "}
      <a href="?story=park">公園</a>{" · "}<a href="?story=rain">雨天</a>{" · "}<a href="?story=rest">休息</a>{" · "}
      <a href="?story=full">完整家庭生活</a>{" · "}
      <a href={`?story=${story}&seed=${params.get("seed") ?? 9}&attempt=${Date.now()}`}>重新試玩</a>
    </nav>
  </aside>
  <App session={session} />
</>);
