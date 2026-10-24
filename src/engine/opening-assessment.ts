import type { GameState } from "../domain/schemas.js";

type Tendency = "responsibility" | "flexibility" | "selfCare" | "sharedCare";
type TendencyWeights = Partial<Record<Tendency, number>>;

interface AssessmentQuestion {
  readonly id: string;
  readonly text: string;
  readonly choices: readonly { readonly id: string; readonly text: string }[];
}

interface WeightedQuestion extends AssessmentQuestion {
  readonly choices: readonly { readonly id: string; readonly text: string; readonly weights: TendencyWeights }[];
}

// Fictional narrative weights, not a psychological scale. Positions carry no fixed meaning.
const QUESTIONS: readonly WeightedQuestion[] = [
  {
    id: "dinner", text: "假設忙了一天，到了安排晚餐的時間，你會想怎麼吃？",
    choices: [
      { id: "simple-meal", text: "簡單煮一餐，留一點力氣休息。", weights: { flexibility: 1, selfCare: 1 } },
      { id: "cook-plan", text: "照原本的安排煮飯，讓晚上的作息熟悉一些。", weights: { responsibility: 2, flexibility: 1 } },
      { id: "share-meal", text: "如果有伴侶或家人能幫忙，問問能不能一起準備晚餐。", weights: { sharedCare: 2, selfCare: 1 } },
      { id: "pause-meal", text: "先坐一下，再決定今晚怎麼吃。", weights: { selfCare: 2, flexibility: 1 } },
      { id: "buy-meal", text: "外食、外帶或叫外送，今天先省下煮飯的力氣。", weights: { flexibility: 2, selfCare: 1 } },
      { id: "prepared-meal", text: "如果有同住家人已經煮好飯，就一起吃準備好的飯菜。", weights: { sharedCare: 1, flexibility: 1 } },
    ],
  },
  {
    id: "restaurant", text: "假設和孩子在餐廳吃飯，孩子哭了起來，你會想先做什麼？",
    choices: [
      { id: "quiet-corner", text: "先和孩子到安靜一點的地方，讓彼此緩一緩。", weights: { responsibility: 1, flexibility: 1 } },
      { id: "take-turns", text: "如果孩子的爸爸、家人或朋友也在，商量輪流陪孩子、輪流吃飯。", weights: { sharedCare: 2, responsibility: 1 } },
      { id: "pack-meal", text: "改成外帶，換個比較合適的節奏。", weights: { flexibility: 2, selfCare: 1 } },
      { id: "settle-first", text: "在座位上先陪孩子安定下來，也讓自己喘口氣。", weights: { selfCare: 2, responsibility: 1 } },
      { id: "screen-soothe", text: "如果手邊有手機或平板，先拿出來轉移孩子的注意。", weights: { responsibility: 1, flexibility: 1 } },
      { id: "comfort-toy", text: "如果有帶事先準備的安撫玩具，拿給孩子試試。", weights: { responsibility: 1, flexibility: 1 } },
    ],
  },
  {
    id: "after-sleep", text: "孩子睡著了，家務還沒做完，你現在比較想怎麼安排？",
    choices: [
      { id: "tomorrow-ready", text: "先準備明天要用的東西，再留一點時間休息。", weights: { responsibility: 2, selfCare: 1 } },
      { id: "leave-chores", text: "把不急的事留到明天。", weights: { flexibility: 2, selfCare: 1 } },
      { id: "handoff-chores", text: "與可支援的人確認家務交接。", weights: { sharedCare: 2, responsibility: 1 } },
      { id: "rest-tonight", text: "今晚先休息，明天再看當時的狀況。", weights: { selfCare: 2, flexibility: 1 } },
    ],
  },
  {
    id: "comments", text: "親友對你的照顧方式提出意見，你現在比較想怎麼回應？",
    choices: [
      { id: "talk-together", text: "邀請願意理解的人，一起談談實際需要的支持。", weights: { sharedCare: 2 } },
      { id: "hold-boundary", text: "說明目前的安排，暫時保留自己的界線。", weights: { responsibility: 1, selfCare: 2 } },
      { id: "try-suggestion", text: "挑一個適合眼前狀況的建議試試。", weights: { flexibility: 2, responsibility: 1 } },
      { id: "defer-comment", text: "先不急著回應，等有餘裕再談。", weights: { selfCare: 1, flexibility: 2 } },
    ],
  },
  {
    id: "free-time", text: "難得空出一小段時間，你現在想怎麼使用？",
    choices: [
      { id: "own-time", text: "做一點自己的事，讓身體與心情緩下來。", weights: { selfCare: 2 } },
      { id: "prepare-next", text: "整理接下來的行程，減少臨時協調。", weights: { responsibility: 2, sharedCare: 1 } },
      { id: "connect-support", text: "和可支援的人聊聊彼此最近的安排。", weights: { sharedCare: 2, selfCare: 1 } },
      { id: "follow-mood", text: "不先排滿，看看當下最需要什麼。", weights: { flexibility: 2, selfCare: 1 } },
    ],
  },
];

export const getAssessmentQuestions = (): readonly AssessmentQuestion[] =>
  QUESTIONS.map((question) => ({
    id: question.id, text: question.text,
    choices: question.choices.map(({ id, text }) => ({ id, text })),
  }));

const DESCRIPTIONS: Record<Tendency, string> = {
  responsibility: "目前的情境裡，你可能想先把眼前需要的安排準備好；這份傾向可以隨日常改變。",
  flexibility: "目前的情境裡，你可能願意調整原來的安排，找出眼前用得上的做法。",
  selfCare: "目前的情境裡，你可能想為自己的休息留一些空間，之後也可以再調整。",
  sharedCare: "目前的情境裡，你可能想找人一起分擔，讓支持更貼近當下需要。",
};

export const describeTendencies = (tendencies: GameState["tendencies"]): readonly string[] => {
  const neutralContext = "照顧傾向可以隨日常、支持與選擇慢慢改變。";
  const keys = (Object.keys(DESCRIPTIONS) as Tendency[]).filter((key) => (tendencies[key] ?? 0) > 0);
  if (keys.length === 0) {
    return ["你可以先從當下的需要開始，不必預先決定自己的照顧方式。", neutralContext];
  }
  const descriptions = keys.sort((left, right) => (tendencies[right] ?? 0) - (tendencies[left] ?? 0))
    .slice(0, 3).map((key) => DESCRIPTIONS[key]);
  return descriptions.length === 1 ? [...descriptions, neutralContext] : descriptions;
};

export interface OpeningAssessment {
  readonly status: "skipped" | "completed";
  readonly descriptions: readonly string[];
}

export const resolveOpeningAssessment = (answers?: readonly string[] | null): {
  readonly tendencies: GameState["tendencies"];
  readonly assessment: OpeningAssessment;
} => {
  const tendencies: Record<Tendency, number> = { responsibility: 0, flexibility: 0, selfCare: 0, sharedCare: 0 };
  if (answers != null) {
    if (answers.length !== QUESTIONS.length) throw new Error("complete all five questions or skip the assessment");
    QUESTIONS.forEach((question, index) => {
      const choice = question.choices.find((candidate) => candidate.id === answers[index]);
      if (!choice) throw new Error(`invalid answer for question ${question.id}`);
      for (const key of Object.keys(tendencies) as Tendency[]) tendencies[key] += choice.weights[key] ?? 0;
    });
  }
  return {
    tendencies,
    assessment: { status: answers == null ? "skipped" : "completed", descriptions: describeTendencies(tendencies) },
  };
};
