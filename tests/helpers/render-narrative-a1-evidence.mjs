import { readFileSync, writeFileSync } from "node:fs";

const report = JSON.parse(readFileSync("docs/examples/NARRATIVE-A1-RUNS.json", "utf8"));
const lines = [
  "# Narrative A1：實際遊玩紀錄", "",
  "來源：`npm test -- tests/narrative-a1.test.ts` 的公開 Engine／Journal 輸出。",
  "八組完整兩 Turn 路徑使用 seed 9、人物 availability=1；另外列出強制 rngState 的實際 Reaction／none。",
  "固定分支可達性與自然分布分報：[corpus 報告](NARRATIVE-A1-DISTRIBUTION.json)。", "",
  "完整 history、queue、來源與 Review 見 [原始 JSON](NARRATIVE-A1-RUNS.json)。", "",
];
for (const row of report.rows.filter(row => row.progress)) {
  lines.push(`## ${row.root} → ${row.later}`, "",
    `Stage ${row.stage}；${row.progress.turnCount} Turn／${row.progress.nodeCount} 節點；含 fallback，${row.checkpointCount} checkpoints 逐一 Restore。`, "");
  for (const entry of row.journal) lines.push(
    `- **${entry.kind}**（${entry.turnId}／source=\`${entry.sourceHistoryId}\`／anchor=\`${entry.eventHistoryId}\`）`,
    `  ${entry.text.replaceAll("\n", "\n  ")}`);
  lines.push("", `實際 Reaction：\`${JSON.stringify(row.reactions ?? [])}\``, "");
}
lines.push("## Reaction／拒談／none 強制可達性", "",
  "以下只改公開 checkpoint 的 rngState，未 mock 抽選器、改權重或代填回應。none 的 history 保留抽選來源，但沒有可見 Journal 台詞，也不產生記憶。", "");
for (const row of report.rows.filter(row => row.forcedRngState)) {
  const reaction = row.reaction;
  lines.push(`### ${reaction.poolId} / ${reaction.reactionId}`, "",
    `rngState=${row.forcedRngState}；${row.root} → ${row.later}；actor=${reaction.actorId}；kind=${reaction.kind}。`, "",
    reaction.text, "", "該次完整 Journal：", "",
    ...row.journal.map(entry => `- ${entry.text.replaceAll("\n", " / ")}`), "");
}
writeFileSync("docs/examples/NARRATIVE-A1-PLAYTHROUGH.md", lines.join("\n").trimEnd() + "\n");
