import { useEffect, useRef, useState } from "react";
import { REVIEW_THEMES } from "../engine/index.js";
import type { GamePresentation } from "./player-session.js";

export function ReviewScreen({ game, blocked, onSelect, onReplay, onNew }: {
  game: GamePresentation; blocked: boolean; onSelect: (ids: string[]) => void;
  onReplay: () => void; onNew: () => void;
}) {
  const review = game.review!;
  const [selection, setSelection] = useState(review.keyMomentIds);
  const [copyStatus, setCopyStatus] = useState("");
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => { title.current?.focus(); }, []);
  useEffect(() => { setSelection(review.keyMomentIds); }, [review.keyMomentIds.join("|")]);
  const moment = (id: string) => {
    const entry = game.history.find((entry) => entry.id === id);
    if (!entry) return null;
    const choice = game.choices.find((choice) => choice.eventId === entry.resolvedEventId && choice.turnId === entry.turnId);
    const reaction = entry.kind === "reaction" ? game.reactions.find((reaction) =>
      reaction.turnId === entry.turnId && reaction.text === entry.text) : null;
    return <article key={id} className="review-moment">
      <small>{game.storyTimeLabels[entry.turnId]}</small>
      {entry.resolvedEventId && <h3>{game.eventTitles[entry.resolvedEventId]}</h3>}
      {reaction && <p>人物反應 · {game.members.find((member) => member.id === reaction.actorId)?.displayName ?? "身邊的人"}</p>}
      <p>{entry.text}</p>
      {choice && <p>你曾選擇：{game.choiceTexts[`${choice.eventId}/${choice.choiceId}`]}</p>}
    </article>;
  };
  const choices = game.history.filter((entry) => entry.kind === "event" && game.choices.some(
    (choice) => choice.eventId === entry.resolvedEventId && choice.turnId === entry.turnId));
  return <main className="review-shell">
    <section className="panel">
      <h1 ref={title} tabIndex={-1}>我們的家庭生活回顧</h1>
      <p>這是一段生活的紀錄，沒有總分，也沒有唯一的育兒答案。</p>
      <h2>這個家庭走過的日常</h2>
      <p className="preserve-lines">{review.familySummary}</p>
      <p>{review.narrativeOverview}</p>
      <p>故事中的柔性主題：{review.themes.map((theme) => REVIEW_THEMES[theme]).join("、")}</p>
      <p className="muted">主題可以交疊，只描述這次經歷，並非固定路線或對照顧者的評語。</p>
    </section>
    <section className="panel">
      <h2>三個關鍵時刻</h2>
      {review.keyMomentIds.map(moment)}
      <details><summary>調整三個關鍵時刻</summary>
        <fieldset disabled={blocked}>
          <legend>選擇三段你想留下的經歷（已選 {selection.length} / 3）</legend>
          {choices.map((entry) => <label className="review-choice" key={entry.id}>
            <input type="checkbox" checked={selection.includes(entry.id)}
              disabled={!selection.includes(entry.id) && selection.length >= 3}
              onChange={(event) => setSelection(event.target.checked ? [...selection, entry.id] : selection.filter((id) => id !== entry.id))} />
            {game.storyTimeLabels[entry.turnId]} · {game.eventTitles[entry.resolvedEventId!]}
          </label>)}
          <button disabled={selection.length !== 3} onClick={() => onSelect(selection)}>儲存關鍵時刻</button>
        </fieldset>
      </details>
    </section>
    <section className="panel">
      <h2>十二個成長階段</h2>
      <ol className="review-timeline">{review.timeline.map((stage) => <li key={stage.ageStageId}>
        <h3>{stage.title}</h3>
        <details><summary>閱讀這個階段的生活（{stage.storyEntryIds.length} 段）</summary>
          {stage.storyEntryIds.length ? stage.storyEntryIds.map(moment) : <p>這個階段沒有留下故事片段。</p>}
        </details>
      </li>)}</ol>
    </section>
    <section className="panel">
      <h2>支持與重新靠近</h2>
      <h3>支持的片刻</h3>{review.supportMomentIds.length ? review.supportMomentIds.map(moment) : <p>這次沒有記錄到支持片段。</p>}
      <h3>修復的片刻</h3>{review.repairMomentIds.length ? review.repairMomentIds.map(moment) : <p>有些事仍留待以後再談。</p>}
      <h2>記掛、安排與資源脈絡</h2>
      <p>最後仍承接的安排負擔：{game.planningLoad}。這是當時的負荷，不是家庭分數。</p>
      {game.history.filter((entry) => entry.kind === "planning").map((entry) => moment(entry.id))}
      <dl>{Object.entries({ finances: "經濟餘裕", energy: "照顧能量", support: "可用支持", timeFlexibility: "時間彈性", connection: "彼此連結" }).map(([key, label]) => {
        const resource = key as keyof typeof game.resources;
        return <div key={key}><dt>{label}</dt><dd>{game.openingResources ? `開場 ${game.openingResources[resource]} → ` : ""}故事末段 {game.resources[resource]}</dd></div>;
      })}</dl>
      <p>資源會限制當下能做的選擇；它們不能判定誰是好父母。</p>
    </section>
    <section className="panel">
      <h2>留下一段故事</h2>
      <label htmlFor="safe-share">分享文字預覽（不含姓名、健康、種子或資源數值）</label>
      <textarea id="safe-share" readOnly value={review.safeShareText} rows={7} />
      <button onClick={async () => {
        try { await navigator.clipboard.writeText(review.safeShareText); setCopyStatus("已複製分享文字"); }
        catch { setCopyStatus("無法自動複製，請選取上方文字自行複製。"); }
      }}>複製分享文字</button>
      <p role="status">{copyStatus}</p>
      <div className="opening-actions">
        <button disabled={blocked} onClick={onReplay}>相同種子，再走一次</button>
        <button disabled={blocked} onClick={onNew}>認識新的家庭</button>
      </div>
      <p>開始前會確認替換紀錄。相同種子保留開場處境，新的選擇仍可能改變故事。</p>
    </section>
  </main>;
}
