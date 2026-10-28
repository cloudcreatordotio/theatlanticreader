import React from 'react';
import { AppState } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { ArticleDetailScreen } from './ArticleDetail.screen';
import { useArticle } from '../graphql/queries';

jest.mock('../graphql/queries', () => ({
  useArticle: jest.fn(),
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
  body: 'Body text',
  wordCount: 1200,
};

function renderDetail() {
  (useArticle as jest.Mock).mockReturnValue([
    { data: { article }, fetching: false, error: undefined },
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
