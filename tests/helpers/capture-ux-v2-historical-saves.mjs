// Run explicitly with Node from the repository root. This is a fixture generator,
// never part of normal tests: assertions must not regenerate their own baseline.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(".");
// node_modules is ignored by Vite's watcher. Historical tsconfig/package files
// must not restart a live development server while fixtures are being captured.
const scratch = join(root, "node_modules/.cache/ux-v2-fixtures");
mkdirSync(scratch, { recursive: true });
const temporary = mkdtempSync(join(scratch, "t6-capture-"));
const fixtures = [];
try {
  for (const [version, commit] of [[3, "5680512"], [6, "9b1a3d2"]]) {
    const directory = join(temporary, `v${version}`);
    mkdirSync(directory);
    const archive = join(temporary, `v${version}.tar`);
    execFileSync("git", ["archive", "--format=tar", "--output", archive, commit, "src", "package.json", "tsconfig.json"]);
    execFileSync("tar", ["-xf", archive, "-C", directory]);
    execFileSync(process.execPath, [join(root, "node_modules/typescript/bin/tsc"), "-p", join(directory, "tsconfig.json")]);
    const module = path => import(pathToFileURL(join(directory, "dist/src", path)).href);
    const engine = await module("engine/index.js");
    const { createMvpContent } = await module("content/mvp.js");
    const { serializeGame } = await module("persistence/index.js");
    const run = engine.createFamilyRun({ seed: 42 });
    const content = createMvpContent(run.actors);
    let state = run.state;
    const capture = label => fixtures.push({ label: `v${version}-${label}`, sourceCommit: commit,
      save: JSON.parse(serializeGame(state)) });
    let midCaptured = false;
    for (let step = 0; step < 250; step++) {
      const view = engine.getPlayerView(state, content);
      if (view.completed) {
        const moments = state.history.filter(row => row.resolvedEventId && state.choiceHistory.some(choice =>
          choice.eventId === row.resolvedEventId && choice.turnId === row.turnId));
        state = engine.selectReviewMoments(state, content, moments.slice(-3).reverse().map(row => row.id));
        capture("completed-custom-review"); break;
      }
      if (step === 1) capture("pending");
      const input = view.pendingEvent ? { type: "CHOOSE", choiceId: view.pendingEvent.id.endsWith("-reconnect") ? "pause" : "coordinate" } : view.nextInput;
      state = engine.transitionGame(state, content, input).state;
      if (input.type === "CHOOSE" && !midCaptured) { capture("mid-turn"); midCaptured = true; }
    }
  }
  if (fixtures.length !== 6) throw new Error("Historical stories did not finish");
  writeFileSync(join(root, "tests/helpers/ux-v2-historical-saves.json"), JSON.stringify(fixtures, null, 2) + "\n");
} finally {
  const target = realpathSync(temporary);
  if (!target.startsWith(realpathSync(scratch) + sep)) throw new Error("Unsafe fixture cleanup path");
  rmSync(target, { recursive: true, force: true });
}
