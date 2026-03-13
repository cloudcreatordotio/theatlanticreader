import {gql, useQuery} from 'urql';
import type {LatestArticlesData, ArticleData} from './types';

const LATEST_ARTICLES_QUERY = gql`
  query LatestArticles($first: Int!) {
    latestArticles(first: $first) {
      edges {
        node {
          id
          title
          dek
          url
          datePublished
          authors {
            id
            displayName
          }
          thumbnailImage {
            id
            url
            width
            height
            altText
          }
        }
      }
    }
  }
`;

const ARTICLE_QUERY = gql`
  query Article($id: ID!) {
    article(id: $id) {
      id
      title
      dek
      url
      datePublished
      authors {
        id
        displayName
      }
      heroImage {
        id
        url
        width
        height
        altText
      }
      body
      wordCount
    }
  }
`;

export function useLatestArticles(first: number = 10) {
  return useQuery<LatestArticlesData>({
    query: LATEST_ARTICLES_QUERY,
    variables: {first},
  });
}

export function useArticle(id: string) {
  return useQuery<ArticleData>({
    query: ARTICLE_QUERY,
    variables: {id},
  });
}
