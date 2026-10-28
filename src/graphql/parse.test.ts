import {
  parseArticle,
  parseArticleSummary,
  parseAuthors,
  parseDate,
  parseImage,
  parseWordCount,
} from './parse';
import type { RawArticle } from './types';

describe('parseDate', () => {
  test('reads ISO strings', () => {
    expect(parseDate('2025-03-10T14:30:00Z')?.toISOString()).toBe(
      '2025-03-10T14:30:00.000Z',
    );
  });

  test('reads the epoch-seconds digit strings the API sends', () => {
    expect(parseDate('1709251200')?.toISOString()).toBe(
      '2024-03-01T00:00:00.000Z',
    );
    expect(parseDate('1710460800')?.toISOString()).toBe(
      '2024-03-15T00:00:00.000Z',
    );
  });

  test('reads epoch milliseconds and numbers', () => {
    expect(parseDate('1709251200000')?.toISOString()).toBe(
      '2024-03-01T00:00:00.000Z',
    );
    expect(parseDate(1709251200)?.toISOString()).toBe(
      '2024-03-01T00:00:00.000Z',
    );
    expect(parseDate(1709251200000)?.toISOString()).toBe(
      '2024-03-01T00:00:00.000Z',
    );
  });

  test('returns null for anything that is not a date', () => {
    expect(parseDate('not a date')).toBeNull();
    expect(parseDate('')).toBeNull();
    expect(parseDate(null)).toBeNull();
    expect(parseDate(undefined)).toBeNull();
    expect(parseDate(NaN)).toBeNull();
    expect(parseDate({})).toBeNull();
    expect(parseDate(new Date('nope'))).toBeNull();
  });
});

test('parseAuthors turns a missing list into an empty one', () => {
  const author = { id: 'author-1', displayName: 'Ada Writer' };
  expect(parseAuthors([author])).toEqual([author]);
  expect(parseAuthors(null)).toEqual([]);
  expect(parseAuthors(undefined)).toEqual([]);
  expect(parseAuthors([author, null, { id: 'author-2' }])).toEqual([author]);
});

test('parseImage drops an image without a url', () => {
  const image = {
    id: 'image-1',
    url: 'https://example.com/1.jpg',
    width: 90,
    height: 90,
    altText: null,
  };
  expect(parseImage(image)).toBe(image);
  expect(parseImage(null)).toBeNull();
  expect(parseImage({ id: 'image-2' })).toBeNull();
});

test('parseWordCount keeps zero and drops non-numbers', () => {
  expect(parseWordCount(1847)).toBe(1847);
  expect(parseWordCount(0)).toBe(0);
  expect(parseWordCount(null)).toBeNull();
  expect(parseWordCount('1847')).toBeNull();
});

const raw: RawArticle = {
  id: 'article-4',
  title: 'Fourth article',
  dek: null,
  url: 'https://example.com/4',
  datePublished: '1709251200',
  authors: null,
  thumbnailImage: null,
  heroImage: null,
  body: 'Body text',
  wordCount: 0,
};

test('parseArticleSummary yields only the summary fields, well-formed', () => {
  expect(
    parseArticleSummary({ ...raw, __typename: 'Article' } as RawArticle),
  ).toEqual({
    id: 'article-4',
    title: 'Fourth article',
    dek: null,
    url: 'https://example.com/4',
    datePublished: 1709251200000,
    authors: [],
    thumbnailImage: null,
  });
});

test('parseArticle adds the body fields', () => {
  expect(parseArticle(raw)).toMatchObject({
    datePublished: 1709251200000,
    authors: [],
    heroImage: null,
    body: 'Body text',
    wordCount: 0,
  });
});
