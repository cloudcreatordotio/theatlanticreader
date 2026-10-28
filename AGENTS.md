# AGENTS.md — The Atlantic Reader

Root pointer for agent sessions. This file and `docs/` are untracked on purpose; never stage them.

## Read first, in this order

1. `README.md` — the brief. Never edit it.
2. `docs/prompts/prompt.md` — role, decisions, traps, the session plan.
3. `docs/AGENTS.md` — session state (what is done, what is next, open items).
4. `docs/PROGRESS.md` — cross-session memory, newest entry first.
5. `docs/plan/PLAN.md` — the confirmed defect list, designs and per-session file lists.

## Hard rules

- Never edit `README.md` or `src/api/data/articles.json`. Never create a `CLAUDE.md`.
- Stage files by name; never `git add .` or `git add -A`. Never `--no-verify`, never rewrite history, never push.
- Conventional commits (`type(scope): subject`, lowercase subject); one verified atomic change per commit, its test in the same commit; no attribution trailers.
- No new dependency beyond `@testing-library/react-native` without a line in `NOTES.md` saying why.
- Do not touch `ios/` or `android/`; if a native build breaks, stop and report.
- Every change must be explainable in one sentence; follow the patterns already in the code.

## Check commands

```sh
npx tsc --noEmit
npx eslint .
npm test
```
