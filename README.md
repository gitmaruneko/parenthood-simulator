# parenthood-simulator

A parenting life simulation game about everyday choices, invisible labor, and family growth.

Run `npm install` and `npm run dev` to open the local player UI. See
[Player UI](docs/PLAYER_UI.md) for setup, testing, persistence behavior and remaining manual validation.

For the Issue #42 08A playtest, run `npm run dev` and open
`http://127.0.0.1:5173/preview-08a.html`. It starts directly at the toy-car story
and uses isolated session storage; the original family save stays untouched.
This shortcut is a development entry, not part of the production build.
See [scope, guarantees and compatibility](docs/implementation/ISSUE-42-08A-SLICE.md).
