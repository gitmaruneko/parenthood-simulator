// Development-only isolated playtest; not an entry of the production build.
import { createRoot } from "react-dom/client";
import { App } from "../ui/App.js";
import { createPlayerSession } from "../ui/player-session.js";
import { createLocalSaveStore } from "../persistence/index.js";
import { createFamilyRun } from "../engine/index.js";
import { bindPreviewRun } from "../content/releases.js";
import "../ui/styles.css";

const attempt = new URLSearchParams(location.search).get("attempt") ?? "first";
const namespace = `parenthood-simulator.preview-auto.${attempt}.`;
const store = createLocalSaveStore({
  getItem: key => sessionStorage.getItem(namespace + key),
  setItem: (key, value) => sessionStorage.setItem(namespace + key, value),
});
let setupError: string | null = null;
if (store.load().status === "empty") {
  const saved = store.save(bindPreviewRun(createFamilyRun({ seed: 9 })).state, null);
  if (saved.status === "error") setupError = saved.error.message;
}
const session = createPlayerSession(store);
await session.check();
if (!setupError) {
  await session.resume();
  if (session.getSnapshot().page === "reveal") await session.startFamily();
}
createRoot(document.getElementById("root")!).render(setupError ? <p role="alert">{setupError}</p> : <>
  <aside className="panel" aria-label="自動敘事獨立試玩">
    <p>自動生活敘事 Preview：本次家庭只保存在這個分頁的獨立空間，原本的家庭存檔不受影響。沿用你的暫停偏好。</p>
    <a href={`preview-automatic-story.html?attempt=${Date.now()}`}>重新體驗這個家庭</a>
  </aside>
  <App session={session} />
</>);
