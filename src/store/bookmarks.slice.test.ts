import reducer, {
  addBookmark,
  removeBookmark,
  selectBookmarks,
  selectIsBookmarked,
  toggleBookmark,
} from './bookmarks.slice';
import type { Article, ArticleSummary } from '../graphql/types';

function summary(id: string): ArticleSummary {
  return {
    id,
    title: `Title ${id}`,
    dek: null,
    url: `https://example.com/${id}`,
    datePublished: Date.parse('2024-03-01T00:00:00Z'),
    authors: [],
    thumbnailImage: null,
  };
}

const empty = reducer(undefined, { type: 'init' });

test('adds bookmarks newest first', () => {
  let state = reducer(empty, addBookmark(summary('a')));
  state = reducer(state, addBookmark(summary('b')));
  expect(state.items.map(item => item.id)).toEqual(['b', 'a']);
});

test('adding the same article twice keeps one copy', () => {
  let state = reducer(empty, addBookmark(summary('a')));
  state = reducer(state, addBookmark(summary('a')));
  expect(state.items).toHaveLength(1);
});

test('removes a bookmark by id', () => {
  let state = reducer(empty, addBookmark(summary('a')));
  state = reducer(state, addBookmark(summary('b')));
  state = reducer(state, removeBookmark('a'));
  expect(state.items.map(item => item.id)).toEqual(['b']);
});

test('toggles a bookmark on and off', () => {
  let state = reducer(empty, toggleBookmark(summary('a')));
  expect(state.items.map(item => item.id)).toEqual(['a']);
  state = reducer(state, toggleBookmark(summary('a')));
  expect(state.items).toEqual([]);
});

test('stores only the summary fields of a full article', () => {
  const article: Article = {
    ...summary('a'),
    heroImage: null,
    body: 'A long body',
    wordCount: 3,
  };
  const state = reducer(empty, toggleBookmark(article));
  expect(state.items[0]).toEqual(summary('a'));
});

test('selectors read the list and membership', () => {
  const bookmarks = reducer(empty, addBookmark(summary('a')));
  const state = { bookmarks };
  expect(selectBookmarks(state)).toBe(bookmarks.items);
  expect(selectIsBookmarked(state, 'a')).toBe(true);
  expect(selectIsBookmarked(state, 'b')).toBe(false);
});
