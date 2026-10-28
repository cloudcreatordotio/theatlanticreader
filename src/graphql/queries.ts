import { useMemo } from 'react';
import { gql, useQuery } from 'urql';
import { parseArticle, parseArticleSummary } from './parse';
import type { RawArticleData, RawLatestArticlesData } from './types';

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
      thumbnailImage {
        id
        url
        width
        height
        altText
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

// Both hooks parse the raw result once, so screens only see domain types.
// `undefined` means no data yet; a `null` article means not found.

export function useLatestArticles(first: number = 10) {
  const [result, reexecuteQuery] = useQuery<RawLatestArticlesData>({
    query: LATEST_ARTICLES_QUERY,
    variables: { first },
  });
  const articles = useMemo(
    () =>
      result.data?.latestArticles.edges.map(edge =>
        parseArticleSummary(edge.node),
      ),
    [result.data],
  );
  const { fetching, error } = result;
  return [{ articles, fetching, error }, reexecuteQuery] as const;
}

export function useArticle(id: string) {
  const [result, reexecuteQuery] = useQuery<RawArticleData>({
    query: ARTICLE_QUERY,
    variables: { id },
  });
  const article = useMemo(() => {
    if (!result.data) {
      return undefined;
    }
    return result.data.article ? parseArticle(result.data.article) : null;
  }, [result.data]);
  const { fetching, error } = result;
  return [{ article, fetching, error }, reexecuteQuery] as const;
}
