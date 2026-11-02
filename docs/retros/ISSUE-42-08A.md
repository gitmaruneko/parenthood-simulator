# Issue #42 08A retrospective

- 內容版本落地先保留舊reader／writer，再加入新格式。將legacy parser從原邊界搬到凍結檔案，可讓既有golden保持原貌，避免新enum偷偷擴大舊格式接受範圍。
- 保證測試分成作者目錄結構、損壞checkpoint與實際完整局。只測缺queue不夠；本次Review找出「同時刪完成ID」的繞過，已轉為永久拒收測試。
- 保存邊界會被逐checkpoint、Session及檢查首頁多次呼叫。內容schema驗證不應每次重解析整份相同作者目錄；用有界私有快取保存已驗證目錄、對外clone，維持呼叫端可獨立修改測試資料。
- 一個測試內塞48組資料在完整並行套件下可能超時。依家庭型態拆成三個測試、完整十二階段整合明列15秒上限，保留原本全部行為斷言及命令步數上限，不全域放寬timeout。
- 新局改成preview時，純引擎與瀏覽器測試的「認識新家庭」預期也要選同一release；舊局的Replay仍使用legacy。兩種行為要分開證明，不能只更新保存版本常數。
- 長程測試開始後先完成該次執行再修改來源；測試程序可能使用啟動時已載入的模組，來源中途改動不能視為已驗證。本次最終證據在Review修正提交後重新全跑。
- 現有GitHub CI已跑test／typecheck／build／desktop/mobile。新增的內容與存檔回歸沿原npm scripts納入，不新增重複CI框架或擴寫AGENTS.md。
