import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore } from 'redux-persist';
import { makeStore } from './store';
import { addBookmark, selectBookmarks } from './bookmarks.slice';

beforeEach(() => AsyncStorage.clear());

test('persists the bookmarks but not the session tokens', async () => {
  const store = makeStore();
  persistStore(store);
  // Let the persistor rehydrate (an AsyncStorage read) before dispatching.
  await jest.runAllTimersAsync();

  store.dispatch(
    addBookmark({
      id: 'article-1',
      title: 'First article',
      dek: null,
      url: 'https://example.com/1',
      datePublished: null,
      authors: [],
      thumbnailImage: null,
    }),
  );
  // redux-persist writes on a timer.
  await jest.runAllTimersAsync();

  const stored = JSON.parse((await AsyncStorage.getItem('persist:root'))!);
  expect(Object.keys(stored).sort()).toEqual(['_persist', 'bookmarks']);
  expect(JSON.parse(stored.bookmarks).items[0].id).toBe('article-1');
});

test('restores saved bookmarks into a new store', async () => {
  await AsyncStorage.setItem(
    'persist:root',
    JSON.stringify({
      bookmarks: JSON.stringify({ items: [{ id: 'article-1' }] }),
      _persist: JSON.stringify({ version: 1, rehydrated: true }),
    }),
  );

  const store = makeStore();
  persistStore(store);
  await jest.runAllTimersAsync();

  expect(selectBookmarks(store.getState()).map(item => item.id)).toEqual([
    'article-1',
  ]);
});
