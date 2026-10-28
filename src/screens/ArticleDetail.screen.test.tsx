import React from 'react';
import { AppState, ScrollView } from 'react-native';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { CombinedError } from 'urql';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArticleDetailScreen } from './ArticleDetail.screen';
import { useArticle } from '../graphql/queries';
import type { Article } from '../graphql/types';
import { selectBookmarks } from '../store/bookmarks.slice';
import { renderWithStore } from '../test-utils';

jest.mock('../graphql/queries', () => ({
  useArticle: jest.fn(),
}));

const article: Article = {
  id: 'article-1',
  title: 'First article',
  dek: null,
  url: 'https://example.com/1',
  datePublished: Date.parse('2024-03-01T12:00:00Z'),
  authors: [],
  thumbnailImage: null,
  heroImage: null,
  body: 'Body text',
  wordCount: 1200,
};

const props = {
  navigation: { navigate: jest.fn(), setOptions: jest.fn() },
  route: {
    key: 'ArticleDetail',
    name: 'ArticleDetail',
    params: { id: article.id, title: article.title },
  },
} as any;

function mockArticle(result: Partial<Article> | undefined) {
  (useArticle as jest.Mock).mockReturnValue([
    {
      article: result && { ...article, ...result },
      fetching: !result,
      error: undefined,
    },
    jest.fn(),
  ]);
}

function renderDetail(overrides: Partial<Article> = {}) {
  mockArticle(overrides);
  return render(<ArticleDetailScreen {...props} />);
}

beforeEach(() => {
  AsyncStorage.clear();
  props.navigation.setOptions.mockClear();
});
afterEach(() => jest.restoreAllMocks());

test('removes the app-state listener on unmount', () => {
  const remove = jest.fn();
  jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove });

  const { unmount } = renderDetail();
  expect(screen.getByText('First article')).toBeTruthy();
  expect(remove).not.toHaveBeenCalled();

  unmount();

  expect(remove).toHaveBeenCalledTimes(1);
});

test('renders the date and word count', () => {
  renderDetail();
  expect(screen.getByText('March 1, 2024')).toBeTruthy();
  expect(screen.getByText('1,200 words')).toBeTruthy();
});

test('renders a zero word count as text instead of crashing', () => {
  renderDetail({ wordCount: 0 });
  expect(screen.getByText('0 words')).toBeTruthy();
});

test('renders no word count or date when the API sent none', () => {
  renderDetail({ wordCount: null, datePublished: null });
  expect(screen.getByText('Body text')).toBeTruthy();
  expect(screen.queryByText(/words|Invalid Date|2024/)).toBeNull();
});

test('restores the reading position once the article has loaded', async () => {
  const scrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo');
  await AsyncStorage.setItem('reading-position-article-1', '640');

  mockArticle(undefined);
  const { rerender } = render(<ArticleDetailScreen {...props} />);
  // Storage answers while the loading view is still up, as on a device.
  await act(async () => {});
  mockArticle({});
  rerender(<ArticleDetailScreen {...props} />);

  await waitFor(() =>
    expect(scrollTo).toHaveBeenCalledWith({ y: 640, animated: false }),
  );
});

test('puts share and bookmark buttons in the header once the article has loaded', () => {
  mockArticle(undefined);
  const { rerender } = render(<ArticleDetailScreen {...props} />);
  expect(props.navigation.setOptions).not.toHaveBeenCalled();

  mockArticle({});
  rerender(<ArticleDetailScreen {...props} />);
  const { headerRight } = props.navigation.setOptions.mock.lastCall[0];
  screen.unmount();

  const { store } = renderWithStore(headerRight());
  expect(screen.getByRole('button', { name: 'Share' })).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Save article' }));
  expect(selectBookmarks(store.getState()).map(item => item.id)).toEqual([
    'article-1',
  ]);
});

test('shows friendly copy and retries when the article fails to load', () => {
  const reexecuteQuery = jest.fn();
  (useArticle as jest.Mock).mockReturnValue([
    {
      article: undefined,
      fetching: false,
      error: new CombinedError({ graphQLErrors: ['Internal Server Error'] }),
    },
    reexecuteQuery,
  ]);
  render(<ArticleDetailScreen {...props} />);

  expect(screen.getByText(/couldn't load this article/)).toBeTruthy();
  expect(screen.queryByText(/GraphQL|Internal Server Error/)).toBeNull();

  fireEvent.press(screen.getByRole('button', { name: 'Try Again' }));
  expect(reexecuteQuery).toHaveBeenCalledWith({
    requestPolicy: 'network-only',
  });
});

test('offers a retry when the article is not found', () => {
  const reexecuteQuery = jest.fn();
  (useArticle as jest.Mock).mockReturnValue([
    { article: null, fetching: false, error: undefined },
    reexecuteQuery,
  ]);
  render(<ArticleDetailScreen {...props} />);

  expect(screen.getByText(/isn't available/)).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Try Again' }));
  expect(reexecuteQuery).toHaveBeenCalledTimes(1);
});
