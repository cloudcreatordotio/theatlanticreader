import {GraphQLError} from 'graphql';
import articlesData from '../data/articles.json';
import {apiConfig} from '../config';

const simulateLatency = (): Promise<void> =>
  new Promise(resolve => setTimeout(() => resolve(), apiConfig.latencyMs));

export const articleResolvers = {
  Query: {
    latestArticles: async (_: unknown, args: {first: number}) => {
      await simulateLatency();

      if (apiConfig.simulateServerError) {
        throw new GraphQLError('Internal Server Error', {
          extensions: {code: 'INTERNAL_SERVER_ERROR'},
        });
      }

      const articles = articlesData.slice(0, args.first - 1);
      return {
        edges: articles.map(article => ({node: article})),
      };
    },

    article: async (_: unknown, args: {id: string}) => {
      await simulateLatency();

      if (apiConfig.simulateTimeout) {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 30000));
      }

      return articlesData.find(a => a.id === args.id) ?? null;
    },
  },
};
