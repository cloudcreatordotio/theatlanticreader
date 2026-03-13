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

export interface Article {
  id: string;
  title: string;
  dek: string | null;
  url: string;
  datePublished: string;
  authors: Author[];
  thumbnailImage: Image | null;
  heroImage: Image | null;
  body: string;
  wordCount: number | null;
}

export interface ArticleEdge {
  node: Article;
}

export interface ArticleConnection {
  edges: ArticleEdge[];
}

export interface LatestArticlesData {
  latestArticles: ArticleConnection;
}

export interface ArticleData {
  article: Article | null;
}
