# Issue #13 retrospective

- The previous retrospective already identified unwired browser CI. This ticket
  connects the existing npm browser script, installs Chromium and retains
  failure artifacts instead of introducing another test runner.
- Small persistence fixtures are useful diagnostics but do not establish
  full-content acceptance. Record explicit public inputs, reload real checkpoints
  and compare complete transitions through the final family review.
- Automated completion cannot establish reading time, comprehensibility or
  editorial quality. Capture the user's playtest facts separately from test
  results and leave unreported outcomes pending. The user confirmed 12 minutes
  and two-parent care; missing outcome details remain in the acceptance report.
- Local passing tests and a configured workflow are distinct from a successful
  remote CI run. Keep the issue open until both external gates have evidence.
- Windows verification uses `npm.cmd`. The sandbox blocks esbuild's config
  resolution and outbound `gh`; approved execution was needed for those commands.
- Project skills are grouped under `skills/engineering/` and
  `skills/productivity/`, as already noted in the issue #12 retrospective.
