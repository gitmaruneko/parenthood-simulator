# #37 完整遊玩範例：提出詢問不等於交接成功

固定 seed **42**，家庭為雙照顧者；孩子顯示「孩子（小禾）」，伴侶顯示「太太」。
本例可由公開引擎與 Save/Restore 重現，也有桌面／手機 E2E 驗證相同路徑。

## 1. 事件發生

`ADVANCE` 抵達 `night-handoff-choice`，AgeStage 1／Turn 1，畫面時間為「2 個月 1 天」。

> 與孩子（小禾）一起生活的日常。孩子醒來，你一邊安撫，一邊想著還沒洗的用品和明天的安排。輪班表上還有空白，眼前的照顧和之後要記住的事疊在一起。

此時仍待選，Journal 沒有預先寫入選擇或結果。

## 2. 玩家選擇及真正發生的事

玩家選「**詢問太太能否完整接手這一段**」，提交 `CHOOSE handoff`。
引擎接受詢問並寫入自身安排工作的結果；本 seed 解析為 `no-comment / none`，
actorId 為 null，沒有捏造太太的回應，也不新增一則可見人物反應。

原 Session 既有的下一次 `ADVANCE` 執行 `night-handoff-reflection`，記下天亮後
的用品與待辦；隨後 fallback 結束這段 Turn，沒有為 fallback 再湊一筆文字。
`night-handoff-support` 此時仍是 pending 排程，**尚未被寫成已發生支援**。

## 3. Journal 實際顯示順序（由新到舊）

三筆同為「2 個月 1 天」，依 history append 次序倒敘。

1. 凌晨的交接之後：天亮後，用品和待辦仍在桌邊。你發現昨晚除了安撫，也花了力氣記住誰何時能接手。
2. 凌晨的交接：你向太太提出完整交接的詢問，把開始時間、提醒與收尾列在一起，還沒有把交接當成已完成。
3. 凌晨的交接：凌晨孩子醒來，待洗的用品還放在桌邊，今晚的交接時段尚未確認。你選擇：**詢問太太能否完整接手這一段**

只有選項原文粗體，情境、結果與時間一般字重。實際發生次序則是 3 → 2 → 1。
此例恰有三筆是執行結果，並非固定「每次必須三筆」的呈現規則。

## 4. 保存、讀檔及回顧

各 checkpoint 保存 Save v6；重新載入後，紀錄仍是上方三筆，順序、文字、
sourceHistoryId、事件與 choice 索引完全相同。人物稱謂不重算成另一個關係，
讀取不執行命令或消耗 PRNG。E2E 逐筆比較 DOM 正文，並確認 LocalStorage bytes 未變。

| 倒序位置 | Journal ID |
| --- | --- |
| 1 | story-age-stage-1-turn-1-2-journal-0 |
| 2 | choice-effect-age-stage-1-turn-1-1-0-journal-0 |
| 3 | story-age-stage-1-turn-1-1-journal-0 |

以固定欄位順序序列化 id／text／kind／choiceText，讀檔前後 SHA-256 同為：

```text
0a592b06c59ee25e8432a1908435ff8e4c677d7510534376ed1382099df04534
```

讀檔前後完整 Journal 物件另以 deep equality 驗證相等。完成十二階段後，
原事件 history ID 仍可被選作三個回顧時刻之一；回顧使用同一份選擇與已發生結果，
不把後來的支援或新版 ContentPack 文字回寫到這次詢問當下。
