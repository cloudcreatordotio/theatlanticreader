# Progress — The Atlantic Reader

One entry per session. Newest at the top. Keep entries short — this is the cross-session memory.

## 2026-10-28 — Session 4: close-out

- Commit: `a3aa57f docs: add notes on the approach, fixes and tradeoffs` — `NOTES.md` folds in every "For NOTES.md" item from docs/AGENTS.md (the stale "`version: 1` has no migrate" item was replaced by the v2 migration), the VoiceOver gap with both fix options, the analytics-key rotation note and the AppState decision. No keys or tokens quoted.
- Gate: `npx eslint .` 0 problems, `npx tsc --noEmit` clean, `npm test` 16 suites / 59 tests green. Fresh clone of the local repo in the scratchpad: `npm ci`, `npm test` (59 green), `npm run lint` (0), `tsc` clean; the clone has no `docs/` or `AGENTS.md`.
- `git log --oneline`: 31 conventional commits after the three baseline ones; review fixes are separate commits.
- No independent review this session: one doc file, every claim checked against the code and the session logs.

Gotchas:

1. lint-staged runs Prettier on `*.md`, so `NOTES.md` was reformatted at commit (tables aligned).
2. `npm ci` prints `npm audit` advisories from the inherited tree; left alone.

- Follow-up: `1d86796 docs: explain the placeholder share preview on ios` — Developer saw a placeholder icon and "example.com" in the iOS share sheet; the sheet previews the page's Open Graph tags and the fixture URLs are example.com, so no code change (`LPLinkMetadata` would need native code or a new dependency).
- Follow-up: exported Sessions 0–4 to `docs/chat-logs/` (Markdown rendered from the local transcripts; reasoning and system reminders left out, long tool output clipped) and replaced the user's name with "Developer" in the logs and all `.md` files (README and NOTES.md had none). The git author identity is untouched.

Remaining: Developer's submission checklist in docs/AGENTS.md (chat logs, remote or tarball, docs decision).

Elapsed: ~3 min (01:12–01:15), most of it waiting on `npm ci`.

## 2026-10-28 — Session 3: Part 2B share, polish

- Commits: `f06564d` share (`shareArticle` platform payloads, never throws; `ShareButton` with a failure alert; detail header renders share + bookmark) · `e57c62e` friendly error copy + retry on feed, detail, not-found · `d059619` persisted `feed` slice shown behind a "Couldn't refresh" banner when no fresh data · `a79438b` 10 s client timeout on the article request · `52bcd2e` card image fades in on error so its surface box shows · review fixes: `da5ac19` "Updated" label counts from the last successful load (persist v2 + migrate) · `88e8141` per-request timeout reset.
- Reproduced before fixing: every new test failed against the unchanged code first; mutations: dropping the header's ShareButton, dropping `onError`, and (reviewer) reverting each fix each fail a test.
- Device (Android emulator over adb + uiautomator): share sheet shows "title\nurl"; back cancels silently; a forced throw shows "Could not share / Please try again." and the screen still scrolls and shares; `simulateServerError` → friendly copy, Try Again recovers; server error after a good load → saved feed + banner, pull after recovery clears it; `simulateTimeout` → timeout view at 10 s, Try Again loads the article 2 s later (well before the 30 s stall ends); broken card image → grey box; v1→v2 migration recovered a crashing half-written feed on the emulator. iOS: feed screenshot only; share sheet not yet hand-checked.
- Independent review (subagent): 6 findings; fixed the top two (label, timeout reset). Others queued for NOTES.md in docs/AGENTS.md. The subagent also staged and reformatted the untracked docs by accident (no commit happened); restored with Developer's approval — see docs/AGENTS.md "Process incident".
- Gate (after `7c7fcb2`): `npx eslint .` 0 problems, `npx tsc --noEmit` clean, `npm test` 16 suites / 59 tests green.
- Developer decided: keep the AppState listener as the analytics hook point (`analyticsConfig` was never used by it). Developer checked iOS by hand: the share sheet opens with the link; an article opened from Bookmarks must not read "Bookmarks", so `7c7fcb2` makes the detail back button chevron-only (simulator screenshot after the change).

Gotchas:

1. Under Jest `Platform.select` always takes the iOS branch (resolver loads `Platform.ios.js`); branch on `Platform.OS` if Android must be tested.
2. A native-driver animation never updates JS props under Jest; spy on `Animated.timing`.
3. urql's `useQuery` sets `data` to `undefined` on an error result, so a failed refetch loses the list.
4. redux-persist `autoMergeLevel1` hard-sets every stored key; a changed slice shape needs a `version` bump and a migrate, or old data crashes the screen. Fast Refresh can write a half-migrated shape mid-edit.
5. Never let a subagent mutate "a copy" it creates itself; prepare the copy and check `git status` after it returns.

Remaining / deferred: Session 4 (NOTES.md, fresh clone, checklist). Polish 4 skipped deliberately. Nothing pending from Developer.

Elapsed: ~21 min (00:35–00:56), including device checks, the review round and the restore.

## 2026-10-28 — Session 2: Part 2A bookmarks

- Commits: `e186127` bookmarks slice (add/remove/toggle, selectors, summary-only storage), `makeStore`, typed hooks, `whitelist: ['bookmarks']` + `version: 1` (defect 11) · `be5ecb5` `BookmarkButton` in the list item, the card and the detail header (`setOptions` once the article loads), `renderWithStore` test helper · `b408de4` Bookmarks screen, `EmptyState`, `BookmarkedArticles` route, feed header "Bookmarks" button (defect 17) · review fixes: `2d26766` restore test · `a5a2e16` card button test · `2a69fdb` detail back label no longer hard-coded "Feed" · `4c5021f` empty-state copy without the ☆ glyph.
- Reproduced before fixing: the store test failed with the old persist config (wrote `app` and `session`). Mutations: dropping the feed's `headerRight` fails the App test; `stateReconciler: false` fails the restore test; deleting the card's button fails the card test.
- Device (Android emulator over adb + uiautomator): bookmarked the card and a row from the feed (feed stayed put), the third article from the detail header; force-stop and relaunch → all three ★ in the feed and listed newest first with dates on the Bookmarks screen; removed all three from that screen → "No bookmarks yet". iOS simulator (screenshot only): header button and stars render.
- Independent review (subagent, diff + README criteria): no logic bugs. Acted on 5 findings (above). Not done: VoiceOver cannot reach the in-row star on iOS (open item for Developer); whitelist kept in the slice commit as planned; other tradeoffs queued for NOTES.md in docs/AGENTS.md.
- Gate: `npx eslint .` 0 problems, `npx tsc --noEmit` clean, `npm test` 13 suites / 41 tests green.

Gotchas:

1. `preloadedState` on a persisted reducer needs `_persist` in its type; seed test stores by dispatching.
2. `react/no-unstable-nested-components` flags `headerRight: () => <X/>` inside a component; build it at module scope.
3. redux-persist under global fake timers: `await jest.runAllTimersAsync()` after `persistStore` (rehydrate) and after a dispatch (write).
4. A nested touchable is reachable by TalkBack but grouped away from VoiceOver; RNTL's `getByRole` does not model either.
5. commitlint caps body lines at 100 characters.

Remaining / deferred: Session 3 (share, polish), Session 4 (NOTES.md, fresh clone). iOS back-label check by hand.

Elapsed: ~10 min (00:15–00:25), including device checks and the review round.

## 2026-10-28 — Session 1: Part 1 bug fixes

- Commits, in order: `37e2659` feed interval cleanup (5) · `58dfed9` refresh spinner depends on `fetching` (4) · `8137cd4` AppState subscription removed, log dropped (6) · `1bcfb3d` row opacity via style array (9) · `c50b8d0` resolver returns `first` articles (1) · `555d445` parse layer: raw/domain types, `parse.ts`, `formatDate`, hooks return `articles`/`article` (2, 3, 8) · `afcab30` header shows title (7) · `d9908b0` analytics config and import-time log removed (10) · `51af627` reading position restored after the article renders (12) · `693f6ef` fade on native driver (13) · `a209d68` dates formatted in UTC (review) · `7298c9c` spies restored after each detail test (review).
- Every fix's test was run against the unfixed code first and failed. The exception is the defect-9 refactor, whose characterisation test passed before and after; a mutation showed it catches the regression. Removing the digit-string branch from `parseDate` fails 5 tests, including the App smoke test.
- Device (Android emulator over adb): 10 articles ending at article-10, every row dated, article-4 "March 1, 2024" in the feed and on the detail, title in the header; pull-to-refresh spinner clears within 3 s; reading position restored on reopen and after a cold start through the loading view; `simulateServerError` shows the error view and Try Again recovers once the switch flips back. iOS simulator (screenshot only): feed renders with dates, card image fades in.
- Independent review (subagent, given the diff and the README criteria): no correctness bugs; it reverted each fix in a scratch copy and confirmed each test fails. Acted on: UTC date formatting, spy restore. Left as is, with reasons in docs/AGENTS.md: Prettier noise, the grouped parse commit, no header test, the commit-message wording of the key removal. The empty AppState branch is an open decision for Developer.
- Gate: `npx eslint .` 0 problems, `npx tsc --noEmit` clean, `npm test` 8 suites / 25 tests green.

Gotchas:

1. A storage read that resolves only after the rerender hides the reading-position bug; the test has to `await act(async () => {})` while the loading view is still showing.
2. `ScrollView.prototype.scrollTo` is the preset mock's `jest.fn`; spy on it there.
3. Unmounting a `FlatList` under Jest leaves one one-shot timer; run pending timers before counting.
4. Midnight-UTC epoch dates show the previous day in US zones unless formatted in UTC.
5. Don't `git checkout <file>` for a mutation check while the real change is still uncommitted; it wipes the change (it happened once and was redone).

Remaining / deferred: Sessions 2–4. Defects 11 (persist whitelist) and 17 (Bookmarks screen) are Session 2; 14 and 15 are Session 3 polish.

Elapsed: ~16 min (23:57–00:13), including device checks and the review round.

## 2026-10-27 — Session 0: audit, plan, test runner

- Read the brief, the prompt and the whole tree. Re-ran the baseline: tsc clean, eslint 5 errors, Jest failed on ESM in `@react-navigation/native` — exactly as the prompt said.
- Built and launched on the iPhone 17 simulator (`run-ios --no-packager`, Metro already up) and, since emulators were running, on the Pixel 10 Pro XL emulator (`run-android`, 16 s incremental build).
- Reproduced on the Android emulator via adb (screenshots in the session scratchpad): the feed ends at article-9 (defect 1), article-4 shows "Invalid Date" in the feed and on the detail (2), the pull-to-refresh spinner is still spinning 7 s after the pull (4), the detail header reads "article-4" (7). Defects 3, 5, 6, 8–13 confirmed by reading; the fixture is exactly as described (15 articles, two epoch-seconds dates, one null byline).
- Wrote `docs/plan/PLAN.md` (defect table with fix/test/commit, parse-layer and type design, bookmarks, share, polish ranking, per-session files, gates), the root `AGENTS.md` and `docs/AGENTS.md`.
- Commits: `9f710c6 test: make jest run with react-navigation and async-storage` (transform list, in-memory AsyncStorage mock, global fake timers, smoke test unmounts); `5c3c7fb chore(deps): add @testing-library/react-native for component tests` (13.3.3).
- Independent review of the diff (subagent, given the diff and the README's seven criteria) found two real problems, both verified before fixing: (1) `SafeAreaProvider` renders `null` under Jest until native insets arrive, so the smoke test proved only that the providers mounted; (2) the transform list carried two entries that were never needed (AsyncStorage is factory-mocked; Redux Toolkit's `react-native` export condition resolves to CommonJS). Fixed forward in `4129522 test: make the smoke test render the feed`: the shipped `react-native-safe-area-context/jest/mock` (its `.default`) is installed in `jest.setup.js`, the package is added to the transform list because the mock is TSX, the smoke test now uses RNTL and waits for the first article title (store → navigator → feed → mock API, ~0.8 s), and the two entries are gone.
- Verified after the fix: `npm test` green in ~2.7 s with no open-handle warning (also with `--no-cache`); `npx tsc --noEmit` clean; `npx eslint .` still the 5 pre-existing errors (Session 1); all three commits passed lint-staged and commitlint; `docs/` and `AGENTS.md` still untracked.

Gotchas:

1. The preset's `react-native` export condition pulls ESM builds of react-redux, RTK, immer and nanoid; all six packages are in the transform list.
2. `persistStore` starts a real 5 s timer at import, before any per-test `jest.useFakeTimers()` can run — hence `fakeTimers: {enableGlobally: true}`.
3. The iOS simulator (DeviceHub) cannot be tapped or swiped from the CLI here; adb on the Android emulator can. Screenshots work on both.
4. Prettier adds `{ a }` spacing to every touched file (no `bracketSpacing: false` in the repo config).
5. Domain date will be epoch ms, not `Date`, so the same summary can live in Redux (PLAN.md, Deviation 1).
6. Whole-App render tests need the safe-area mock; without it nothing below `SafeAreaProvider` renders and no error is raised. react-native-screens needs no mock.

Remaining / deferred: everything from Session 1 onward. Defects 12 and 13 float between Sessions 1 and 3 depending on time.

Elapsed: ~24 min (23:30–23:54), including the review round.
