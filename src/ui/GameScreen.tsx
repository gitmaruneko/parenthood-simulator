import { useEffect, useRef, useState } from "react";
import type { FamilySummary } from "../engine/index.js";
import type { GamePresentation } from "./player-session.js";
import { Illustration } from "./Illustration.js";

export function FamilyDetails({
  family,
  compact = false,
}: {
  family: FamilySummary;
  compact?: boolean;
}) {
  if (compact)
    return (
      <>
        <p>{family.text}</p>
        <details>
          <summary>查看家庭組成與照顧安排</summary>
          <FamilyDetails family={family} />
        </details>
      </>
    );
  return (
    <>
      <p>{family.text}</p>
      {family.conditions.map((condition) => (
        <section className="condition" key={condition.conditionId}>
          <h3>{condition.title}</h3>
          <p>{condition.neutralSummary}</p>
          <ul>
            {condition.careImpacts.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
          <p>{condition.supportContext}</p>
          {condition.sourceReferences.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
            >
              {source.title}
            </a>
          ))}
        </section>
      ))}
    </>
  );
}
const resourceNames = {
  finances: "經濟餘裕",
  energy: "精力",
  support: "可用支持",
  timeFlexibility: "時間彈性",
  connection: "親子連結",
} as const;
function Resources({
  game,
  compact = false,
}: {
  game: GamePresentation;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "resource-summary" : "resources"}>
      {Object.entries(resourceNames)
        .slice(0, compact ? 3 : 5)
        .map(([key, label]) => {
          const value = game.resources[key as keyof typeof resourceNames];
          return (
            <div className="resource" key={key}>
              <span>{label}</span>
              <strong>
                {value}
                <span className="muted"> / 100</span>
              </strong>
              {!compact && (
                <meter min="0" max="100" value={value} aria-label={label}>
                  {value} / 100
                </meter>
              )}
            </div>
          );
        })}
    </div>
  );
}
const reactionNames: Record<string, string> = {
  understanding: "理解與支持",
  neutral: "中性回應",
  criticism: "不同期待／批評",
  none: "無反應",
};
const storyNames = {
  event: "生活片段",
  reaction: "實際觀察",
  planning: "記得與安排",
  support: "可用支持",
  repair: "重新連結",
};

export function FamilyLog({ game }: { game: GamePresentation }) {
  return (
    <section aria-labelledby="log-title">
      <h2 id="log-title" tabIndex={-1}>
        家庭生活紀錄
      </h2>
      {!game.history.length && <p>接下來的日常，會一段一段留在這裡。</p>}
      {game.history.map((entry) => (
        <article className="log-entry" key={entry.id}>
          <small>
            AgeStage{" "}
            {game.stages.findIndex((stage) => stage.id === entry.ageStageId) +
              1}{" "}
            · {game.turnLabels[entry.turnId]} · {storyNames[entry.kind]}
          </small>
          {entry.resolvedEventId && (
            <h3>{game.eventTitles[entry.resolvedEventId]}</h3>
          )}
          <p>{entry.text}</p>
          {entry.resolvedEventId &&
            game.choices
              .filter(
                (choice) =>
                  choice.eventId === entry.resolvedEventId &&
                  choice.turnId === entry.turnId,
              )
              .map((choice) => (
                <div
                  className="chosen"
                  key={`${choice.eventId}/${choice.choiceId}`}
                >
                  <p>
                    你的選擇：
                    {game.choiceTexts[`${choice.eventId}/${choice.choiceId}`]}
                  </p>
                  {choice.anticipatedJudgment && (
                    <p>當時的預期評價：{choice.anticipatedJudgment}</p>
                  )}
                </div>
              ))}
        </article>
      ))}
    </section>
  );
}
function Growth({ game }: { game: GamePresentation }) {
  return (
    <section>
      <h2>成長足跡</h2>
      <ol className="growth">
        {game.stages.map((stage, index) => (
          <li key={stage.id} aria-current={stage.current ? "step" : undefined}>
            <span>{String(index + 1).padStart(2, "0")}</span> {stage.label} ·{" "}
            {stage.completed
              ? "已留下紀錄"
              : stage.current
                ? "正在生活"
                : "尚未開始"}
          </li>
        ))}
      </ol>
    </section>
  );
}
export interface GameScreenProps {
  game: GamePresentation;
  busy: boolean;
  blocked: boolean;
  onChoose: (choice: string) => void;
  onAdvance: () => void;
}
export function GameScreen({
  game,
  busy,
  blocked,
  onChoose,
  onAdvance,
}: GameScreenProps) {
  const [tab, setTab] = useState("life");
  const [drawer, setDrawer] = useState(false);
  const [readThrough, setReadThrough] = useState(0);
  const title = useRef<HTMLHeadingElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const turnStories = game.history.filter(
    (entry) => entry.turnId === game.currentTurnId,
  );
  const reading = game.history.length > readThrough && turnStories.length > 0;
  const event = game.pendingEvent;
  const focusKey = reading
    ? `story-${game.history.length}`
    : (event?.id ?? game.nextLabel);
  useEffect(() => {
    title.current?.focus();
  }, [focusKey]);
  const recentThoughts = game.history
    .filter((entry) => ["planning", "support", "repair"].includes(entry.kind))
    .slice(-4);
  const tabItems = [
    ["life", "生活"],
    ["family", "家庭"],
    ["records", "紀錄"],
    ["thoughts", "心事"],
  ] as const;
  return (
    <main className="game-shell" data-tab={tab} data-drawer={drawer}>
      <button
        className="drawer-toggle"
        aria-expanded={drawer}
        onClick={() => setDrawer(!drawer)}
      >
        {drawer ? "收起家庭資訊" : "開啟家庭資訊"}
      </button>
      <aside
        className="family-column panel"
        id="panel-family"
        role="tabpanel"
        aria-label="家庭"
      >
        <section>
          <h2>家庭資源</h2>
          <p className="muted">眼前可用的空間，不是家庭分數。</p>
          <Resources game={game} />
        </section>
        <section>
          <p className="eyebrow">我們的生活底稿</p>
          <h2>家庭檔案</h2>
          <FamilyDetails family={game.family} compact />
        </section>
        <section className="mobile-members">
          <h2>家庭成員</h2>
          {game.members.map((member) => (
            <p key={member.id}>
              {member.displayName} · {member.recent ?? "一起走進今天的生活"}
            </p>
          ))}
        </section>
      </aside>
      <div
        className="story-column"
        id="panel-life"
        role="tabpanel"
        aria-label="生活"
      >
        <section className="scene-panel">
          <Illustration
            scene={game.stages.findIndex((stage) => stage.current) % 4}
          />
          <p>
            生活場景・
            {event?.locationId
              ? ({
                  home: "家中",
                  school: "學校",
                  work: "工作場所",
                  park: "公園",
                }[event.locationId] ?? "日常交接")
              : "家庭日常"}{" "}
            · 這一段生活
          </p>
        </section>
        <section
          className="event-panel panel"
          aria-labelledby="event-title"
          aria-busy={busy}
        >
          <p className="eyebrow">
            {reading
              ? "故事正在發展"
              : game.completed
                ? "我們一起走過的日子"
                : event
                  ? "今天的故事・等待你的選擇"
                  : "留一點空間，再繼續"}
          </p>
          <h2 id="event-title" tabIndex={-1} ref={title}>
            {reading
              ? "剛才的選擇，留在生活裡"
              : (event?.title ?? game.nextLabel)}
          </h2>
          {game.cause && <p className="cause">前一段生活：{game.cause}</p>}
          <div className="story-stream">
            {turnStories.map((entry) => (
              <article key={entry.id}>
                <span className="eyebrow">{storyNames[entry.kind]}</span>
                {entry.resolvedEventId && (
                  <h3>{game.eventTitles[entry.resolvedEventId]}</h3>
                )}
                <p>{entry.text}</p>
                {entry.resolvedEventId &&
                  game.choices
                    .filter(
                      (choice) =>
                        choice.eventId === entry.resolvedEventId &&
                        choice.turnId === entry.turnId,
                    )
                    .map((choice) => (
                      <div key={choice.choiceId}>
                        <p className="chosen">
                          你的選擇：
                          {
                            game.choiceTexts[
                              `${choice.eventId}/${choice.choiceId}`
                            ]
                          }
                        </p>
                        {choice.anticipatedJudgment && (
                          <p>預期評價：{choice.anticipatedJudgment}</p>
                        )}
                      </div>
                    ))}
              </article>
            ))}
          </div>
          {game.reactions
            .filter((reaction) => reaction.turnId === game.currentTurnId)
            .map((reaction, index) => (
              <p
                className="reaction-label"
                key={`${reaction.eventId}-${index}`}
              >
                實際觀察 ·{" "}
                {game.members.find((member) => member.id === reaction.actorId)
                  ?.displayName ?? "在場人物"}{" "}
                · {reactionNames[reaction.kind] ?? reaction.kind}：
                {reaction.text}
              </p>
            ))}
          {reading ? (
            <>
              <p>以上是已發生的故事。你可以慢慢讀；閱讀節奏不會改變結果。</p>
              <button
                className="primary"
                onClick={() => setReadThrough(game.history.length)}
              >
                繼續故事
              </button>
            </>
          ) : event ? (
            <>
              <p>{event.text}</p>
              <div className="decisions">
                {event.choices.map((choice) => (
                  <button
                    disabled={busy || blocked}
                    key={choice.id}
                    onClick={() => onChoose(choice.id)}
                  >
                    {choice.text}
                    {choice.anticipatedJudgment && (
                      <span className="choice-hint">
                        心裡預期：{choice.anticipatedJudgment}
                      </span>
                    )}
                    <span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            </>
          ) : game.completed ? (
            <p>
              十二個階段告一段落。這些紀錄留下眼前的生活，不預測未來。你可以查看家庭生活紀錄，或回首頁開始新的故事。
            </p>
          ) : (
            <>
              {game.turnEnded && (
                <p>這個 Turn 已結束。下一段生活仍由引擎接續。</p>
              )}
              <button
                className="primary"
                disabled={busy || blocked}
                onClick={onAdvance}
              >
                {game.nextLabel}
              </button>
            </>
          )}
        </section>
        <section
          className="mobile-resource-summary panel"
          aria-label="決策參考資源"
        >
          <Resources game={game} compact />
        </section>
      </div>
      <aside
        className="thought-column panel"
        id="panel-thoughts"
        role="tabpanel"
        aria-label="心事"
      >
        <section className="desktop-members">
          <h2>家庭成員</h2>
          {game.members.map((member) => (
            <article className="member" key={member.id}>
              <h3>{member.displayName}</h3>
              <p>{member.recent ?? "一起走進今天的生活"}</p>
            </article>
          ))}
        </section>
        <section>
          <p className="eyebrow">留給照顧者的一頁</p>
          <h2>父母心事</h2>
          {recentThoughts.length ? (
            recentThoughts.map((entry) => (
              <p className="thought-note" key={entry.id}>
                <small>{storyNames[entry.kind]}</small>
                <br />
                {entry.text}
              </p>
            ))
          ) : (
            <p>讓每一段記得、支持與修復，都有被看見的地方。</p>
          )}
        </section>
        <div className="desktop-growth">
          <Growth game={game} />
        </div>
      </aside>
      <div
        className="records-column panel"
        id="panel-records"
        role="tabpanel"
        aria-label="紀錄"
      >
        <FamilyLog game={game} />
        <div className="mobile-growth">
          <Growth game={game} />
        </div>
      </div>
      <nav className="bottom-tabs" role="tablist" aria-label="遊玩資訊">
        {tabItems.map(([id, label], index) => (
          <button
            key={id}
            role="tab"
            ref={(element) => {
              tabs.current[index] = element;
            }}
            id={`tab-${id}`}
            aria-controls={`panel-${id}`}
            aria-selected={tab === id}
            tabIndex={tab === id ? 0 : -1}
            onKeyDown={(event) => {
              const next =
                event.key === "ArrowRight"
                  ? (index + 1) % 4
                  : event.key === "ArrowLeft"
                    ? (index + 3) % 4
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? 3
                        : null;
              if (next !== null) {
                event.preventDefault();
                setTab(tabItems[next]![0]);
                tabs.current[next]?.focus();
              }
            }}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>
    </main>
  );
}
