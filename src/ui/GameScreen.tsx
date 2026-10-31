import { useEffect, useRef, useState, type ReactNode } from "react";
import type { FamilySummary } from "../engine/index.js";
import type { GamePresentation } from "./player-session.js";
import { Illustration } from "./Illustration.js";
import { FamilyMemberCard } from "./FamilyMemberCard.js";
import { projectJournal } from "../engine/index.js";
import { JournalText } from "./JournalText.js";
import type { FamilyLifeDirectionId } from "../domain/family-life-direction.js";

export function FamilyDetails({
  family,
  compact = false,
}: {
  family: FamilySummary;
  compact?: boolean;
}) {
  if (compact) {
    const household = family.conditions.find((condition) => condition.dimension === "householdComposition");
    const care = family.conditions.find((condition) => condition.dimension === "careParticipation");
    return (
      <>
        <dl className="family-summary">
          {household && <div><dt>家庭型態</dt><dd>{household.title}</dd></div>}
          {care && <div><dt>分工狀態</dt><dd>{care.title}</dd></div>}
        </dl>
        {household && <p className="family-background">{household.neutralSummary}</p>}
        <details>
          <summary>家庭詳細資料</summary>
          <FamilyDetails family={family} />
        </details>
      </>
    );
  }
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
const storyNames = {
  event: "生活片段",
  reaction: "實際觀察",
  planning: "記得與安排",
  support: "可用支持",
  repair: "重新連結",
};

export function FamilyLog({ game, children }: { game: GamePresentation; children?: ReactNode }) {
  const events = projectJournal({ history: game.history, choiceHistory: game.choices, reactionHistory: game.reactions }).reverse();
  return (
    <section aria-labelledby="log-title">
      <h2 id="log-title" tabIndex={-1}>
        家庭生活紀錄
      </h2>
      {children}
      {!events.length && <p>接下來的日常，會一段一段留在這裡。</p>}
      <ol className="event-log" aria-label="已發生的事件" role="list">
        {events.map((entry) => {
          return (
            <li className="log-entry" key={entry.id} id={`journal-${entry.id}`} tabIndex={-1} data-source-history-id={entry.sourceHistoryId}>
              <small>{game.storyTimeLabels[entry.turnId]}</small>
              <span className="journal-kind">{entry.kind === "choice" ? "你的選擇" : "已發生的生活"}</span>
              <JournalText entry={entry} />
            </li>
          );
        })}
      </ol>
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
function FamilyMembers({ game }: { game: GamePresentation }) {
  return <>
    <h2>家庭成員</h2>
    <dl className="family-arrangements">
      {game.family.conditions.filter((condition) => condition.dimension !== "householdComposition").map((condition) => (
        <div key={condition.conditionId}>
          <dt>{condition.dimension === "careParticipation" ? "照顧安排" : "家庭工作"}</dt>
          <dd>{condition.title}</dd>
        </div>
      ))}
    </dl>
    {game.members.map((member) => (
      <FamilyMemberCard key={member.id} member={member}>
        {member.recent && <p className="member-recent">
          {member.recentTimeLabel && <small>{member.recentTimeLabel}</small>}
          最近：{member.recent}
        </p>}
        {(member.context.length > 0 || member.memories.length > 0) && <details>
          <summary>查看{member.displayName}的生活脈絡</summary>
          {member.context.map((text) => <p key={text}>{text}</p>)}
          {member.memories.length > 0 && <>
            <h4>一起留下的片段</h4>
            <ul>{member.memories.map((text, index) => <li key={index}>{text}</li>)}</ul>
          </>}
        </details>}
      </FamilyMemberCard>
    ))}
  </>;
}
export interface GameScreenProps {
  game: GamePresentation;
  busy: boolean;
  blocked: boolean;
  onChoose: (choice: string) => void;
  onAdvance: () => void;
  onDirection?: (id: FamilyLifeDirectionId) => void;
  initialTab?: "life" | "records";
}
export function GameScreen({
  game,
  busy,
  blocked,
  onChoose,
  onAdvance,
  onDirection,
  initialTab = "life",
}: GameScreenProps) {
  const [tab, setTab] = useState<string>(initialTab);
  const [drawer, setDrawer] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const journal = projectJournal({ history: game.history, choiceHistory: game.choices, reactionHistory: game.reactions });
  const event = game.pendingEvent;
  const focusKey = event?.id ?? `${game.currentTurnId}-${game.history.length}`;
  useEffect(() => {
    if (initialTab === "records") document.getElementById("log-title")?.focus();
    else title.current?.focus();
  }, [focusKey, initialTab]);
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
          <FamilyMembers game={game} />
        </section>
      </aside>
      <div
        className="story-column"
        id="panel-life"
        role="tabpanel"
        aria-label="生活"
      >
        <section
          className="direction-panel panel life-details"
          aria-labelledby="direction-title"
        >
          <fieldset disabled={blocked || game.completed} aria-describedby="direction-help">
            <legend id="direction-title">家庭生活方向</legend>
            <p id="direction-help" className="sr-only">一次選一個方向，可隨時更換並自動保存，只影響尚未抽選的故事。</p>
            <div className="direction-options">
              {game.familyLifeDirections.map((direction) => (
                <label key={direction.id} className="direction-option">
                  <input type="radio" name="family-life-direction" value={direction.id}
                    checked={game.activeFamilyLifeDirectionId === direction.id}
                    onChange={() => onDirection?.(direction.id)} />
                  <span>{direction.name}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <details className="direction-details">
            <summary>方向說明</summary>
            <p className="muted">隨時可更換，影響接下來尚未抽選的故事。切換後自動保存。</p>
            <dl>
              {game.familyLifeDirections.map((direction) => (
                <div key={direction.id}>
                  <dt>{direction.name}</dt><dd>{direction.description}</dd>
                </div>
              ))}
            </dl>
          </details>
        </section>
        <div className="records-column panel" id="panel-records" role="tabpanel" aria-label="紀錄">
          <FamilyLog game={game}>
            <section className="event-panel" aria-labelledby="event-title" aria-busy={busy}>
              <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {event ? `新的事件：${event.title}。等待你的選擇。` : game.nextLabel}
              </p>
              <h2 id="event-title" tabIndex={-1} ref={title}>
                {event?.title ?? (game.completed ? game.nextLabel : "繼續生活")}
              </h2>
              {event ? (
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
                <button
                  className="primary"
                  disabled={busy || blocked || !game.nextInput}
                  onClick={onAdvance}
                >
                  繼續生活
                </button>
              )}
            </section>
          </FamilyLog>
          <div className="mobile-growth"><Growth game={game} /></div>
        </div>
        <details className="scene-panel life-details">
          <summary>看看生活場景</summary>
          <Illustration scene={game.stages.findIndex(stage => stage.current) % 4} />
        </details>
        <section
          className="mobile-resource-summary panel life-details"
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
          <FamilyMembers game={game} />
        </section>
        <section>
          <p className="eyebrow">留給照顧者的一頁</p>
          <h2>父母心事</h2>
          {recentThoughts.length ? (
            recentThoughts.map((entry) => (
              <p className="thought-note" key={entry.id}>
                <small>{storyNames[entry.kind]}</small>
                <br />
                <button className="journal-link" onClick={() => {
                  setTab("records");
                  const record = journal.find(record => record.sourceHistoryId === entry.id);
                  requestAnimationFrame(() => document.getElementById(record ? `journal-${record.id}` : "log-title")?.focus());
                }}>{game.storyTimeLabels[entry.turnId]} · 在生活紀錄查看這段記掛</button>
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
