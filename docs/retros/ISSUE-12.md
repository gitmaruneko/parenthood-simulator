# Issue #12 retrospective

- Replay needs the original opening, not the final tendencies. New runs retain
  a validated opening snapshot, and a regression covers replay after changes.
- Extending generated state exposed an existing whole-state assertion in the
  assessment test. It now checks snapshot tendencies explicitly while preserving
  the assertion that family/resources/PRNG are independent of assessment answers.
- Use the nested paths `skills/engineering/implement/SKILL.md` and
  `skills/engineering/tdd/SKILL.md`; the skills directory is grouped by discipline.
- PowerShell blocks `npm.ps1` here; `npm.cmd` runs the existing scripts. The
  sandbox prevented esbuild from resolving the config, so verification used
  approved execution outside that restriction. The GitHub connector supplied
  the issue when the sandboxed `gh` request could not reach GitHub.
- CI already runs unit tests, typechecking and build. Browser tests remain a
  separate local check; adding Chromium flows to CI is a possible future change.
