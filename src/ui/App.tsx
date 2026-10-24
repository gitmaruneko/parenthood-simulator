import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getAssessmentQuestions } from "../engine/index.js";
import { createPlayerSession, type PlayerSession } from "./player-session.js";
import { HomePage } from "./HomePage.js";
import { FamilyDetails, GameScreen } from "./GameScreen.js";
import { Illustration } from "./Illustration.js";
import { SaveNotice } from "./SaveNotice.js";
import { ReviewScreen } from "./ReviewScreen.js";

const questions = getAssessmentQuestions();
export function Assessment({ session }: { session: PlayerSession }) {
  const [answers, setAnswers] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const question = questions[answers.length]!;
  return (
    <section className="opening panel" aria-labelledby="assessment-title">
      <p className="eyebrow">開場情境 {answers.length + 1} / 5 · 可隨時跳過</p>
      <h1 id="assessment-title" tabIndex={-1}>
        {question.text}
      </h1>
      <p>沒有標準答案。這是眼前的傾向，也可以隨日常改變。</p>
      <p className="muted">先想像這個情境；如果選項提到家人或物品，可以假設當時有這些條件。這不代表接下來會生成的家庭。</p>
      <div className="decisions" id="assessment-choices">
        {question.choices.slice(0, expanded ? undefined : 4).map((choice) => (
          <button
            key={choice.id}
            onClick={() => {
              const next = [...answers, choice.id];
              if (next.length === questions.length) session.reveal(next);
              else {
                setAnswers(next);
                setExpanded(false);
                requestAnimationFrame(() =>
                  document.getElementById("assessment-title")?.focus(),
                );
              }
            }}
          >
            {choice.text}
          </button>
        ))}
      </div>
      {question.choices.length > 4 && (
        <button aria-expanded={expanded} aria-controls="assessment-choices"
          onClick={() => setExpanded(!expanded)}>
          {expanded ? "收起其他做法" : "看看其他做法"}
        </button>
      )}
      <button onClick={() => session.reveal()}>跳過測驗，從當下開始</button>
    </section>
  );
}
export function App({ session: provided }: { session?: PlayerSession }) {
  const [session] = useState(() => provided ?? createPlayerSession());
  const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot);
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    void session.check();
    const recheck = () => {
      if (
        document.visibilityState === "visible" &&
        session.getSnapshot().page === "home"
      )
        void session.check();
    };
    window.addEventListener("storage", recheck);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      window.removeEventListener("storage", recheck);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, [session]);
  useEffect(() => {
    if (snapshot.page !== "home")
      document.querySelector<HTMLElement>("main h1, main h2")?.focus();
  }, [snapshot.page]);
  useEffect(() => {
    if (snapshot.dialog) {
      dialog.current?.showModal();
      cancel.current?.focus();
    } else if (dialog.current?.open) {
      dialog.current.close();
      requestAnimationFrame(() => {
        const target = previousFocus.current;
        if (target?.isConnected && !target.closest("[hidden]")) target.focus();
        else document.getElementById("game-actions")?.focus();
        previousFocus.current = null;
      });
    }
  }, [snapshot.dialog]);
  const homePrimary = () => {
    previousFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    switch (snapshot.home.kind) {
      case "empty":
      case "completed":
        void session.newStory();
        break;
      case "active":
        void session.resume();
        break;
      case "migration":
        void session.migrate();
        break;
      case "corrupt":
      case "incompatible":
        session.recovery();
        break;
      default:
        void session.check();
    }
  };
  return (
    <>
      {snapshot.page === "home" ? (
        <HomePage
          save={snapshot.home}
          busy={snapshot.busy}
          status={snapshot.status}
          overlay={snapshot.dialog !== null}
          onPrimary={homePrimary}
          onNew={() => {
            previousFocus.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
            void session.newStory();
          }}
          onRecords={() => void session.resume("records")}
        />
      ) : (
        <>
          <header className="game-header">
            <a
              className="brand"
              href="#"
              onClick={(event) => {
                event.preventDefault();
                session.home();
              }}
            >
              今天也在養小孩
            </a>
            {snapshot.page === "game" && snapshot.game && (
              <div className="progress-label">
                <span>{snapshot.game.ageLabel}</span>
                <span>{snapshot.game.stageLabel}</span>
                <span>{snapshot.game.turnLabel}</span>
              </div>
            )}
            <span role="status">{snapshot.status}</span>
            <button disabled={snapshot.busy} onClick={session.home}>
              返回首頁
            </button>
          </header>
          {snapshot.page === "assessment" && (
            <main>
              <Assessment session={session} />
            </main>
          )}
          {snapshot.page === "reveal" && snapshot.reveal && (
            <main>
              <section className="opening reveal panel">
                <p className="eyebrow">故事還沒開始，先認識彼此</p>
                <h1 tabIndex={-1}>
                  從今天開始，
                  <br />
                  我要經營一個怎樣的家庭？
                </h1>
                <Illustration scene={3} />
                <p className="seed-label">家庭種子：{snapshot.reveal.seed}</p>
                <FamilyDetails family={snapshot.reveal.summary} />
                <h2>此刻的照顧傾向</h2>
                {snapshot.reveal.descriptions.map((text) => (
                  <p key={text}>{text}</p>
                ))}
                <div className="opening-actions">
                  <button disabled={snapshot.busy} onClick={session.reroll}>
                    重新抽選家庭
                  </button>
                  <button
                    className="primary"
                    disabled={snapshot.busy}
                    onClick={() => void session.startFamily()}
                  >
                    開始這個家庭
                  </button>
                </div>
              </section>
            </main>
          )}
          {snapshot.page === "game" && snapshot.game && (snapshot.game.review ? (
            <ReviewScreen game={snapshot.game} blocked={snapshot.busy || snapshot.error !== null}
              onSelect={(ids) => void session.selectMoments(ids)} onReplay={() => void session.replay()}
              onNew={() => void session.newStory()} />
          ) : (
            <GameScreen
              game={snapshot.game}
              busy={snapshot.busy}
              blocked={snapshot.error !== null}
              initialTab={snapshot.gameTab}
              onChoose={(id) => void session.choose(id)}
              onAdvance={() => void session.advance()}
              onDirection={(id) => void session.setDirection(id)}
            />
          ))}
        </>
      )}
      {snapshot.error && !snapshot.dialog && (
        <SaveNotice
          message={snapshot.error}
          busy={snapshot.busy}
          canRetry={snapshot.page === "game" && snapshot.canRetrySave}
          onRetry={() => void session.retrySave()}
          onHome={session.home}
        />
      )}
      <dialog
        ref={dialog}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = [
            ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
              "button:not(:disabled)",
            ),
          ];
          const first = controls[0];
          const last = controls.at(-1);
          if (!first || !last) {
            event.preventDefault();
            return;
          }
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
        onCancel={(event) => {
          event.preventDefault();
          session.closeDialog();
        }}
      >
        <h2 id="dialog-title">
          {snapshot.dialog === "confirm"
            ? "要開始新的故事嗎？"
            : "故事恢復選項"}
        </h2>
        <div id="dialog-description">
          {snapshot.error && <p role="alert">{snapshot.error}</p>}
          <p>{snapshot.home.summary}</p>
          {snapshot.dialog === "confirm" ? (
            <>
              <p>
                確認開始後，直到你選擇「開始這個家庭」才會取代目前進度／家庭紀錄。原始存檔會先保留於此瀏覽器；這不是永久多筆收藏。
              </p>
              <p>
                若開場途中取消，原本的故事保持不變。清除瀏覽器資料仍可能失去故事與保留檔。
              </p>
            </>
          ) : (
            <p>
              原始資料未刪除。你可以重新讀取；此版本沒有自動修復或備份還原功能。若開始新故事，會先要求確認並由存檔功能保留原檔。
            </p>
          )}
        </div>
        <div className="dialog-actions">
          <button
            ref={cancel}
            disabled={snapshot.busy}
            onClick={session.closeDialog}
          >
            {snapshot.dialog === "confirm" ? "保留原本的故事" : "關閉恢復選項"}
          </button>
          <button
            className="primary"
            disabled={snapshot.busy}
            onClick={() =>
              snapshot.dialog === "confirm"
                ? void session.confirmNew()
                : void session.check()
            }
          >
            {snapshot.busy
              ? snapshot.status
              : snapshot.dialog === "confirm"
                ? "確認開始新故事"
                : "重新讀取"}
          </button>
        </div>
      </dialog>
    </>
  );
}
