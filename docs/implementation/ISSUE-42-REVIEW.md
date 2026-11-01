# Issue #42 08A：Standards／Spec Review

固定基準：`097ba65c8048f4e63a76426fe337759f10d503be`（已合併T6的main）。首次審查`35f6d81`，修正提交`ba0a25e`後由原兩位獨立reviewer複審。範圍是使用者核准的相容基礎＋08A試玩；其餘35候選與全量12階段多入口延後，不冒稱#42完成。

## Standards

首次2項：

1. **P2，還原接受未知階段**：原內容感知驗證只核對事件ID，未核對currentAgeStageId及其他階段引用。修正為檢查內容目錄中的階段、事件與排程目標，並核對歷史／節點計數；加入未知階段拒收案例。
2. **P2，正式文件過時**：PERSISTENCE.md仍稱所有保存都寫v7，DOMAIN_SCHEMA.md未說明新路徑，違反AGENTS.md行為變更需更新文件的要求。已更新正式存檔、schema與Journal文件，明列preview v8與legacy v7。

複審結論：兩項均已解決。獨立試玩入口使用自己的sessionStorage，不寫一般localStorage；釘選入口與自然分布證據清楚分離。沒有確認到SHA-256或私有快取的正確性問題，也無其他需要列出的smell finding。**0項未解決**。

## Spec

首次1項：

1. **P1，清空完成ID能繞過必經queue驗證**：保留08A已選擇／已發生history，清掉completedEventIds與scheduledFollowUps，舊驗證會直接跳過後續義務並接受還原。違反「缺queue必須拒收，不重建虛構歷史」。已先新增測試重現失敗，再交叉核對完成ID集合、已發生錨點、choice occurrence、階段、nodeCount與必經queue。原始bytes保留，錯誤資料拒收。

複審結論：原P1已修正，精確繞過案例已有拒收測試。獨立試玩、延後批次擴充及目前相容落地範圍符合本輪授權。**0項未解決**。

Standards：首次2項、最高P2，現0 open；Spec：首次1項、最高P1，現0 open。完整測試由主實作程序執行，reviewer未把未執行的測試寫成通過證據。
