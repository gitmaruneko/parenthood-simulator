# parenthood-simulator

A parenting life simulation game about everyday choices, invisible labor, and family growth.

Run `npm install` and `npm run dev` to open the local player UI. See
[Player UI](docs/PLAYER_UI.md) for setup, testing, persistence behavior and remaining manual validation.

For the Issue #42 08A playtest, run `npm run dev` and open
`http://127.0.0.1:5173/preview-08a.html`. It starts directly at the toy-car story
and uses isolated session storage; the original family save stays untouched.
This shortcut is a development entry, not part of the production build.
See [scope, guarantees and compatibility](docs/implementation/ISSUE-42-08A-SLICE.md).

For Issue #60, open `/preview-narrative-a1.html?story=night` (or `story=door`,
`story=full`) on the local dev server. This isolated preview uses the new A1
release; the default release stays unchanged. See [A1 scope and evidence](docs/implementation/NARRATIVE-A1.md).
# Narrative A2 開發試玩

Issue #61 的獨立 Preview：`npm run dev -- --port 5173`，開啟 `http://127.0.0.1:5173/preview-narrative-a2.html`。
可選餐桌、用品、公園、雨天、休息或完整十二階段；使用隔離分頁存檔。正式預設 release 不變。
詳見 [A2 實作與已知缺陷](docs/implementation/NARRATIVE-A2.md) 及 [四家庭實際 Journal](docs/examples/NARRATIVE-A2-PLAYTHROUGH.md)。

