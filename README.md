# The Atlantic Reader — Take-Home Exercise

## Overview

This is a simplified article reader app built with React Native CLI, URQL (GraphQL), Redux Toolkit, and React Navigation. It fetches articles from a mock GraphQL API and displays them in a feed.

The app has some bugs and missing features. Your task is to fix the bugs and implement the new features described below.

## Time Expectation

Please spend approximately **2–3 hours** on this exercise. We value quality over completeness — if you're running low on time, focus on doing fewer things well rather than rushing to finish everything.

Use of LLM tools (Copilot, Claude, ChatGPT, etc.) is permitted and expected. We will ask you to share your chat logs along with your submission and to make some live adjustments to the code during a follow-up interview.

## Setup

```bash
# Use Node v22 (see .nvmrc)
nvm use

# Install dependencies
npm install

# iOS
cd ios && bundle install && bundle exec pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

## Current State

The app has two screens:

- **Article Feed** — Displays a list of the latest articles
- **Article Detail** — Shows a single article's full content

## Tasks

### Part 1: Bug Fixes

The app has several bugs. Some are immediately visible, others are more subtle. Find and fix as many as you can. At minimum, the app should not crash during normal usage (scrolling the feed, tapping articles, pulling to refresh).

**Hint:** Pay attention to how data flows from the mock API through to the UI. Not all data coming from the API is well-formed.

### Part 2: Features

#### A. Bookmarks / Save Articles

- Users should be able to bookmark articles from the feed and from the article detail screen
- Bookmarks must persist across app restarts (use AsyncStorage via Redux Toolkit + redux-persist)
- Add a "Bookmarks" screen that shows all saved articles
- Include an empty state when no articles are bookmarked
- Users should be able to remove bookmarks

#### B. Share Articles

- Add a share button on the article detail screen
- Use the native share sheet (React Native's `Share` API)
- Share the article's title and URL
- Handle the case where sharing fails or is cancelled gracefully

### Part 3: Polish (if time permits)

- Error states and retry mechanisms
- Loading state improvements
- Offline resilience
- Anything else you think improves the user experience

## Architecture Notes

- The mock API layer (`src/api/`) uses an in-process GraphQL schema with URQL's execute exchange. In production, this would be swapped for `fetchExchange` pointing at a real server — the app code outside `src/api/` would not change.
- State management follows Redux Toolkit patterns with `createSlice`.
- Navigation uses React Navigation's native stack.
- The Redux store is pre-configured with `redux-persist` — you can add new slices and they will be persisted automatically once wired up.

## Development Standards

This project uses [conventional commits](https://www.conventionalcommits.org/). All commits must follow the format:

```
type(scope): description
```

Examples: `fix: resolve null authors crash`, `feat: add bookmark functionality`

Pre-commit hooks run automatically via Husky. They will:
- Lint staged files with ESLint (zero warnings policy)
- Format staged files with Prettier

## Evaluation Criteria

We're evaluating seven areas:

1. **Error handling & resilience** — How does the app handle failures and edge cases?
2. **Data parsing & type safety** — How do you handle imperfect data from the API?
3. **Loading states & UX** — Is the app pleasant to use during loading and transitions?
4. **Caching & offline** — Does data persist and behave well without connectivity?
5. **Architecture & code organization** — Do your solutions follow existing patterns and separate concerns cleanly?
6. **Commit quality & process** — Are commits atomic, well-messaged, and adherent to the project's conventions?
7. **Testing** — Did you add tests to verify your fixes and features?

## Submission

1. Initialize a git repo and commit your work with meaningful commit messages
2. Share your work as either:
   - A link to a GitHub repository (can be private — add us as collaborators)
   - A zip/tarball of the project **including the `.git` directory** (excluding `node_modules`)
3. Include your LLM chat logs
4. Optionally include a `NOTES.md` describing your approach, tradeoffs, and anything you'd do differently with more time
