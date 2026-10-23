// @vitest-environment jsdom
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { FamilyLog, GameScreen } from "../src/ui/GameScreen.js";
import type { GamePresentation } from "../src/ui/player-session.js";
import { HomePage } from "../src/ui/HomePage.js";
import type { HomeSaveView } from "../src/persistence/index.js";
import { eventNodeSchema } from "../src/domain/schemas.js";
import { SaveNotice } from "../src/ui/SaveNotice.js";

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
const game: GamePresentation = {
  completed: false,
  pendingEvent: null,
  nextInput: { type: "ADVANCE" },
  nextLabel: "走進下一段生活",
  stageLabel: "AgeStage 1 / 12",
  ageLabel: "0 個月",
  turnLabel: "Turn 1",
  turnLabels: { "turn-1": "Turn 1" },
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
  members: [{ id: "child", displayName: "孩子", recent: null }],
  currentTurnId: "turn-1",
  currentAgeStageId: "age-stage-1",
  cause: null,
  eventTitles: {},
  choiceTexts: {},
};

it("keeps one compact record per resolved event instead of separate narrative and reaction entries", () => {
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
        turnLabels: { "turn-1": "Turn 1", "turn-2": "Turn 2" },
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
  expect(records).toHaveLength(3);
  expect(records[0]!.textContent).toContain(
    "凌晨的交接 — 今晚先自己承接，明天再談安排",
  );
  expect(records[2]!.textContent).toContain("Turn 2");
  expect(screen.queryByText("記得與安排的細節。")).toBeNull();
  expect(screen.queryByText("人物反應的細節。")).toBeNull();
  expect(screen.queryByText("完整事件正文不重複鋪在紀錄裡。")).toBeNull();
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
  expect(screen.getByText("故事正在發展")).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: "繼續故事" }));
  await userEvent.click(screen.getByRole("tab", { name: "家庭" }));
  await userEvent.click(screen.getByRole("tab", { name: "生活" }));
  expect(advance).not.toHaveBeenCalled();
  expect(choose).not.toHaveBeenCalled();
  expect(
    within(screen.getByRole("tabpanel", { name: "生活" })).getByText(
      "有人接下一段工作。",
    ),
  ).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: "走進下一段生活" }));
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
  expect(screen.getByText(/實際觀察 · 孩子 · 理解與支持/)).toBeTruthy();
  expect(screen.getByText(/前一段生活：上一次交接時/)).toBeTruthy();
  expect(
    within(screen.getByRole("tabpanel", { name: "生活" })).getByRole("status")
      .textContent,
  ).toContain("最近的實際觀察");
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
