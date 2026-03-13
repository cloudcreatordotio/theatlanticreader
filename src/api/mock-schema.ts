export const typeDefs = `
  type Query {
    latestArticles(first: Int!): ArticleConnection!
    article(id: ID!): Article
  }

  type ArticleConnection {
    edges: [ArticleEdge!]!
  }

  type ArticleEdge {
    node: Article!
  }

  type Article {
    id: ID!
    title: String!
    dek: String
    url: String!
    datePublished: String!
    authors: [Author!]
    thumbnailImage: Image
    heroImage: Image
    body: String!
    wordCount: Int
  }

  type Author {
    id: ID!
    displayName: String!
  }

  type Image {
    id: ID!
    url: String!
    width: Int!
    height: Int!
    altText: String
  }
`;
