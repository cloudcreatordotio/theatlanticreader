/* eslint-env jest */
// SafeAreaProvider renders nothing until native insets arrive, which never
// happens under Jest; the package ships a mock that supplies them.
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

// AsyncStorage v3 no longer ships a Jest mock, so provide a small in-memory one.
jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  const mock = {
    getItem: jest.fn(key => Promise.resolve(store[key] ?? null)),
    setItem: jest.fn((key, value) => {
      store[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve(Object.keys(store))),
    multiGet: jest.fn(keys =>
      Promise.resolve(keys.map(key => [key, store[key] ?? null])),
    ),
    multiSet: jest.fn(pairs => {
      pairs.forEach(([key, value]) => {
        store[key] = value;
      });
      return Promise.resolve();
    }),
    multiRemove: jest.fn(keys => {
      keys.forEach(key => {
        delete store[key];
      });
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      store = {};
      return Promise.resolve();
    }),
  };
  return { __esModule: true, default: mock };
});
