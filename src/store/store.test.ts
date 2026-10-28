import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore } from 'redux-persist';
import { makeStore } from './store';
import { addBookmark } from './bookmarks.slice';

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
