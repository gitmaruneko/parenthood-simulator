import { useEffect, useRef } from "react";
import type { DecisionPresentation } from "./player-session.js";
import { JournalText } from "./JournalText.js";

export function DecisionDialog({ decision, busy, error, hasUnsavedChanges, canRetry,
  onChoose, onRetry, onReload }: {
  decision: DecisionPresentation; busy: boolean; error: string | null;
  hasUnsavedChanges: boolean; canRetry: boolean;
  onChoose: (choiceId: string, occurrenceKey: string) => void;
  onRetry: (occurrenceKey: string) => void;
  onReload: (occurrenceKey: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const result = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    title.current?.focus();
    return () => { element.close(); document.body.style.overflow = overflow; };
  }, [decision.key]);
  useEffect(() => {
    if (decision.status === "unsaved") result.current?.focus();
  }, [decision.status]);
  const accepted = decision.status === "unsaved";
  return <dialog ref={dialog} className="decision-dialog" aria-modal="true"
    aria-labelledby="decision-title" aria-describedby="decision-description decision-help"
    aria-busy={busy} onCancel={event => event.preventDefault()}
    onKeyDown={event => {
      if (event.key === "Escape") { event.preventDefault(); return; }
      if (event.key !== "Tab") return;
      const controls = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
      const first = controls[0]; const last = controls.at(-1);
      if (!first || !last) { event.preventDefault(); title.current?.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === title.current)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }}>
    <p className="eyebrow">生活裡的重大抉擇</p>
    <h2 id="decision-title" ref={title} tabIndex={-1}>{decision.event.title}</h2>
    <p id="decision-description">{decision.event.text}</p>
    <p id="decision-help">{accepted ? "請完成保存或閱讀下方恢復說明。" : "選擇後才能繼續。"}</p>
    <p role="status" aria-live="polite" aria-atomic="true" ref={result} tabIndex={-1}>
      {busy ? (accepted ? "正在重試儲存，請稍候。" : "正在處理並儲存，請稍候。")
        : accepted ? "選擇已保留於本次開啟的故事，尚未保存。"
        : hasUnsavedChanges ? "這段事件進度尚未儲存。" : "請選擇眼前的做法。"}
    </p>
    {error && <p role="alert">{error}</p>}
    {accepted && <section aria-label="本次已確認的紀錄">
      {decision.records.map(record => <JournalText key={record.id} entry={record} />)}
    </section>}
    {!accepted && !hasUnsavedChanges && <div className="decisions">
      {decision.event.choices.map(choice => <button key={choice.id}
        disabled={busy || decision.status !== "ready"}
        onClick={() => onChoose(choice.id, decision.key)}>
        {choice.text}
        {choice.anticipatedJudgment && <span className="choice-hint">心裡預期：{choice.anticipatedJudgment}</span>}
      </button>)}
    </div>}
    {hasUnsavedChanges && <>
      <p>尚未保存的結果只留在本次開啟的頁面。關閉或重新整理可能失去這次結果；重新讀取會採裝置最後成功保存的版本。</p>
      <div className="dialog-actions">
        {canRetry && <button className="primary" disabled={busy} onClick={() => onRetry(decision.key)}>重試儲存</button>}
        <button disabled={busy} onClick={() => onReload(decision.key)}>返回首頁並重新讀取</button>
      </div>
    </>}
  </dialog>;
}
