import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { ArticleListItem } from './ArticleListItem';

const article = {
  id: 'article-1',
  title: 'First article',
  dek: null,
  url: 'https://example.com/1',
  datePublished: '2024-03-01T12:00:00Z',
  authors: [{ id: 'author-1', displayName: 'Ada Writer' }],
  thumbnailImage: {
    id: 'image-1',
    url: 'https://example.com/1.jpg',
    width: 90,
    height: 90,
    altText: null,
  },
  heroImage: null,
  body: '',
  wordCount: null,
};

function rowOpacity() {
  return StyleSheet.flatten(screen.root.props.style).opacity;
}

test('renders the row at full opacity when it has a thumbnail', () => {
  render(<ArticleListItem article={article} onPress={jest.fn()} />);
  expect(screen.getByText('First article')).toBeTruthy();
  expect(screen.getByText('Ada Writer')).toBeTruthy();
  expect(rowOpacity()).toBe(1);
});

test('dims the row slightly when it has no thumbnail', () => {
  render(
    <ArticleListItem
      article={{ ...article, thumbnailImage: null }}
      onPress={jest.fn()}
    />,
  );
  expect(rowOpacity()).toBe(0.9);
});
