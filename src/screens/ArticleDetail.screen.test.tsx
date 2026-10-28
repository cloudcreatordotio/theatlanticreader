import React from 'react';
import { AppState } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { ArticleDetailScreen } from './ArticleDetail.screen';
import { useArticle } from '../graphql/queries';
import type { Article } from '../graphql/types';

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

function renderDetail(overrides: Partial<Article> = {}) {
  (useArticle as jest.Mock).mockReturnValue([
    {
      article: { ...article, ...overrides },
      fetching: false,
      error: undefined,
    },
    jest.fn(),
  ]);
  const props = {
    navigation: { navigate: jest.fn(), setOptions: jest.fn() },
    route: {
      key: 'ArticleDetail',
      name: 'ArticleDetail',
      params: { id: article.id, title: article.title },
    },
  } as any;
  return render(<ArticleDetailScreen {...props} />);
}

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
