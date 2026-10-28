import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { ArticleListItem } from './ArticleListItem';
import type { ArticleSummary } from '../graphql/types';
import { selectIsBookmarked } from '../store/bookmarks.slice';
import { renderWithStore } from '../test-utils';

const article: ArticleSummary = {
  id: 'article-1',
  title: 'First article',
  dek: null,
  url: 'https://example.com/1',
  datePublished: Date.parse('2024-03-01T12:00:00Z'),
  authors: [{ id: 'author-1', displayName: 'Ada Writer' }],
  thumbnailImage: {
    id: 'image-1',
    url: 'https://example.com/1.jpg',
    width: 90,
    height: 90,
    altText: null,
  },
};

function rowOpacity() {
  return StyleSheet.flatten(screen.root.props.style).opacity;
}

test('renders the row at full opacity when it has a thumbnail', () => {
  renderWithStore(<ArticleListItem article={article} onPress={jest.fn()} />);
  expect(screen.getByText('First article')).toBeTruthy();
  expect(screen.getByText('Ada Writer')).toBeTruthy();
  expect(screen.getByText('March 1, 2024')).toBeTruthy();
  expect(rowOpacity()).toBe(1);
});

test('dims the row slightly when it has no thumbnail', () => {
  renderWithStore(
    <ArticleListItem
      article={{ ...article, thumbnailImage: null }}
      onPress={jest.fn()}
    />,
  );
  expect(rowOpacity()).toBe(0.9);
});

test('renders no date and no byline when the API sent none', () => {
  renderWithStore(
    <ArticleListItem
      article={{ ...article, datePublished: null, authors: [] }}
      onPress={jest.fn()}
    />,
  );
  expect(screen.getByText('First article')).toBeTruthy();
  expect(screen.queryByText(/Invalid Date|2024/)).toBeNull();
  expect(screen.queryByText('Ada Writer')).toBeNull();
});

test('bookmarks from the button in the row', () => {
  const { store } = renderWithStore(
    <ArticleListItem article={article} onPress={jest.fn()} />,
  );

  fireEvent.press(screen.getByRole('button', { name: 'Save article' }));

  expect(selectIsBookmarked(store.getState(), 'article-1')).toBe(true);
  expect(screen.getByRole('button', { name: 'Remove bookmark' })).toBeTruthy();
});
