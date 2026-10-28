import React from 'react';
import { Animated, Image } from 'react-native';
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

test('shows the image placeholder when the image fails to load', () => {
  renderWithStore(
    <ExpandedArticleCard
      article={{
        ...article,
        thumbnailImage: {
          id: 'image-1',
          url: 'https://example.com/missing.jpg',
          width: 800,
          height: 600,
          altText: null,
        },
      }}
      onPress={jest.fn()}
    />,
  );
  // The fade runs on the native driver, which never updates the JS-side
  // style under Jest, so assert that the fade-in starts.
  const timing = jest.spyOn(Animated, 'timing');

  fireEvent(screen.UNSAFE_getByType(Image), 'error', {
    nativeEvent: { error: 'not found' },
  });

  // The image box keeps its surface colour, so it reads as a placeholder.
  expect(timing).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ toValue: 1 }),
  );
  timing.mockRestore();
});
