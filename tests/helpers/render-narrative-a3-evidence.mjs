import { readFileSync, writeFileSync } from "node:fs";
const report = JSON.parse(readFileSync("docs/examples/NARRATIVE-A3-RUNS.json", "utf8"));
const lines = ["# Narrative A3：實際 Journal 與條件對照", "",
  "來源：`NQA3_WRITE_EVIDENCE=1 npm test -- tests/narrative-a3.test.ts tests/narrative-a3-distribution.test.ts --maxWorkers=2`。真實 ContentPack 經公開 Engine、Reaction 與 projectJournal 輸出，沒有靜態代寫 Journal。", "",
  "七版本各兩路 × 四基準 seed；完整十二階段、Review 與逐 checkpoint 還原結果見 [原始 JSON](NARRATIVE-A3-RUNS.json)。固定 corpus 六方向另見 [分布](NARRATIVE-A3-DISTRIBUTION.json)。", "",
  "作者總目錄 44 節點：A2 40 − 五組原節點 10 ＋ A3 14。兩個中性版本各多 2 作者節點；每局 N03／N04 各只選一版，不增加 Turn≤4／Stage≤6 預算，不宣稱納入 #42 原 90 配額。", "",
  "## 同 seed、同 rngState 單維正反例", "",
  "只變更 workArrangement 或 support-1 成員資格；沒有換 seed 或用 UI 隱藏。每列 requiredEventIds 見 JSON。", "",
  "| 階段 | seed | rngState | 工作 | support-1 | 實際入口 | 候選 |", "| --- | --- | --- | --- | --- | --- | --- |"];
for (const group of report.rows.filter(row => row.kind === "single-dimension"))
  for (const row of group.rows) lines.push(`| ${group.stage} | 9 | ${row.rngState} | ${row.family.workArrangement} | ${row.family.persistentActorIds.includes("support-1")} | ${row.event} | ${row.entries.join(", ")} |`);
lines.push("", "## 48 配置 × 四角色 mask 的候選與合法選項", "",
  "mask bit 1=長輩、bit 2=伴侶；四個角色集合獨立於家庭三維，availability=0、未知親屬、零資源。每階段皆有一般入口；A3 所有入選版本的兩個行動皆經 Engine 執行並保存還原。完整每階段候選／選項表列於原始 JSON eligibility rows。", "",
  "| 家庭 | 分工 | 工作 | mask | N03 | N04 |", "| --- | --- | --- | --- | --- | --- |"]);
for (const row of report.rows.filter(row => row.kind === "eligibility")) lines.push(`| ${row.family.householdComposition} | ${row.family.careParticipation} | ${row.family.workArrangement} | ${row.mask} | ${row.candidates[2].ids.join(", ")} | ${row.candidates[3].ids.join(", ")} |`);
const names = { work: "N03 工作", bag: "N03 中性：外出袋", message: "N04 作息訊息", shoes: "N04 中性：找鞋", notice: "N09 通知", gathering: "N11 相聚草稿", map: "N12 新教室" };
for (const seed of [9, 1, 11, 2]) {
  lines.push("", `## seed ${seed}：七版本各兩行動的實際 Journal`, "");
  for (const row of report.rows.filter(row => row.kind === "path" && row.seed === seed)) {
    lines.push(`### ${names[row.story]}／${row.choiceId}`, "", `家庭：${row.family.householdComposition}／${row.family.careParticipation}／${row.family.workArrangement}。${row.checkpointCount} checkpoints 全部 Restore；本階段 ${row.progress.nodeCount} 節點（含靜默 fallback）。`, "");
    for (const entry of row.journal) lines.push(`- **${entry.kind}**（source=\`${entry.sourceHistoryId}\`／anchor=\`${entry.eventHistoryId}\`）`, `  ${entry.text.replaceAll("\n", "\n  ")}`);
    lines.push("", `實際 Reaction：\`${JSON.stringify(row.reactions ?? [])}\``, "");
  }
}
lines.push("## 每種限定 Reaction 與 none", "", "只固定公開 checkpoint 的 rngState；沒有改 pool／權重或 mock 抽選器。none 不補台詞或記憶。基準 availability=0 指家庭人物，瞬時同事另有全 actor unavailable 負例。", "");
for (const row of report.rows.filter(row => row.kind === "reaction")) lines.push(`### ${row.choiceId}／${row.reaction.reactionId}`, "", `rngState=${row.forcedRngState}；actor=${row.reaction.actorId ?? "none"}；kind=${row.reaction.kind}。`, "", ...row.journal.map(entry => `- ${entry.text.replaceAll("\n", " / ")}`), "");
writeFileSync("docs/examples/NARRATIVE-A3-PLAYTHROUGH.md", lines.join("\n").trimEnd() + "\n");
