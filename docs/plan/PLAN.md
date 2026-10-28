# Plan — The Atlantic Reader take-home

Written in Session 0 (2026-10-27). Everything under "Decisions" and "Recommended defaults" in `docs/prompts/prompt.md` was confirmed in Session 0 except where a **Deviation** is marked below; each deviation has a reason and is also recorded in `docs/AGENTS.md`.

## Sessions at a glance

| Session | Deliverable                                                  | Budget  | Status                              |
| ------- | ------------------------------------------------------------ | ------- | ----------------------------------- |
| 0       | Audit, this plan, Jest runs, RNTL installed                  | ~30 min | done                                |
| 1       | Part 1 bug fixes, one commit per defect                      | ~45 min | done                                |
| 2       | Part 2A bookmarks (slice, persist whitelist, button, screen) | ~40 min | done                                |
| 3       | Part 2B share, then ranked polish until the budget is spent  | ~40 min | done (polish 1, 2, 3, 5; 4 skipped) |
| 4       | `NOTES.md`, fresh-clone rehearsal, submission checklist      | ~20 min | done (`a3aa57f`)                    |

## Confirmed defects

Reproduced on 2026-10-27. "Device" means seen on the Android emulator via adb (the JS is identical on iOS; the iOS simulator cannot be driven from the CLI on this machine — see `docs/AGENTS.md`). "Code" means confirmed by reading; the fix's test is the reproduction.

| #   | Defect                                       | Seen                                                                                            | Cause                                                                                                                             | Fix                                                                                        | Test                                                                                                                                                       | Commit (Session 1 unless noted)                                                                                                 |
| --- | -------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Feed shows 9 articles for `first: 10`        | Device: feed ends at article-9                                                                  | `articles.resolver.ts` slices `0, first - 1`                                                                                      | `slice(0, args.first)`                                                                     | Call `articleResolvers.Query.latestArticles` with `first: 10` → 10 edges (fake timers skip the latency)                                                    | `fix(api): return the requested number of articles`                                                                             |
| 2   | "Invalid Date" in the feed and the detail    | Device: article-4 in both places                                                                | Epoch seconds arrive as the digit string `"1709251200"`; `new Date(...)` of that is invalid; the list item only checks truthiness | Parse at the boundary (`parseDate`), one `formatDate`, components never call `new Date`    | `parseDate` with both fixture values, ISO, number, 13 digits, garbage, null; `formatDate(null)` → null; list item renders article-4 without "Invalid Date" | `fix(graphql): parse api data into domain types at the query boundary`                                                          |
| 3   | Crash on `authors: null`                     | Code: `ArticleListItem` calls `article.authors.map` unguarded; article-13 is hidden by #1 today | Type says `Author[]`, schema says `[Author!]` (nullable)                                                                          | Parse layer returns `[]` for a missing list; types made honest                             | Render the list item with `authors: null` → no throw, no byline                                                                                            | same commit as #2                                                                                                               |
| 4   | Pull-to-refresh never stops                  | Device: spinner still visible 7 s after the pull                                                | `useRefreshControl` resets `refreshing` in an effect with `[]` deps                                                               | Depend on `fetching`; reset when it turns false                                            | `renderHook`: `onRefresh` → `refreshing` true; rerender `fetching` true→false → false                                                                      | `fix(feed): stop the refresh spinner when fetching ends`                                                                        |
| 5   | Interval leak in the feed                    | Code: `setInterval` per `lastRefreshed` change, never cleared; lint error for the unused handle | Effect has no cleanup                                                                                                             | Return `() => clearInterval(interval)` from the effect                                     | Render the feed with mocked queries; unmount → `jest.getTimerCount()` is 0                                                                                 | `fix(feed): clear the refresh-label interval on unmount`                                                                        |
| 6   | `AppState` listener leak + `console.log`     | Code                                                                                            | Subscription never removed; handler logs                                                                                          | Keep the subscription and `remove()` it in cleanup; drop the log (lint error)              | Spy on `AppState.addEventListener`; unmount → `remove` called                                                                                              | `fix(detail): remove the app-state listener on unmount`                                                                         |
| 7   | Header shows "article-4"                     | Device                                                                                          | `headerTitle: route.params.id`                                                                                                    | `headerTitle: route.params.title`                                                          | None (one-line navigator option; verified on device)                                                                                                       | `fix(navigation): show the article title in the detail header`                                                                  |
| 8   | `wordCount: 0` renders a bare `0`            | Code: `{article.wordCount && <Text/>}`                                                          | Falsy-check on a number                                                                                                           | Render only when `typeof wordCount === 'number'` (the parse layer yields `number \| null`) | Detail screen with mocked `useArticle` and `wordCount: 0` → "0 words"; `null` → no word count                                                              | same commit as #2                                                                                                               |
| 9   | Inline style object on the list row          | Lint                                                                                            | `style={{...styles.container, opacity}}`                                                                                          | Two stylesheet entries (`container`, `containerNoThumbnail`) selected by condition         | Covered by the list item render test                                                                                                                       | `refactor(list): move the row opacity into the stylesheet`                                                                      |
| 10  | Live-looking analytics key + import-time log | Lint, code                                                                                      | `analyticsConfig` imported nowhere; `console.log` at import                                                                       | Delete both; keep `apiConfig` and its switches                                             | None (deletion); recorded in `NOTES.md`                                                                                                                    | `chore(api): remove the unused analytics config and startup log`                                                                |
| 11  | Dev tokens persisted in plain text           | Code                                                                                            | Root persist config has no whitelist                                                                                              | `whitelist: ['bookmarks']` when the slice lands                                            | Store test: persisted keys exclude `session`                                                                                                               | `feat(store): add a persisted bookmarks slice` (Session 2, done)                                                                |
| 12  | Reading position never restored              | Code: effect runs while `LoadingView` shows, ref is null                                        | Restore runs once on mount                                                                                                        | Restore in an effect keyed on `article?.id` once the body exists; ignore storage errors    | Detail with mocked `useArticle` and a stored position → `scrollTo` called                                                                                  | `fix(detail): restore the reading position once the article renders` (Session 1 if budget, else Session 3)                      |
| 13  | Opacity fade on the JS thread                | Code                                                                                            | `useNativeDriver: false`                                                                                                          | `true` (opacity is native-driver safe)                                                     | None                                                                                                                                                       | `perf(card): run the image fade on the native driver` (with #12)                                                                |
| 14  | `simulateTimeout` spins for 30 s             | Code                                                                                            | No client-side timeout                                                                                                            | Polish item 3                                                                              | Detail test with fake timers                                                                                                                               | `feat(detail): time out a stalled article request` (Session 3, done) + `fix(detail): give each article request its own timeout` |
| 15  | Raw error text in the feed                   | Code                                                                                            | `message={error.message}`                                                                                                         | Polish item 1                                                                              | Feed and detail error tests                                                                                                                                | `feat(ui): show friendly error copy with retry` (Session 3, done)                                                               |
| 16  | Test runner broken                           | Baseline                                                                                        | ESM in node_modules                                                                                                               | Done in Session 0                                                                          | smoke test                                                                                                                                                 | `test: make jest run with react-navigation and async-storage` (done)                                                            |
| 17  | `BookmarkedArticles` declared, no screen     | Code                                                                                            | —                                                                                                                                 | Bookmarks screen                                                                           | Screen test, both states; App test opens it from the header                                                                                                | `feat(bookmarks): add the bookmarks screen` (Session 2, done)                                                                   |

Commit order in Session 1 (so each commit lints clean on its own and fixes the pre-existing lint error in every file it touches): 5 → 4 → 6 → 9 → 1 → 2/3/8 → 7 → 10 → 12/13.

## Parse layer and types (`src/graphql/`)

Raw types mirror the schema's nullability exactly; domain types are what the UI consumes. Parsing happens once, inside the two hooks in `queries.ts`, so no screen or component sees raw data.

```ts
// types.ts — raw (what the wire can carry)
interface RawAuthor {
  id: string;
  displayName: string;
}
interface RawImage {
  id: string;
  url: string;
  width: number;
  height: number;
  altText: string | null;
}
interface RawArticleSummary {
  id: string;
  title: string;
  dek: string | null;
  url: string;
  datePublished: string; // String! — but the fixture proves it can hold "1709251200"
  authors: RawAuthor[] | null; // [Author!] is a nullable list
  thumbnailImage: RawImage | null;
}
interface RawArticle extends RawArticleSummary {
  heroImage: RawImage | null;
  body: string;
  wordCount: number | null;
}
interface RawLatestArticlesData {
  latestArticles: { edges: { node: RawArticleSummary }[] };
}
interface RawArticleData {
  article: RawArticle | null;
}

// types.ts — domain (what screens and components see)
interface Author {
  id: string;
  displayName: string;
}
interface Image {
  id: string;
  url: string;
  width: number;
  height: number;
  altText: string | null;
}
interface ArticleSummary {
  // feed rows, expanded card, bookmarks
  id: string;
  title: string;
  dek: string | null;
  url: string;
  datePublished: number | null; // epoch milliseconds, see Deviation 1
  authors: Author[]; // never null
  thumbnailImage: Image | null;
}
interface Article extends ArticleSummary {
  heroImage: Image | null;
  body: string;
  wordCount: number | null;
}
```

`parse.ts` (all unit-tested in `parse.test.ts`):

- `parseDate(value: unknown): Date | null` — accepts a valid `Date`, an ISO string, a finite number, and a digit-only string. Digit-only values of 10 or fewer digits are epoch **seconds** (the fixture's `"1709251200"`), longer ones are milliseconds. Anything else, or an invalid result, is `null`. The comment in the code explains the digit rule because a real server could send any of these shapes.
- `parseAuthors(value: unknown): Author[]` — array of `{id, displayName}` strings, else `[]`.
- `parseImage(value: unknown): Image | null` — needs a string `url`, else `null`.
- `parseWordCount(value: unknown): number | null` — finite number, else `null`.
- `parseArticleSummary(raw: RawArticleSummary): ArticleSummary` and `parseArticle(raw: RawArticle): Article` — compose the above; `datePublished` is `parseDate(raw.datePublished)?.getTime() ?? null`.

`queries.ts` keeps the urql tuple shape but returns parsed data:

```ts
useLatestArticles(first = 10) → [{articles: ArticleSummary[] | undefined, fetching, error}, reexecuteQuery]
useArticle(id)                → [{article: Article | null | undefined, fetching, error}, reexecuteQuery]
```

`undefined` means no data yet; `null` from `useArticle` means not found. Parsing is memoised on `result.data`.

`src/utils/formatDate.ts`: `formatDate(timestamp: number | null): string | null` — `en-US`, long month, numeric day and year (the format already in use); `null` in, `null` out, so a bad date renders nothing. Shared by the list item, the detail screen and the bookmarks screen. Unit-tested with both fixture values and `null`.

**Deviation 1 — the domain date is epoch milliseconds, not `Date`.** The bookmarks slice stores the article summary, and Redux state (RTK's serializable-check middleware is on in `store.ts`) and redux-persist both require JSON-serializable values; a `Date` would warn on dispatch and come back from AsyncStorage as a string. A number round-trips unchanged, so one `ArticleSummary` type flows from the parse layer into the store and the Bookmarks screen with no conversion. `parseDate` still returns `Date | null` as specified; the parse layer takes `.getTime()`. Components still never call `new Date`; only `formatDate` does.

**Test recipe for screens:** `jest.mock('../graphql/queries')` and return `[{articles, fetching, error}, jest.fn()]` (or `article`). No urql client, no navigator: pass a `navigation` stub with `navigate: jest.fn()` and `setOptions: jest.fn()`.

## Bookmarks (Session 2)

`src/store/bookmarks.slice.ts`:

```ts
interface BookmarksState { items: ArticleSummary[] }   // newest first
reducers: addBookmark(summary), removeBookmark(id), toggleBookmark(summary)
selectors: selectBookmarks(state) → state.bookmarks.items (stable reference)
           selectIsBookmarked(state, id) → boolean
```

Unit tests: add, add twice is a no-op, remove, toggle on/off, selectors.

`store.ts`: register the reducer; `persistConfig` gains `whitelist: ['bookmarks']` and `version: 1` (no migrate needed: nothing persisted so far is kept). The dev session tokens stop being written to AsyncStorage; `NOTES.md` explains the tradeoff (a real app would keep tokens in the keychain). A store test asserts the persisted state excludes `session`. Note: redux-persist applies the whitelist only when writing (`createPersistoid`), not on rehydrate, so a simulator that already holds `persist:root` merges its old `session` copy once more on the first launch after the change and drops it on the next write; the values are identical to the initial state, so nothing to migrate.

`src/store/hooks.ts`: `useAppDispatch` and `useAppSelector`, the standard RTK typed hooks (two lines; the only reason is types).

`src/components/BookmarkButton.tsx`: takes `article: ArticleSummary`; reads `selectIsBookmarked` itself and dispatches `toggleBookmark`. Because the button subscribes to the store on its own, the `React.memo` row around it does not need an `isBookmarked` prop to update. Glyph: text `☆` / `★` in `colors.accent` (no icon library — no new dependency), `accessibilityRole="button"`, `accessibilityLabel` "Save article" / "Remove bookmark", `accessibilityState={{selected}}`, hit slop for the small target. Test: render with a real store → press toggles the label and the state.

Placement: the empty right-hand slot of `ArticleListItem`'s footer and `ExpandedArticleCard`'s footer (both are already `justifyContent: 'space-between'`), and the detail header via `navigation.setOptions({headerRight})` once the article has loaded (the route only carries `id` and `title`).

`src/screens/Bookmarks.screen.tsx`: `FlatList` of `ArticleListItem` over `selectBookmarks`, tapping navigates to `ArticleDetail`, the row's own button removes; `EmptyState` (`src/components/EmptyState.tsx`, title + message) when empty. Test: both states with a store.

`AppNavigator.tsx`: `BookmarkedArticles` screen titled "Bookmarks"; the feed's `headerRight` is a text button "Bookmarks" that navigates there.

Commits: `feat(store): add a persisted bookmarks slice` (slice + tests + whitelist + typed hooks) → `feat(bookmarks): add the bookmark button to the feed and the detail` → `feat(bookmarks): add the bookmarks screen` (screen, empty state, navigation, tests).

## Share (Session 3)

`src/utils/shareArticle.ts`:

```ts
shareArticle({title, url}): Promise<'shared' | 'dismissed' | 'failed'>
// iOS:     Share.share({title, url, message: title})          — url is honoured only on iOS
// Android: Share.share({title, message: `${title}\n${url}`})  — Android reads only message
// Platform.select picks the payload; dismissedAction → 'dismissed'; a rejection → 'failed' (never throws)
```

`src/components/ShareButton.tsx`: text glyph "Share" next to the bookmark toggle in the detail header; on `'failed'` shows `Alert.alert('Could not share', 'Please try again.')` — a one-tap message; the screen stays usable. Test: mock `Share.share` for resolved `sharedAction`, resolved `dismissedAction` (no alert) and a rejection (alert called, no throw); test the payload per platform by mocking `Platform.OS`.

Commit: `feat(detail): share the article title and url from the header`. (done, `f06564d`). **Deviation 5:** branches on `Platform.OS`, not `Platform.select` (untestable under Jest); see `docs/AGENTS.md`.

## Polish, ranked (Session 3, each its own commit with a test, stop when the budget is spent)

1. **Friendlier errors with retry everywhere** — `ErrorView` gets copy that does not expose `[GraphQL] Internal Server Error`; the feed and the detail map `error` to "We couldn't load …"; "Article not found" has a retry too. Test: feed with a mocked error → friendly copy, retry calls `reexecuteQuery`. `feat(ui): show friendly error copy with retry`.
2. **Persisted copy of the last good feed** — a `feed` slice (`{articles: ArticleSummary[], updatedAt: number | null}`) written whenever the query succeeds, whitelisted, and used behind a banner ("Showing saved articles") when a refresh fails or data is missing after relaunch. Test: feed with error + cached articles renders the list and the banner. `feat(feed): keep the last good feed for offline use`.
3. **Client-side timeout on the article query** — a 10 s timer in the detail screen that flips to the error view with retry while `fetching` is still true. Test with fake timers. `feat(detail): time out a stalled article request`.
4. **Skeleton rows while the feed loads** — a `FeedSkeleton` of grey blocks instead of the spinner. `feat(feed): show skeleton rows while loading`.
5. **Image fallbacks** — `onError` swaps in the surface colour box. `feat(ui): fall back when an image fails to load`.

Session 3 outcome: 1 `e57c62e`, 2 `d059619` (+ `da5ac19`: `updatedAt` drives the "Updated" label; persist version 2 with a migrate that drops an older feed — **Deviation 6**), 3 `a79438b` (+ `88e8141`), 5 `52bcd2e` narrowed to the expanded card (list and detail images already sit on a `surface` box; the card's image started at opacity 0 and stayed transparent on error). 4 skipped: the saved feed now shows while a relaunch loads, so the spinner appears only on a first-ever launch.

## Test layout and tooling (decided in Session 0)

- Co-located `*.test.ts(x)` next to the code under `src/`; `__tests__/App.test.tsx` is the smoke test: it renders the real `App` with RNTL and waits for the first article title, which proves the store, the navigator, the feed screen and the mock API work together (RNTL's auto-cleanup unmounts it).
- Jest config: `transformIgnorePatterns` extended with `@react-navigation` (ESM `lib/module`), `react-native-safe-area-context` (its shipped Jest mock is TSX), and `react-redux`, `immer`, `nanoid` (their `react-native` export condition points at ESM). Redux Toolkit's condition resolves to CommonJS and AsyncStorage is factory-mocked, so neither needs an entry. `jest.setup.js` mocks `react-native-safe-area-context` with `react-native-safe-area-context/jest/mock` (its `.default`; without it `SafeAreaProvider` renders `null` under Jest) and AsyncStorage v3 in memory. `fakeTimers: {enableGlobally: true}` because redux-persist starts a real 5 s timer at import; `findBy*`/`waitFor` advance fake timers automatically. Caveats: `setImmediate`/`nextTick` are faked too, so never `await new Promise(setImmediate)`; redux-persist writes on a faked interval, so persistence assertions need `jest.runOnlyPendingTimers()` inside `act`; the AsyncStorage mock's store is shared within a test file, so call `AsyncStorage.clear()` in `beforeEach` where it matters.
- `store.ts` is a singleton. Session 2 added `makeStore()` (and keeps `export const store = makeStore()`) so slice and screen tests get a fresh store each; this is the RTK-documented pattern and the only reason is test isolation. **Deviation 4:** no `preloadedState` parameter — the persisted reducer's state type requires `_persist`, so tests dispatch `addBookmark` to seed a store. `src/test-utils.tsx` has `renderWithStore`.
- `@testing-library/react-native` **13.3.3** (not 14, which also requires the separate `test-renderer` package). `render`, `screen`, `fireEvent`, `renderHook`.
- Prettier note: the repo's `.prettierrc.js` does not set `bracketSpacing: false`, but the sources were written that way, so every touched file gains `{ a }` spacing in the pre-commit hook. Accept it; do not reformat untouched files and do not edit `.prettierrc.js`.

## Per-session file list

| Session | Files                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | `src/graphql/types.ts`, `src/graphql/parse.ts` (+test), `src/graphql/queries.ts`, `src/utils/formatDate.ts` (+test), `src/api/resolvers/articles.resolver.ts` (+test), `src/api/config.ts`, `src/hooks/useRefreshControl.ts` (+test), `src/components/ArticleListItem.tsx` (+test), `src/components/ExpandedArticleCard.tsx`, `src/screens/ArticleFeed.screen.tsx` (+test), `src/screens/ArticleDetail.screen.tsx` (+test), `src/navigation/AppNavigator.tsx` |
| 2       | `src/store/bookmarks.slice.ts` (+test), `src/store/store.ts` (+test), `src/store/hooks.ts`, `src/components/BookmarkButton.tsx` (+test), `src/components/EmptyState.tsx`, `src/screens/Bookmarks.screen.tsx` (+test), `src/components/ArticleListItem.tsx`, `src/components/ExpandedArticleCard.tsx`, `src/screens/ArticleDetail.screen.tsx`, `src/navigation/AppNavigator.tsx`                                                                               |
| 3       | `src/utils/shareArticle.ts` (+test), `src/components/ShareButton.tsx` (+test), `src/screens/ArticleDetail.screen.tsx`, then per polish item: `src/components/ErrorView.tsx`, `src/store/feed.slice.ts` (+test), `src/screens/ArticleFeed.screen.tsx`, `src/components/FeedSkeleton.tsx`                                                                                                                                                                       |
| 4       | `NOTES.md` only                                                                                                                                                                                                                                                                                                                                                                                                                                               |

## Gates (copied from the prompt so a session can check itself)

- **1:** `npx eslint .` 0 problems, `npx tsc --noEmit` clean, `npm test` green; on device the feed shows 10 articles with real dates, pull-to-refresh stops, article-4 opens with its date and its title in the header, `simulateServerError` shows the error view and retry recovers once it is flipped back.
- **2:** bookmark from the feed and the detail; kill and relaunch; bookmarks persist; remove from the Bookmarks screen; empty state appears.
- **3:** the share sheet opens with title and URL; cancel does nothing; a forced rejection shows the message and the screen stays usable; each polish item verified as its entry says.
- **4:** fresh clone in the scratchpad is green (`npm ci`, `npm test`, `npm run lint`); `git log --oneline` reads as small conventional commits.
