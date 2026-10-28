import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ArticleFeedScreen } from './ArticleFeed.screen';
import { useLatestArticles } from '../graphql/queries';

jest.mock('../graphql/queries', () => ({
  useLatestArticles: jest.fn(),
}));

const article = {
  id: 'article-1',
  title: 'First article',
  dek: null,
  url: 'https://example.com/1',
  datePublished: '2024-03-01T12:00:00Z',
  authors: [],
  thumbnailImage: null,
  heroImage: null,
  body: '',
  wordCount: null,
};

function renderFeed() {
  (useLatestArticles as jest.Mock).mockReturnValue([
    {
      data: { latestArticles: { edges: [{ node: article }] } },
      fetching: false,
      error: undefined,
    },
    jest.fn(),
  ]);
  const props = {
    navigation: { navigate: jest.fn(), setOptions: jest.fn() },
    route: { key: 'ArticleFeed', name: 'ArticleFeed' },
  } as any;
  return render(<ArticleFeedScreen {...props} />);
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
