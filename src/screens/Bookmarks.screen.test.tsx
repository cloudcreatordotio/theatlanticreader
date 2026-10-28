import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { BookmarksScreen } from './Bookmarks.screen';
import { addBookmark } from '../store/bookmarks.slice';
import { makeStore } from '../store/store';
import { renderWithStore } from '../test-utils';
import type { ArticleSummary } from '../graphql/types';

const article: ArticleSummary = {
  id: 'article-1',
  title: 'First article',
  dek: null,
  url: 'https://example.com/1',
  datePublished: Date.parse('2024-03-01T12:00:00Z'),
  authors: [],
  thumbnailImage: null,
};

const navigation = { navigate: jest.fn(), setOptions: jest.fn() };

function renderBookmarks(saved: ArticleSummary[]) {
  const store = makeStore();
  saved.forEach(item => store.dispatch(addBookmark(item)));
  const props = {
    navigation,
    route: { key: 'BookmarkedArticles', name: 'BookmarkedArticles' },
  } as any;
  return renderWithStore(<BookmarksScreen {...props} />, store);
}

beforeEach(() => navigation.navigate.mockClear());

test('shows the empty state when nothing is saved', () => {
  renderBookmarks([]);
  expect(screen.getByText('No bookmarks yet')).toBeTruthy();
});

test('lists saved articles and opens one on tap', () => {
  renderBookmarks([article]);
  expect(screen.getByText('March 1, 2024')).toBeTruthy();

  fireEvent.press(screen.getByText('First article'));

  expect(navigation.navigate).toHaveBeenCalledWith('ArticleDetail', {
    id: 'article-1',
    title: 'First article',
  });
});

test('removing the last bookmark shows the empty state', () => {
  renderBookmarks([article]);

  fireEvent.press(screen.getByRole('button', { name: 'Remove bookmark' }));

  expect(screen.queryByText('First article')).toBeNull();
  expect(screen.getByText('No bookmarks yet')).toBeTruthy();
});
