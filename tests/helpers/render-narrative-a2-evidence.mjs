import { readFileSync, writeFileSync } from "node:fs";

const report = JSON.parse(readFileSync("docs/examples/NARRATIVE-A2-RUNS.json", "utf8"));
const lines = [
  "# Narrative A2：實際 Journal", "",
  "來源：`NQA2_WRITE_EVIDENCE=1 npm test -- tests/narrative-a2.test.ts`，真實 ContentPack 經公開 Engine 與 projectJournal 輸出。",
  "五題兩行動 × 四基準家庭 seed 9／1／11／2，逐 checkpoint Save／Restore；未抽到的反應不補寫。",
  "這些是各題實跑，完整 12 階段／Review 另列於 [原始 JSON](NARRATIVE-A2-RUNS.json)；[分布](NARRATIVE-A2-DISTRIBUTION.json) 另報。", "",
];
const storyNames = { meal: "餐桌", park: "公園", supplies: "用品", rain: "雨天", rest: "休息" };
const paths = report.rows.filter(row => row.kind === "path");
for (const group of [
  { title: "五題雙分支（seed 9）", rows: paths.filter(row => row.seed === 9) },
  { title: "其餘三基準家庭完整 Journal", rows: paths.filter(row => row.seed !== 9) },
]) {
  lines.push(`## ${group.title}`, "");
  for (const row of group.rows) {
    lines.push(`### ${storyNames[row.story]} / ${row.choiceId} / seed ${row.seed}`, "",
      `家庭：${row.family.householdComposition}／${row.family.careParticipation}／${row.family.workArrangement}。`, "",
      `${row.progress.turnCount} Turn／${row.progress.nodeCount} 節點（含靜默 fallback）；${row.checkpointCount} checkpoints 全部 Restore。`, "");
    for (const entry of row.journal) lines.push(`- **${entry.kind}**（source=\`${entry.sourceHistoryId}\`／anchor=\`${entry.eventHistoryId}\`）`,
      `  ${entry.text.replaceAll("\n", "\n  ")}`);
    lines.push("", `實際 Reaction：\`${JSON.stringify(row.reactions ?? [])}\``, "");
  }
}
lines.push("## 每種限定 Reaction 與 none", "",
  "以下僅固定公開 checkpoint 的 rngState，沒有改 pool／權重或 mock 抽選器。none 沒有可見台詞與記憶；每筆列出完整本題 Journal。", "");
for (const row of report.rows.filter(row => row.kind === "reaction")) {
  lines.push(`### ${row.choiceId} / ${row.reaction.reactionId}`, "", `rngState=${row.forcedRngState}；kind=${row.reaction.kind}。`, "",
    ...row.journal.map(entry => `- ${entry.text.replaceAll("\n", " / ")}`), "");
}
writeFileSync("docs/examples/NARRATIVE-A2-PLAYTHROUGH.md", lines.join("\n").trimEnd() + "\n");
