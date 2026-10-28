import reducer, { feedLoaded, selectSavedFeed } from './feed.slice';
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

test('starts empty and keeps only the latest feed', () => {
  let state = reducer(undefined, { type: 'init' });
  expect(selectSavedFeed({ feed: state })).toEqual([]);

  state = reducer(state, feedLoaded([summary('a'), summary('b')]));
  state = reducer(state, feedLoaded([summary('c')]));
  expect(selectSavedFeed({ feed: state }).map(item => item.id)).toEqual(['c']);
});
