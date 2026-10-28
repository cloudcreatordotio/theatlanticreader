import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { CombinedError } from 'urql';
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

function renderFeed(
  result: object = { articles: [article], fetching: false, error: undefined },
  reexecuteQuery = jest.fn(),
) {
  (useLatestArticles as jest.Mock).mockReturnValue([result, reexecuteQuery]);
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

test('shows friendly copy and retries when the feed fails to load', () => {
  const reexecuteQuery = jest.fn();
  renderFeed(
    {
      articles: undefined,
      fetching: false,
      error: new CombinedError({
        graphQLErrors: ['Internal Server Error'],
      }),
    },
    reexecuteQuery,
  );

  expect(screen.getByText(/couldn't load the latest articles/)).toBeTruthy();
  expect(screen.queryByText(/GraphQL|Internal Server Error/)).toBeNull();

  fireEvent.press(screen.getByRole('button', { name: 'Try Again' }));
  expect(reexecuteQuery).toHaveBeenCalledWith({
    requestPolicy: 'network-only',
  });
});
