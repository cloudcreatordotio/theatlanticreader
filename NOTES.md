# Notes — The Atlantic Reader

**_ Chat logs are located in the docs/chat-logs directory.
The prompt.md (see docs/prompts/prompt.md) was written between 10:45 and 11:41 -- see git log.
This take-home was completed over five sessions. Fable 5.1 was used for the planning session. Subsequent sessions used Opus 5.5.
The AGENTS.md located at docs/AGENTS.md should have been named SESSION.md per its function. The AGENTS.md in the project root is the orthodox AGENTS.md. _**

## Approach

I worked in short sessions: first an audit that reproduced each defect and made Jest run, then Part 1, Part 2A, Part 2B and polish, each landed, tested and committed before the next one started. Every fix was reproduced first (on the Android emulator, or by a test that failed against the unchanged code) and ships with its test in the same commit. After each session an independent review of the diff looked for regressions; the fixes it prompted are separate commits, so `git log` shows them.

The one structural decision: the brief says the code outside `src/api/` must not change when the mock is swapped for a real server, and that the API data is not well-formed. So raw GraphQL results are parsed into domain types once, inside the two query hooks in `src/graphql/`, and screens and components only ever see well-formed data. No component calls `new Date(...)` or guards an API shape.

## Running it

```sh
nvm use && npm ci
npm test            # 16 suites, 59 tests, a few seconds
npm run lint        # 0 problems
npx tsc --noEmit    # clean
```

The app builds and runs on the iOS simulator (Xcode 27.1) and on the Android emulator, as in the README.

Tests are co-located (`*.test.ts(x)` next to the code); `__tests__/App.test.tsx` renders the real app and waits for the first article. The test runner did not start at all at the outset (ESM in `@react-navigation/*` and the `react-native` export condition of `react-redux`, `immer` and `nanoid`); `jest.config.js` and `jest.setup.js` fix that. Fake timers are on globally because redux-persist starts a real timer when the store is imported.

New dependency: `@testing-library/react-native` 13.3.3 (dev only) for component tests. Version 14 would also have needed the separate `test-renderer` package.

## Defects found and fixed

| #   | Defect                                                     | Cause                                                                                                                | Fix                                                                                                                       | Commit    |
| --- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1   | Feed showed 9 articles for `first: 10`                     | Resolver sliced `0, first - 1`                                                                                       | `slice(0, first)`                                                                                                         | `c50b8d0` |
| 2   | "Invalid Date" in the feed and the detail                  | Two articles send epoch seconds; the `String!` field serializes them as `"1709251200"`, which `new Date` cannot read | `parseDate` at the query boundary accepts ISO, numbers and digit strings (10 digits or fewer = seconds); one `formatDate` | `555d445` |
| 3   | Crash on `authors: null` (article-13)                      | Schema allows a null list (`[Author!]`); the type said `Author[]`                                                    | Parse layer returns `[]`; raw and domain types now say what the data does                                                 | `555d445` |
| 4   | Pull-to-refresh spinner never stopped                      | Reset effect had `[]` deps                                                                                           | Reset when `fetching` turns false                                                                                         | `58dfed9` |
| 5   | Interval leak in the feed                                  | New `setInterval` per change, never cleared                                                                          | Clear in the effect cleanup                                                                                               | `37e2659` |
| 6   | `AppState` listener leak + `console.log`                   | Subscription never removed                                                                                           | `subscription.remove()` on unmount; log removed                                                                           | `8137cd4` |
| 7   | Detail header showed "article-4"                           | `headerTitle: route.params.id`                                                                                       | Use the route's `title`                                                                                                   | `afcab30` |
| 8   | `wordCount: 0` would render a bare `0` outside `<Text>`    | `{wordCount && ...}`                                                                                                 | Render when it is a number                                                                                                | `555d445` |
| 9   | Inline style object on every list row                      | Spread into a new object each render (also defeats `React.memo`)                                                     | Style array with a stylesheet entry                                                                                       | `1bcfb3d` |
| 10  | Live-looking analytics key in source, logged at import     | Dead config, imported nowhere                                                                                        | Removed                                                                                                                   | `d9908b0` |
| 11  | Dev session tokens persisted to AsyncStorage in plain text | Persist config had no whitelist                                                                                      | `whitelist: ['bookmarks', 'feed']`                                                                                        | `e186127` |
| 12  | Reading position never restored                            | Restore ran on mount while the loading view showed, so the scroll ref was null                                       | Restore once the article has rendered; storage errors ignored                                                             | `51af627` |
| 13  | Image fade on the JS thread                                | `useNativeDriver: false` for an opacity animation                                                                    | Native driver                                                                                                             | `693f6ef` |

Defects 2, 3 and 8 share one commit on purpose: they are one fix, the parse layer. The date fix was then refined to format in UTC (`a209d68`): the epoch dates are midnight UTC, so in a US time zone article-4 showed February 29 instead of March 1.

The removed analytics key is still in git history. A real key in that position should be treated as leaked and rotated, and a real analytics client would read its key from build configuration.

## Features

**Bookmarks (Part 2A).** A `bookmarks` slice (`createSlice`: add, remove, toggle, selectors) stores the article summary, not just the id, so the Bookmarks screen renders offline without a query. A `BookmarkButton` reads its own state from the store, so the memoised list rows update without a new prop; it sits on the expanded card, every list row and the detail header. The Bookmarks screen (`BookmarkedArticles`, the route name already declared) is reached from a feed header button, lists newest first, removes from the row's own star, and shows an empty state. Persisted through the existing redux-persist setup (`e186127`, `be5ecb5`, `b408de4`).

**Share (Part 2B).** `shareArticle` sends a platform-specific payload: iOS `{title, url, message: title}`; Android `{title, message: "title\nurl"}`, because Android ignores `url`. Cancelling is silent; a rejected promise resolves to `'failed'` (it never throws), and the `ShareButton` in the detail header then shows a short "Could not share" alert (`f06564d`).

On iOS the share sheet's preview (image, headline, domain) comes from the shared page's own Open Graph tags, not from the app; the fixture URLs all point at example.com, which has neither, so the sheet shows a placeholder icon and "example.com". Real article URLs would preview fully with no code change; building the preview in the app (`LPLinkMetadata`) would need a native module or a new dependency.

## Polish (Part 3)

In the order I ranked them:

1. **Friendly errors with retry** on the feed, the detail and "Article not found", instead of `[GraphQL] Internal Server Error` (`e57c62e`).
2. **Offline copy of the feed.** Every good load is saved; when there is no fresh data (a failed refresh, or a relaunch without a connection) the saved feed shows behind a "Couldn't refresh" banner instead of an error wall. The "Updated …" label counts from the last successful load (`d059619`, `da5ac19`). urql drops `data` when a refetch fails and keeps nothing across launches, which is why this needed a persisted copy.
3. **Client-side timeout** on the article request: after 10 s the detail shows the error view with retry instead of spinning for the mock's 30 s stall; each retry gets its own 10 s (`a79438b`, `88e8141`).
4. _Skipped:_ skeleton rows while the feed loads. With the saved feed shown during a relaunch, the spinner appears only on the first launch ever.
5. **Image fallback** on the expanded card: its image fades in from transparent, so on a load error it now fades in anyway and the grey surface box shows (`52bcd2e`). List and detail images already sat on a surface box.

Also: the detail back button shows only the chevron, so an article opened from Bookmarks does not read "Bookmarks" (`7c7fcb2`).

## Design choices and tradeoffs

- **The domain date is epoch milliseconds (`number | null`), not `Date`.** The same summary goes into Redux and redux-persist, which need serializable values; a `Date` would warn on dispatch and come back from storage as a string. `parseDate` returns a `Date`; the parse layer stores `.getTime()`. Only `formatDate` turns it back into text.
- **Dates format in UTC**, so the publication's calendar day is the same for every reader.
- **Share branches on `Platform.OS`, not `Platform.select`.** Under Jest `Platform.select` always takes the iOS branch, so the Android payload would be untestable.
- **Persist `version: 2` with a migration** that drops a saved feed from version 1. The feed slice gained `updatedAt` after it was first written, and redux-persist sets each stored key wholesale, so an old copy crashed the feed on a device that already had one. The feed is only a cache, so it is dropped, not converted.
- **Session tokens are no longer persisted.** That removes plain-text tokens from AsyncStorage, but a real app would now log out on every restart until tokens move to the Keychain/Keystore. redux-persist applies the whitelist only when writing, so a device with an older saved state restores the tokens once more and drops them on the next write (harmless with the dev values).
- **The `AppState` listener stays** with an empty background branch as the place a future analytics client would report from; the fix is that it is now removed on unmount.
- `makeStore()` exists only so each test gets a fresh store; tests seed it by dispatching, because a partial `preloadedState` does not type-check against the persisted reducer.

## Known gaps and what I would do next

- **VoiceOver cannot reach the in-row bookmark star on iOS.** The row is a `TouchableOpacity`, which groups its children into one element on iOS (TalkBack on Android does reach the star). VoiceOver users can still bookmark from the detail header. Fix: an `accessibilityActions` "Bookmark" action on the row and the card, or move the star out of the touchable.
- Opening a bookmark offline shows the detail's error view: the article body is not stored. Next step would be caching the body when a bookmark is added.
- Removing a bookmark has no undo.
- The "Couldn't refresh" banner is text, not a button, so retry needs pull-to-refresh, which is awkward for screen-reader users.
- A successful but empty feed overwrites the saved copy.
- Rehydrated bookmarks and feed are trusted rather than re-parsed; the version 2 migration covers the one shape change so far.
- The feed request has no stall timeout (only the article has one; `simulateTimeout` only stalls the article).
- No in-flight guard on Share; a double tap while the iOS sheet is opening is unverified. Android never reports `dismissedAction`, so a cancel there counts as shared.
- The share failure message is an `Alert` (one tap to dismiss); a toast would be lighter.

## Verification

- Every new test was run against the unchanged code first and failed; for several fixes the review also reverted the fix and confirmed a test fails.
- On the Android emulator (driven over adb): 10 articles with real dates, article-4 "March 1, 2024" with its title in the header, pull-to-refresh stops, `simulateServerError` shows the friendly error and Try Again recovers, bookmarks survive a force-stop and relaunch and the empty state appears after removing the last one, the share sheet opens with title and URL, a forced share failure shows the alert, `simulateTimeout` ends in the retry view at 10 s, a broken card image shows the grey box.
- On the iOS simulator: the feed renders with dates and stars; the share sheet opens with the article link; the detail opened from Bookmarks shows only the chevron. Gestures there were checked by hand, since the simulator cannot be scripted on this machine.

## Process notes

- Commits are conventional and atomic, each with its test; fixes found in review are separate commits rather than rewritten history.
- The pre-commit hook runs Prettier on every staged file, and the repo's sources were written without bracket spacing while the Prettier config adds it, so touched files carry `{ a }` formatting noise in their diffs. `e57c62e` includes a formatting-only change to `ErrorView.tsx` for that reason.
