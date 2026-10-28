import { combineReducers, configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import appReducer from './app.slice';
import sessionReducer from './session.slice';
import bookmarksReducer from './bookmarks.slice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  // Only user data is written to disk; the session tokens stay in memory
  // rather than in plain-text AsyncStorage.
  whitelist: ['bookmarks'],
};

const rootReducer = combineReducers({
  app: appReducer,
  session: sessionReducer,
  bookmarks: bookmarksReducer,
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
