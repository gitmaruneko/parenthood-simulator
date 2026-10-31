// @vitest-environment jsdom
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { FamilyDetails, FamilyLog, GameScreen } from "../src/ui/GameScreen.js";
import type { GamePresentation } from "../src/ui/player-session.js";
import { HomePage } from "../src/ui/HomePage.js";
import type { HomeSaveView } from "../src/persistence/index.js";
import { eventNodeSchema } from "../src/domain/schemas.js";
import { SaveNotice } from "../src/ui/SaveNotice.js";
import { FAMILY_LIFE_DIRECTIONS } from "../src/domain/family-life-direction.js";
import { App, Assessment } from "../src/ui/App.js";
import { createPlayerSession } from "../src/ui/player-session.js";
import { createLocalSaveStore } from "../src/persistence/index.js";
import { createFamilyRun, describeFamily } from "../src/engine/index.js";

beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(cleanup);
it.each([
  { busy: true, blocked: false }, { busy: false, blocked: true },
  { busy: false, blocked: false, nextInput: null },
])("disables continue when unavailable: %j", async flags => {
  const advance = vi.fn();
  render(<GameScreen game={{ ...game, ...(flags.nextInput === null ? { nextInput: null } : {}) }}
    busy={flags.busy} blocked={flags.blocked} onChoose={vi.fn()} onAdvance={advance} />);
  const button = screen.getByRole("button", { name: "繼續生活" }) as HTMLButtonElement;
  expect(button.disabled).toBe(true);
  await userEvent.click(button);
  expect(advance).not.toHaveBeenCalled();
});
it("introduces the saved family without displaying assessment tendencies", async () => {
  const session = createPlayerSession(createLocalSaveStore({ getItem: () => null, setItem: () => {} }), () => 42);
  await session.newStory(); session.reveal();
  render(<App session={session} />);
  for (const member of session.getSnapshot().reveal!.members) {
    const card = within(screen.getByRole("article", { name: member.displayName }));
    expect(card.getByText(`${member.relationship}${member.ageLabel ? ` · ${member.ageLabel}` : ""}`)).toBeTruthy();
    expect(card.getByText(member.lifeDetail!)).toBeTruthy();
  }
  expect(screen.queryByRole("heading", { name: "此刻的照顧傾向" })).toBeNull();
  expect(screen.getByText("你的孩子 · 2 個月")).toBeTruthy();
  expect(screen.getByRole("button", { name: "重新抽選家庭" })).toBeTruthy();
});
it("introduces a multigenerational family by kinship titles and keeps elder names out of the visible card", async () => {
  const run = createFamilyRun({ seed: 4294967295 });
  const elder = run.state.actorProfiles!["support-1"]!;
  const partner = run.state.actorProfiles!["caregiver-2"]!;
  if (elder.source === "legacy-unknown" || partner.source === "legacy-unknown") throw new Error("expected generated family");
  const session = createPlayerSession(createLocalSaveStore({ getItem: () => null, setItem: () => {} }), () => 4294967295);
  await session.newStory(); session.reveal();
  render(<App session={session} />);
  expect(screen.getByRole("heading", { level: 3, name: "婆婆" })).toBeTruthy();
  expect(screen.getByRole("heading", { level: 3, name: "先生" })).toBeTruthy();
  expect(screen.getByRole("heading", { level: 3, name: "孩子（小樹）" })).toBeTruthy();
  const card = within(screen.getByRole("article", { name: "婆婆" }));
  expect(card.getByText("習慣出門前把鑰匙和購物袋放在門邊。")).toBeTruthy();
  expect(screen.queryByText(elder.name, { exact: true })).toBeNull();
  expect(screen.queryByText(partner.name, { exact: true })).toBeNull();
});
it("expands opening candidates without answering and resets expansion for the next situation", async () => {
  const session = createPlayerSession(createLocalSaveStore({
    getItem: () => null, setItem: () => {},
  }), () => 42);
  await session.check();
  await session.newStory();
  render(<main><Assessment session={session} /></main>);
  const main = within(screen.getByRole("main"));
  expect(main.getByRole("heading", { name: /假設忙了一天/ })).toBeTruthy();
  expect(main.queryByRole("button", { name: /外食、外帶或叫外送/ })).toBeNull();
  await userEvent.click(main.getByRole("button", { name: "看看其他做法" }));
  expect(main.getByRole("button", { name: /同住家人已經煮好飯/ })).toBeTruthy();
  expect(session.getSnapshot().reveal).toBeNull();
  await userEvent.click(main.getByRole("button", { name: /外食、外帶或叫外送/ }));
  expect(main.getByRole("heading", { name: /假設和孩子在餐廳/ })).toBeTruthy();
  expect(main.queryByRole("button", { name: /安撫玩具/ })).toBeNull();
  await userEvent.click(main.getByRole("button", { name: "看看其他做法" }));
  expect(main.getByRole("button", { name: /手機或平板/ })).toBeTruthy();
  await userEvent.click(main.getByRole("button", { name: /事先準備的安撫玩具/ }));
  expect(main.getByRole("heading", { name: /孩子睡著了/ })).toBeTruthy();
  expect(main.queryByRole("button", { name: "看看其他做法" })).toBeNull();
  await userEvent.click(main.getByRole("button", { name: "跳過測驗，從當下開始" }));
  expect(session.getSnapshot().page).toBe("reveal");
  expect(session.getSnapshot().reveal).not.toBeNull();
}, 15000);

it("shows compact member relationships and expands household context without simulation commands", async () => {
  const choose = vi.fn();
  const advance = vi.fn();
  const props = { game: { ...game, members: [...game.members, {
    id: "support", displayName: "支持家人（不同住）", relationship: "不同住的支持家人",
    ageLabel: null, context: ["家庭照顧安排：目前會先確認彼此能接手的時間。"], recent: null,
    recentTimeLabel: null, memories: [],
  }] }, busy: false, blocked: false, onChoose: choose, onAdvance: advance };
  const view = render(<GameScreen {...props} />);
  const family = within(screen.getByRole("tabpanel", { name: "家庭" }));
  expect(family.getByText("你的孩子 · 2 個月")).toBeTruthy();
  expect(family.getAllByRole("article")).toHaveLength(2);
  await userEvent.click(family.getByText("查看支持家人（不同住）的生活脈絡"));
  expect(family.getByText(/家庭照顧安排/).closest("details")!.open).toBe(true);
  expect(choose).not.toHaveBeenCalled(); expect(advance).not.toHaveBeenCalled();
  view.rerender(<GameScreen {...props} game={{ ...props.game, members: props.game.members.map((member) =>
    member.id === "support" ? { ...member, recent: "今天確認了能幫忙的時間。" } : member) }} />);
  expect(family.getByText("最近：今天確認了能幫忙的時間。")).toBeTruthy();
  view.rerender(<GameScreen {...props} game={{ ...props.game, members: props.game.members.map((member) =>
    member.id === "support" ? { ...member, displayName: "共同照顧者", relationship: "共同照顧者" } : member) }} />);
  expect(within(family.getByRole("article", { name: "共同照顧者" })).getAllByText("共同照顧者")).toHaveLength(1);
});
it("shows household summaries, dates recorded reactions and reveals only stored personal memories", async () => {
  const familySummary = describeFamily({ ...createFamilyRun({ seed: 42 }).state.family,
    careParticipation: "shared", workArrangement: "flexible" });
  render(<GameScreen game={{ ...game, family: familySummary, members: [{ ...game.members[0]!,
    recent: "孩子拉著你的手。", recentTimeLabel: "2 個月 1 天", memories: ["你陪孩子一起緩了下來。"],
  }] }} busy={false} blocked={false} onChoose={vi.fn()} onAdvance={vi.fn()} />);
  const family = within(screen.getByRole("tabpanel", { name: "家庭" }));
  expect(family.getByText("照顧安排").tagName).toBe("DT");
  expect(within(family.getByText("照顧安排").closest("dl")!).getAllByRole("definition").map((item) => item.textContent))
    .toEqual(["共同分擔照顧", "彈性工作安排"]);
  const child = within(family.getByRole("article", { name: "孩子" }));
  expect(child.getByText("2 個月 1 天")).toBeTruthy();
  expect(child.getByText(/最近：孩子拉著你的手/)).toBeTruthy();
  const memory = child.getByText("你陪孩子一起緩了下來。");
  expect(memory.closest("details")!.open).toBe(false);
  await userEvent.click(child.getByText("查看孩子的生活脈絡"));
  expect(memory.closest("details")!.open).toBe(true);
  expect(child.queryByText(/家庭工作安排/)).toBeNull();
});
it("renders all directions as one accessible group and retains focus when the selection updates", async () => {
  const onDirection = vi.fn();
  const props = { game, busy: false, blocked: false, onChoose: vi.fn(), onAdvance: vi.fn(), onDirection };
  const view = render(<GameScreen {...props} />);
  const group = screen.getByRole("group", { name: "家庭生活方向" });
  expect(within(group).getAllByRole("radio")).toHaveLength(6);
  const radio = within(group).getByRole("radio", { name: /照顧者身心/ });
  await userEvent.click(radio);
  expect(onDirection).toHaveBeenCalledWith("caregiver-wellbeing");
  view.rerender(<GameScreen {...props} game={{ ...game, activeFamilyLifeDirectionId: "caregiver-wellbeing" }} />);
  expect((radio as HTMLInputElement).checked).toBe(true);
  expect(document.activeElement).toBe(radio);
  expect(within(group).getAllByRole("radio").filter((item) => (item as HTMLInputElement).checked)).toHaveLength(1);
  view.rerender(<GameScreen {...props} blocked />);
  expect((group as HTMLFieldSetElement).disabled).toBe(true);
  view.rerender(<GameScreen {...props} game={{ ...game, completed: true }} />);
  expect((group as HTMLFieldSetElement).disabled).toBe(true);
});
it("keeps direction explanations in an optional disclosure without advancing", async () => {
  const choose = vi.fn();
  const advance = vi.fn();
  const direction = vi.fn();
  render(<GameScreen game={game} busy={false} blocked={false}
    onChoose={choose} onAdvance={advance} onDirection={direction} />);
  const disclosure = screen.getByText("方向說明");
  const details = disclosure.closest("details")!;
  expect(details.open).toBe(false);
  await userEvent.click(disclosure);
  expect(details.open).toBe(true);
  for (const item of FAMILY_LIFE_DIRECTIONS) {
    expect(within(details).getByText(item.description)).toBeTruthy();
  }
  expect(choose).not.toHaveBeenCalled();
  expect(advance).not.toHaveBeenCalled();
  expect(direction).not.toHaveBeenCalled();
});
it("shows only family type, care status and one background before opening complete family details", async () => {
  const run = createFamilyRun({ seed: 42 });
  const family = describeFamily({ ...run.state.family, householdComposition: "singleCaregiver",
    careParticipation: "uneven", workArrangement: "flexible" });
  render(<FamilyDetails family={family} compact />);
  expect(screen.getAllByRole("definition").map((item) => item.textContent))
    .toEqual(["單一照顧者家庭", "分工尚待協調"]);
  const detail = screen.getByText("家庭詳細資料").closest("details")!;
  expect(detail.open).toBe(false);
  expect(within(detail).getByText("彈性工作安排")).toBeTruthy();
  expect(within(detail).getByText(family.text)).toBeTruthy();
  expect(screen.getAllByText(family.text)).toHaveLength(1);
  expect(screen.queryByText("單親家庭")).toBeNull();
  await userEvent.click(screen.getByText("家庭詳細資料"));
  expect(detail.open).toBe(true);
});
const game: GamePresentation = {
  review: null,
  planningLoad: 0,
  openingResources: null,
  activeFamilyLifeDirectionId: "flexible",
  familyLifeDirections: FAMILY_LIFE_DIRECTIONS,
  completed: false,
  pendingEvent: null,
  nextInput: { type: "ADVANCE" },
  nextLabel: "走進下一段生活",
  stageLabel: "AgeStage 1 / 12",
  ageLabel: "0 個月",
  turnLabel: "Turn 1",
  storyTimeLabels: { "turn-1": "2 個月 1 天" },
  turnEnded: true,
  stages: [],
  family: { text: "這是眼前的家庭", conditions: [] },
  resources: {
    finances: 50,
    energy: 40,
    support: 60,
    timeFlexibility: 30,
    connection: 70,
  },
  history: [
    {
      id: "night",
      ageStageId: "age-stage-1",
      turnId: "turn-1",
      kind: "support",
      text: "有人接下一段工作。",
    },
  ],
  choices: [],
  reactions: [],
  members: [{ id: "child", displayName: "孩子", relationship: "你的孩子", ageLabel: "2 個月", context: [], recent: null, recentTimeLabel: null, memories: [] }],
  currentTurnId: "turn-1",
  currentAgeStageId: "age-stage-1",
  cause: null,
  eventTitles: {},
  choiceTexts: {},
};

it("bolds only the saved choice and shows each actual consequence once while keeping T3's inline controls", async () => {
  const values = new Map<string, string>();
  const session = createPlayerSession(createLocalSaveStore({ getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); } }), () => 42);
  await session.check(); await session.newStory(); session.reveal(); await session.startFamily();
  await session.choose("coordinate");
  await session.advance();
  const saved = session.getSnapshot().game!;
  render(<GameScreen game={saved} busy={false} blocked={false} onChoose={vi.fn()} onAdvance={vi.fn()} />);
  const log = screen.getByRole("list", { name: "已發生的事件" });
  expect([...log.querySelectorAll("strong")].map(item => item.textContent))
    .toEqual(["把今晚需要的事列出來，協調一段可交接的時間"]);
  expect(screen.getAllByText(/你把待洗的用品、安撫和明早的準備寫成清單/)).toHaveLength(1);
  const records = within(log).getAllByRole("listitem");
  expect(records.some(record => record.textContent?.includes("天亮後"))).toBe(true);
  expect(records.at(-1)!.textContent).toContain("你的選擇");
  expect(screen.queryByRole("button", { name: "繼續故事" })).toBeNull();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(within(screen.getByRole("tabpanel", { name: "生活" })).getByText(/你把待洗的用品/)).toBeTruthy();
});

it("keeps legacy facts readable without presenting current option text as historical wording", () => {
  const history: GamePresentation["history"] = [
    {
      id: "event-1",
      resolvedEventId: "night",
      ageStageId: "age-stage-1",
      turnId: "turn-1",
      kind: "event",
      text: "完整事件正文不重複鋪在紀錄裡。",
    },
    {
      id: "planning-1",
      ageStageId: "age-stage-1",
      turnId: "turn-1",
      kind: "planning",
      text: "記得與安排的細節。",
    },
    {
      id: "reaction-1",
      ageStageId: "age-stage-1",
      turnId: "turn-1",
      kind: "reaction",
      text: "人物反應的細節。",
    },
    {
      id: "event-2",
      resolvedEventId: "reflection",
      ageStageId: "age-stage-1",
      turnId: "turn-1",
      kind: "event",
      text: "後續故事的完整段落。",
    },
    {
      id: "event-3",
      resolvedEventId: "support",
      ageStageId: "age-stage-1",
      turnId: "turn-2",
      kind: "support",
      text: "支持事件的完整段落。",
    },
  ];
  const original = structuredClone(history);
  render(
    <FamilyLog
      game={{
        ...game,
        history,
        stages: [
          {
            id: "age-stage-1",
            label: "2 個月",
            completed: false,
            current: true,
          },
        ],
        storyTimeLabels: { "turn-1": "2 個月 1 天", "turn-2": "2 個月 2 天" },
        eventTitles: {
          night: "凌晨的交接",
          reflection: "凌晨的交接之後",
          support: "有人接手了",
        },
        choices: [
          {
            eventId: "night",
            choiceId: "carry",
            ageStageId: "age-stage-1",
            turnId: "turn-1",
          },
        ],
        choiceTexts: { "night/carry": "今晚先自己承接，明天再談安排" },
      }}
    />,
  );
  const records = screen.getAllByRole("listitem");
  expect(records).toHaveLength(6);
  expect(records[4]!.textContent).toContain("你在這次事件做了選擇。");
  expect(records[0]!.textContent).toContain("2 個月 2 天");
  expect(records[1]!.textContent).toContain("2 個月 1 天");
  expect(records[5]!.textContent).toContain("2 個月 1 天");
  expect(
    screen.getByRole("list", { name: "已發生的事件" }).textContent,
  ).not.toMatch(/階段|Turn/);
  expect(records[1]!.textContent).toContain("後續故事的完整段落。");
  expect(screen.getByText("記得與安排的細節。")).toBeTruthy();
  expect(screen.getByText("人物反應的細節。")).toBeTruthy();
  expect(screen.getByText("完整事件正文不重複鋪在紀錄裡。")).toBeTruthy();
  expect(screen.queryByText("今晚先自己承接，明天再談安排")).toBeNull();
  expect(history).toEqual(original);
});
it("shows the latest story first and offers continuation without a Turn-ended notice", async () => {
  const history: GamePresentation["history"] = [
    {
      id: "earlier",
      resolvedEventId: "earlier-event",
      ageStageId: "age-stage-1",
      turnId: "turn-1",
      kind: "event",
      text: "較早發生的故事。",
    },
    {
      id: "latest",
      resolvedEventId: "latest-event",
      ageStageId: "age-stage-1",
      turnId: "turn-1",
      kind: "repair",
      text: "最新發生的故事。",
    },
  ];
  const original = structuredClone(history);
  const advance = vi.fn();
  render(
    <GameScreen
      game={{ ...game, history }}
      busy={false}
      blocked={false}
      onChoose={vi.fn()}
      onAdvance={advance}
    />,
  );
  const life = within(screen.getByRole("tabpanel", { name: "生活" }));
  const stories = within(screen.getByRole("list", { name: "已發生的事件" })).getAllByRole("listitem");
  expect(stories[0]!.textContent).toContain("最新發生的故事。");
  expect(stories[1]!.textContent).toContain("較早發生的故事。");
  expect(life.queryByText(/這個 Turn 已結束/)).toBeNull();
  expect(advance).not.toHaveBeenCalled();
  await userEvent.click(life.getByRole("button", { name: "繼續生活" }));
  expect(advance).toHaveBeenCalledOnce();
  expect(history).toEqual(original);
});
it("keeps AUTO_ADVANCE reading and mobile tabs separate from simulation commands", async () => {
  const choose = vi.fn();
  const advance = vi.fn();
  render(
    <GameScreen
      game={game}
      busy={false}
      blocked={false}
      onChoose={choose}
      onAdvance={advance}
    />,
  );
  expect(screen.queryByText("故事正在發展")).toBeNull();
  await userEvent.click(screen.getByRole("tab", { name: "家庭" }));
  await userEvent.click(screen.getByRole("tab", { name: "生活" }));
  expect(advance).not.toHaveBeenCalled();
  expect(choose).not.toHaveBeenCalled();
  expect(
    within(screen.getByRole("tabpanel", { name: "紀錄" })).getByText(
      "有人接下一段工作。",
    ),
  ).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: "繼續生活" }));
  expect(advance).toHaveBeenCalledOnce();
});

it.each<{
  kind: HomeSaveView["kind"];
  primary: string | null;
  canStartNew: boolean;
}>([
  { kind: "checking", primary: null, canStartNew: false },
  { kind: "empty", primary: "開始我們的故事", canStartNew: false },
  { kind: "active", primary: "繼續上次生活", canStartNew: true },
  { kind: "completed", primary: "開始新的故事", canStartNew: false },
  { kind: "migration", primary: "更新存檔並繼續", canStartNew: true },
  { kind: "corrupt", primary: "查看恢復選項", canStartNew: true },
  { kind: "incompatible", primary: "查看恢復選項", canStartNew: true },
  { kind: "unavailable", primary: "重新讀取", canStartNew: false },
])(
  "renders the classified $kind save and submits only the offered command",
  async ({ kind, primary, canStartNew }) => {
    const command = vi.fn();
    render(
      <HomePage
        save={{ kind, primary, canStartNew, summary: "由存檔邊界提供的摘要" }}
        busy={false}
        status=""
        overlay={false}
        onPrimary={command}
        onNew={command}
        onRecords={command}
      />,
    );
    const actions = within(screen.getByRole("region", { name: "遊戲操作" }));
    expect(actions.getByText("由存檔邊界提供的摘要")).toBeTruthy();
    if (primary) {
      await userEvent.click(actions.getByRole("button", { name: primary }));
      expect(command).toHaveBeenCalledOnce();
    } else expect(actions.queryAllByRole("button")).toHaveLength(0);
  },
);

it("keeps vignette expansion local, blocks busy commands and removes overlay actions", async () => {
  const command = vi.fn();
  const props = {
    save: {
      kind: "empty",
      primary: "開始我們的故事",
      canStartNew: false,
      summary: "開始",
    } as HomeSaveView,
    busy: true,
    status: "正在開啟故事…",
    overlay: false,
    onPrimary: command,
    onNew: command,
    onRecords: command,
  };
  const { rerender } = render(<HomePage {...props} />);
  await userEvent.click(
    screen.getAllByRole("button", { name: "讀一段生活 ＋" })[0]!,
  );
  expect(
    screen
      .getByRole("button", { name: "收起這段生活 −" })
      .getAttribute("aria-expanded"),
  ).toBe("true");
  await userEvent.click(screen.getByRole("button", { name: "開始我們的故事" }));
  expect(command).not.toHaveBeenCalled();
  rerender(<HomePage {...props} overlay />);
  expect(screen.queryByRole("region", { name: "遊戲操作" })).toBeNull();
});

it("presents only supplied player choices and distinguishes anticipation from observed reactions", async () => {
  const choose = vi.fn();
  const advance = vi.fn();
  const pendingEvent = eventNodeSchema.parse({
    id: "handoff",
    ageStageId: "age-stage-1",
    kind: "choice",
    mode: "PLAYER_INPUT_REQUIRED",
    title: "晚餐前的交接",
    text: "有人能一起分擔嗎？",
    weight: 1,
    choices: [
      {
        id: "ask",
        text: "一起確認可以接手的事",
        anticipatedJudgment: "也許對方正忙",
      },
      { id: "pause", text: "先休息一下" },
    ],
  });
  render(
    <GameScreen
      game={{
        ...game,
        pendingEvent,
        history: [],
        turnEnded: false,
        cause: "上一次交接時，你提出一起確認時段。",
        reactions: [
          {
            poolId: "family",
            reactionId: "heard",
            actorId: "child",
            kind: "understanding",
            text: "對方說可以接下一段。",
            eventId: "previous",
            ageStageId: "age-stage-1",
            turnId: "turn-1",
          },
        ],
      }}
      busy={false}
      blocked={false}
      onChoose={choose}
      onAdvance={advance}
    />,
  );
  expect(screen.getByText("心裡預期：也許對方正忙")).toBeTruthy();
  expect(screen.queryByText(/實際觀察 · 孩子 · 理解與支持/)).toBeNull();
  expect(screen.queryByText(/前一段生活：上一次交接時/)).toBeNull();
  expect(
    within(screen.getByRole("tabpanel", { name: "生活" })).getByRole("status")
      .textContent,
  ).toContain("等待你的選擇");
  await userEvent.click(
    screen.getByRole("button", { name: /一起確認可以接手的事/ }),
  );
  expect(choose).toHaveBeenCalledExactlyOnceWith("ask");
  expect(advance).not.toHaveBeenCalled();
});

it("focuses a recoverable save error and offers only supported recovery commands", async () => {
  const retry = vi.fn();
  const home = vi.fn();
  const { rerender } = render(
    <SaveNotice
      message="儲存空間不足，既有存檔仍保留。"
      busy={false}
      canRetry
      onRetry={retry}
      onHome={home}
    />,
  );
  expect(document.activeElement).toBe(screen.getByRole("alert"));
  await userEvent.click(screen.getByRole("button", { name: "重試儲存" }));
  expect(retry).toHaveBeenCalledOnce();
  rerender(
    <SaveNotice
      message="儲存空間不足，既有存檔仍保留。"
      busy
      canRetry
      onRetry={retry}
      onHome={home}
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: "重試儲存" }));
  expect(retry).toHaveBeenCalledOnce();
  rerender(
    <SaveNotice
      message="存檔已改變，請重新讀取。"
      busy={false}
      canRetry={false}
      onRetry={retry}
      onHome={home}
    />,
  );
  expect(screen.queryByRole("button", { name: "重試儲存" })).toBeNull();
  await userEvent.click(
    screen.getByRole("button", { name: "返回首頁並重新讀取" }),
  );
  expect(home).toHaveBeenCalledOnce();
});

it("opens completed family records directly and focuses their title", () => {
  render(
    <GameScreen
      game={{ ...game, completed: true, nextInput: null }}
      initialTab="records"
      busy={false}
      blocked={false}
      onChoose={vi.fn()}
      onAdvance={vi.fn()}
    />,
  );
  expect(
    screen.getByRole("tab", { name: "紀錄" }).getAttribute("aria-selected"),
  ).toBe("true");
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { name: "家庭生活紀錄" }),
  );
});
