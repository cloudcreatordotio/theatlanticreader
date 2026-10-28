import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { BookmarkButton } from './BookmarkButton';
import { selectBookmarks } from '../store/bookmarks.slice';
import { renderWithStore } from '../test-utils';
import type { ArticleSummary } from '../graphql/types';

const article: ArticleSummary = {
  id: 'article-1',
  title: 'First article',
  dek: null,
  url: 'https://example.com/1',
  datePublished: null,
  authors: [],
  thumbnailImage: null,
};

test('toggles the bookmark in the store and its own label', () => {
  const { store } = renderWithStore(<BookmarkButton article={article} />);

  fireEvent.press(screen.getByRole('button', { name: 'Save article' }));
  expect(selectBookmarks(store.getState())).toEqual([article]);
  expect(
    screen.getByRole('button', { name: 'Remove bookmark', selected: true }),
  ).toBeTruthy();

  fireEvent.press(screen.getByRole('button', { name: 'Remove bookmark' }));
  expect(selectBookmarks(store.getState())).toEqual([]);
  expect(screen.getByRole('button', { name: 'Save article' })).toBeTruthy();
});
