# A3 工作回顧

本輪沿已核定 #62 實作，不重建規格或擴張 #42。Standards／Spec 分開審查，維持各自結論。

- Preview 捷徑若直接起跑最後一階段，Engine 可完成單題，UI 的完整 Review 卻缺前段。這次改由真實 Engine 先走前段，再驗證十二階段 Review；未放寬正式 Review 契約。後續捷徑應重用這個可完成 Review 的起點方式。
- 測試家庭改 persistentActorIds 時，必須同步 replayOrigin actors 與兩份 actorProfiles；保存器確實抓到不一致，無需新增重複 guardrail。
- 從舊內容票衍生測試時只替換明確 release／symbol 名稱。廣泛替換 `a2` 曾誤改 `sha256`，固定 corpus 雜湊檢查立即失敗；保留該檢查。
- Windows 使用 `npm.cmd` 避免 PowerShell 執行原則阻擋。完整 E2E 在 source 固定後執行，避免開發伺服器熱更新干擾長流程。CI 已覆蓋 npm test／typecheck／build 與兩種 viewport，不另增重複檢查。
