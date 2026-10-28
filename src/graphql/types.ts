// Domain types: what screens and components see, produced by parse.ts.

export interface Image {
  id: string;
  url: string;
  width: number;
  height: number;
  altText: string | null;
}

export interface Author {
  id: string;
  displayName: string;
}

export interface ArticleSummary {
  id: string;
  title: string;
  dek: string | null;
  url: string;
  // Epoch milliseconds (serializable, so it can live in the Redux store);
  // null when the API sent something that is not a date.
  datePublished: number | null;
  authors: Author[];
  thumbnailImage: Image | null;
}

export interface Article extends ArticleSummary {
  heroImage: Image | null;
  body: string;
  wordCount: number | null;
}

// Raw types: what the schema allows on the wire.

export interface RawArticleSummary {
  id: string;
  title: string;
  dek: string | null;
  url: string;
  // String! in the schema, but it can hold epoch seconds ("1709251200").
  datePublished: string;
  // [Author!] is a nullable list.
  authors: Author[] | null;
  thumbnailImage: Image | null;
}

export interface RawArticle extends RawArticleSummary {
  heroImage: Image | null;
  body: string;
  wordCount: number | null;
}

export interface RawLatestArticlesData {
  latestArticles: {
    edges: { node: RawArticleSummary }[];
  };
}

export interface RawArticleData {
  article: RawArticle | null;
}
