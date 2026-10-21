# Issue tracker: GitHub

Issues and specs for this repository live in GitHub Issues for
`gitmaruneko/parenthood-simulator`. Use the `gh` CLI for tracker operations.

## Conventions

- Create: `gh issue create --title "..." --body "..."`
- Read: `gh issue view <number> --json number,title,body,labels,comments`
- List: `gh issue list --state open`
- Comment: `gh issue comment <number> --body "..."`
- Label: `gh issue edit <number> --add-label "..."`
- Close: `gh issue close <number> --comment "..."`

When a workflow skill says to publish to the issue tracker, create a GitHub
issue. When it says to fetch a ticket, read the corresponding GitHub issue.
Pull requests are not used as a triage request surface in this project.
