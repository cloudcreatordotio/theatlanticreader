module.exports = {
  preset: 'react-native',
  // The preset only transforms react-native itself; these packages resolve to
  // untranspiled ESM under Jest, so they must go through Babel too.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-async-storage|@react-navigation|react-redux|@reduxjs/toolkit|immer|nanoid)/)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  // redux-persist's rehydrate timeout and the mock API's latency are real
  // timers that otherwise keep Jest alive for seconds after every run.
  fakeTimers: { enableGlobally: true },
};
