import React from 'react';
import { screen } from '@testing-library/react-native';
import { ArticleFeedScreen } from './ArticleFeed.screen';
import { useLatestArticles } from '../graphql/queries';
import type { ArticleSummary } from '../graphql/types';
import { renderWithStore } from '../test-utils';

jest.mock('../graphql/queries', () => ({
  useLatestArticles: jest.fn(),
}));

const article: ArticleSummary = {
  id: 'article-1',
  title: 'First article',
  dek: null,
  url: 'https://example.com/1',
  datePublished: Date.parse('2024-03-01T12:00:00Z'),
  authors: [],
  thumbnailImage: null,
};

function renderFeed() {
  (useLatestArticles as jest.Mock).mockReturnValue([
    { articles: [article], fetching: false, error: undefined },
    jest.fn(),
  ]);
  const props = {
    navigation: { navigate: jest.fn(), setOptions: jest.fn() },
    route: { key: 'ArticleFeed', name: 'ArticleFeed' },
  } as any;
  return renderWithStore(<ArticleFeedScreen {...props} />);
}

test('clears the refresh-label interval on unmount', () => {
  const { unmount } = renderFeed();
  expect(screen.getByText('First article')).toBeTruthy();

  unmount();
  // Unmounting the list schedules a one-shot timer of its own; run it so a
  // leaked interval is the only thing that could still be pending.
  jest.runOnlyPendingTimers();

  expect(jest.getTimerCount()).toBe(0);
});
