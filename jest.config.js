module.exports = {
  preset: 'react-native',
  // The preset only transforms react-native itself; these packages resolve to
  // untranspiled ESM under Jest (react-navigation via lib/module, the safe-area
  // Jest mock as TSX, the others
  // through their "react-native" export condition), so Babel must see them.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-safe-area-context|react-redux|immer|nanoid)/)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  // redux-persist's rehydrate timeout and the mock API's latency are real
  // timers that otherwise keep Jest alive for seconds after every run.
  fakeTimers: { enableGlobally: true },
};
