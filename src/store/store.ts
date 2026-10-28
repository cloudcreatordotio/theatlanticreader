import { combineReducers, configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createMigrate,
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  type PersistedState,
} from 'redux-persist';
import appReducer from './app.slice';
import sessionReducer from './session.slice';
import bookmarksReducer from './bookmarks.slice';
import feedReducer from './feed.slice';

const migrations = {
  // Version 2 added `updatedAt` to the saved feed. The feed is only a cache,
  // so an older copy is dropped rather than converted.
  2: (state: PersistedState) => {
    const migrated: Record<string, unknown> = { ...state };
    delete migrated.feed;
    return migrated as PersistedState;
  },
};

const persistConfig = {
  key: 'root',
  version: 2,
  storage: AsyncStorage,
  migrate: createMigrate(migrations),
  // Only user data and the offline copy of the feed are written to disk; the
  // session tokens stay in memory rather than in plain-text AsyncStorage.
  whitelist: ['bookmarks', 'feed'],
};

const rootReducer = combineReducers({
  app: appReducer,
  session: sessionReducer,
  bookmarks: bookmarksReducer,
  feed: feedReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// A factory so tests can build a fresh store; the app uses the one below.
export function makeStore() {
  return configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
}

export const store = makeStore();

export const persistor = persistStore(store);

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
