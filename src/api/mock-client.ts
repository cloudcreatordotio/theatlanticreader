import {createClient, cacheExchange} from 'urql';
import {executeExchange} from '@urql/exchange-execute';
import {makeExecutableSchema} from '@graphql-tools/schema';
import {typeDefs} from './mock-schema';
import {articleResolvers} from './resolvers/articles.resolver';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: articleResolvers,
});

export const client = createClient({
  url: 'mock://graphql',
  exchanges: [cacheExchange, executeExchange({schema})],
});
