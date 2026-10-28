import { articleResolvers } from './articles.resolver';

test('returns the requested number of articles', async () => {
  const result = articleResolvers.Query.latestArticles(undefined, {
    first: 10,
  });
  // Skip the simulated network latency.
  jest.runAllTimers();

  const { edges } = await result;
  expect(edges).toHaveLength(10);
  expect(edges[0].node.id).toBe('article-1');
  expect(edges[9].node.id).toBe('article-10');
});
