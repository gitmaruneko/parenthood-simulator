import { useLayoutEffect, useRef, useState } from "react";
import type { HomeSaveView } from "../persistence/index.js";
import { Illustration } from "./Illustration.js";

const vignettes = [
  {
    title: "趕著接孩子",
    line: "工作還沒結束，接送時間已經到了。",
    story:
      "電腦上的訊息還在亮，包包裡放著孩子的水壺。你傳出一則詢問接手的訊息，也開始想，如果今天沒有人有空，可以先把哪件事往後放？",
    tag: "接送與交接",
  },
  {
    title: "廚房裡的晚餐",
    line: "煮飯之前，還有誰記得冰箱裡少了什麼？",
    story:
      "孩子在餐桌旁等著。冰箱上的便條寫著要補的食材，也寫著明天要帶的用品。今晚，也許可以先吃簡單一點，再一起把剩下的安排分清楚。",
    tag: "記得與安排",
  },
  {
    title: "推著嬰兒車搭捷運",
    line: "出門一趟，要先想好多少件事？",
    story:
      "你繞到有電梯的出口，再確認包裡的替換衣物。月台上的人潮來來去去，這趟路比想像中花時間。你決定為下一段行程多留一點空白。",
    tag: "日常裡的彈性",
  },
  {
    title: "終於坐下休息",
    line: "有人接住日常的時候，才發現自己累了。",
    story:
      "另一位照顧者接下提醒、收拾和睡前的準備。你坐下喝了一杯水，第一次不用一邊休息一邊想下一件事。有支持的日常，也需要慢慢練習。",
    tag: "支持與休息",
  },
];
const navigation = [
  ["families", "不同家庭"],
  ["thoughts", "父母心事"],
  ["how", "怎麼玩"],
  ["notes", "設計理念"],
];
export interface HomePageProps {
  save: HomeSaveView;
  busy: boolean;
  status: string;
  overlay: boolean;
  onPrimary: () => void;
  onNew: () => void;
  onRecords: () => void;
}

export function HomePage({
  save,
  busy,
  status,
  overlay,
  onPrimary,
  onNew,
  onRecords,
}: HomePageProps) {
  const [expanded, setExpanded] = useState<number[]>([]);
  const bar = useRef<HTMLElement>(null);
  const page = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = bar.current;
    if (!element) return;
    const resize = () => {
      const height = element.getBoundingClientRect().height;
      page.current?.style.setProperty("--bar-height", `${height + 32}px`);
      const available = window.visualViewport?.height ?? window.innerHeight;
      const inline = available < 520 || height > available * 0.36;
      element.dataset.inline = String(inline);
      document.documentElement.style.setProperty(
        "--home-bar-space",
        inline || overlay ? "0px" : `${height + 32}px`,
      );
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    window.visualViewport?.addEventListener("resize", resize);
    window.addEventListener("resize", resize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("resize", resize);
      document.documentElement.style.removeProperty("--home-bar-space");
    };
  }, [overlay]);
  return (
    <div className="home-page" ref={page}>
      <a className="skip" href="#game-actions">
        跳至遊戲操作
      </a>
      <header className="home-header">
        <a className="brand" href="#home">
          今天也在養小孩<span>一 起 生 活 的 練 習</span>
        </a>
        <nav aria-label="首頁導覽">
          {navigation.map(([id, title]) => (
            <a key={id} href={`#${id}`}>
              {title}
            </a>
          ))}
        </nav>
      </header>
      <main id="home">
        <section className="hero section-wrap" aria-labelledby="home-title">
          <div>
            <p className="eyebrow">一本關於我們的・家庭生活手帳</p>
            <h1 id="home-title">
              今天也在
              <br />
              養小孩<span className="title-dot">。</span>
            </h1>
            <p className="hero-line">
              沒有完美的選擇，
              <br />
              只有一起生活的練習。
            </p>
            <p>
              在接送、晚餐與睡前之間，
              <br />
              照顧一個孩子，也練習照顧一個家。
            </p>
            <a className="text-link" href="#families">
              看看不同家庭 <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-art">
            <span className="paper-note">
              有些成長，
              <br />
              發生在很小的日常。
            </span>
            <Illustration scene={1} />
            <p>今天的晚餐，可以慢慢來。</p>
          </div>
        </section>
        <section
          id="families"
          className="section-wrap"
          aria-labelledby="families-title"
        >
          <p className="eyebrow">生活有很多種樣子</p>
          <h2 id="families-title">
            每個家庭，
            <br className="mobile-break" />
            都有正在發生的生活
          </h2>
          <p>
            故事預覽・虛構情境。這些片段不是你的遊戲家庭，也不代表真實家庭的比例。
          </p>
          <div className="vignette-grid">
            {vignettes.map((item, index) => (
              <article className="vignette" key={item.title}>
                <Illustration scene={index} />
                <div className="vignette-copy">
                  <span className="eyebrow">
                    0{index + 1} ／ {item.tag}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.line}</p>
                  <button
                    className="text-link"
                    aria-expanded={expanded.includes(index)}
                    aria-controls={`preview-${index}`}
                    onClick={() =>
                      setExpanded((previous) =>
                        previous.includes(index)
                          ? previous.filter((id) => id !== index)
                          : [...previous, index],
                      )
                    }
                  >
                    {expanded.includes(index)
                      ? "收起這段生活 −"
                      : "讀一段生活 ＋"}
                  </button>
                  <p
                    id={`preview-${index}`}
                    hidden={!expanded.includes(index)}
                    className="preview-story"
                  >
                    {item.story}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section
          id="thoughts"
          className="thought-section"
          aria-labelledby="thoughts-title"
        >
          <div className="section-wrap thought-inner">
            <div>
              <p className="eyebrow">那些沒有寫在行事曆上的事</p>
              <h2 id="thoughts-title">
                不只是做了什麼，
                <br />
                還有一直記得什麼。
              </h2>
              <p>
                誰記得用品快用完了？誰安排接送、確認時間，再追蹤每一次交接？
                <br />
                這些看不見的工作，也是家庭生活的一部分。
              </p>
            </div>
            <blockquote>
              「我不是不想休息，
              <br />
              是還沒有人接手
              <br />
              記得這些事。」<footer>— 虛構照顧者的心聲</footer>
            </blockquote>
            <p className="thought-foot">
              支持、完整分工與修復，可能改變日常。疲累不是失敗，休息也值得被留下。
            </p>
          </div>
        </section>
        <section id="how" className="section-wrap" aria-labelledby="how-title">
          <p className="eyebrow">留一點時間，走進一個家</p>
          <h2 id="how-title">故事，從這裡開始</h2>
          <p>
            以約 10–15 分鐘為目標的敘事體驗，走過從出生到約六歲的 12
            個成長階段。
            <br />
            每個階段可以有多個 Turn 與事件，並不是只有 12 題。
          </p>
          <ol className="how-steps">
            {[
              "開始故事，完成或跳過 5 題開場情境",
              "認識家庭，也可以重新抽選",
              "在日常裡選擇，看見反應與後續",
              "把支持、修復與成長留在家庭生活紀錄",
            ].map((text, index) => (
              <li key={text}>
                <span aria-hidden="true">0{index + 1}</span>
                {text}
              </li>
            ))}
          </ol>
        </section>
        <section
          id="notes"
          className="section-wrap notes"
          aria-labelledby="notes-title"
        >
          <p className="eyebrow">關於這本生活手帳</p>
          <h2 id="notes-title">每個家，都有自己的節奏。</h2>
          <p>
            我們想留下那些不容易被看見的努力。這裡不評分父母、不排名家庭，也不預測孩子的未來。
          </p>
          <p>故事與人物皆為虛構；遊戲不是醫療、心理診斷或個別教養建議。</p>
          <p>
            <strong>
              不需帳號。故事只儲存在這台裝置的這個瀏覽器，不會跨裝置同步；清除瀏覽器資料可能失去進度。
            </strong>
          </p>
        </section>
      </main>
      <footer className="site-footer">
        今天也在養小孩 · 把日常，慢慢過成我們的故事。
      </footer>
      <section
        id="game-actions"
        aria-label="遊戲操作"
        className="floating-bar"
        ref={bar}
        hidden={overlay}
        tabIndex={-1}
      >
        <div>
          <span className="eyebrow">我們的下一頁</span>
          <p role="status" aria-live="polite">
            {busy ? status : save.summary}
          </p>
        </div>
        <div className="bar-actions">
          {save.primary && (
            <button className="primary" disabled={busy} onClick={onPrimary}>
              {save.primary}
            </button>
          )}
          {save.canStartNew && (
            <button disabled={busy} onClick={onNew}>
              開始新的故事
            </button>
          )}
          {save.kind === "completed" && (
            <button disabled={busy} onClick={onRecords}>
              重看家庭紀錄
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
