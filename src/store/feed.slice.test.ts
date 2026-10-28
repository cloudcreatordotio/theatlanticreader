import reducer, {
  feedLoaded,
  selectFeedUpdatedAt,
  selectSavedFeed,
} from './feed.slice';
import type { ArticleSummary } from '../graphql/types';

function summary(id: string): ArticleSummary {
  return {
    id,
    title: `Title ${id}`,
    dek: null,
    url: `https://example.com/${id}`,
    datePublished: null,
    authors: [],
    thumbnailImage: null,
  };
}

test('starts empty and keeps only the latest feed with its time', () => {
  let state = reducer(undefined, { type: 'init' });
  expect(selectSavedFeed({ feed: state })).toEqual([]);
  expect(selectFeedUpdatedAt({ feed: state })).toBeNull();

  state = reducer(
    state,
    feedLoaded({ articles: [summary('a'), summary('b')], updatedAt: 1 }),
  );
  state = reducer(
    state,
    feedLoaded({ articles: [summary('c')], updatedAt: 2 }),
  );
  expect(selectSavedFeed({ feed: state }).map(item => item.id)).toEqual(['c']);
  expect(selectFeedUpdatedAt({ feed: state })).toBe(2);
});
