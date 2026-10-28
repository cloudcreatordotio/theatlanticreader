import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { ExpandedArticleCard } from './ExpandedArticleCard';
import { selectIsBookmarked } from '../store/bookmarks.slice';
import { renderWithStore } from '../test-utils';
import type { ArticleSummary } from '../graphql/types';

const article: ArticleSummary = {
  id: 'article-1',
  title: 'First article',
  dek: 'A dek',
  url: 'https://example.com/1',
  datePublished: null,
  authors: [{ id: 'author-1', displayName: 'Ada Writer' }],
  thumbnailImage: null,
};

test('bookmarks from the button on the card', () => {
  const { store } = renderWithStore(
    <ExpandedArticleCard article={article} onPress={jest.fn()} />,
  );
  expect(screen.getByText('Ada Writer')).toBeTruthy();

  fireEvent.press(screen.getByRole('button', { name: 'Save article' }));

  expect(selectIsBookmarked(store.getState(), 'article-1')).toBe(true);
  expect(screen.getByRole('button', { name: 'Remove bookmark' })).toBeTruthy();
});
