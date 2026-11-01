// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ReviewScreen } from "../src/ui/ReviewScreen.js";
import { createPlayerSession } from "../src/ui/player-session.js";
import { createLocalSaveStore, LOCAL_SAVE_KEY } from "../src/persistence/index.js";

afterEach(cleanup);
it.each([true, false])("describes same-seed replay honestly when replayOrigin exists=%s", async hasOrigin => {
  const fixtures = JSON.parse(readFileSync("tests/helpers/ux-v2-historical-saves.json", "utf8"));
  const save = fixtures.find((row: any) => row.label === "v6-completed-custom-review").save;
  if (!hasOrigin) delete save.state.replayOrigin;
  const raw = JSON.stringify(save);
  const values = new Map([[LOCAL_SAVE_KEY, raw]]);
  const session = createPlayerSession(createLocalSaveStore({ getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); } }));
  await session.check(); await session.migrate();
  render(<ReviewScreen game={session.getSnapshot().game!} blocked={false}
    onSelect={vi.fn()} onReplay={vi.fn()} onNew={vi.fn()} />);
  const button = screen.getByRole("button", { name: "相同種子，再走一次" });
  const description = document.getElementById(button.getAttribute("aria-describedby") ?? "");
  expect(description).not.toBeNull();
  if (hasOrigin) {
    expect(description!.textContent).toContain("相同種子保留開場處境");
    expect(description!.textContent).not.toContain("缺少開場快照");
  } else {
    expect(description!.textContent).toContain("缺少開場快照");
    expect(description!.textContent).toContain("預設開場");
    expect(description!.textContent).toContain("無法還原原本的測驗答案與人物細節");
    expect(description!.textContent).not.toContain("保留開場處境");
  }
});
