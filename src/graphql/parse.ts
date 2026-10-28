import type {
  Article,
  ArticleSummary,
  Author,
  Image,
  RawArticle,
  RawArticleSummary,
} from './types';

// Ten digits or fewer is epoch seconds (good until the year 2286); more is
// milliseconds.
function fromEpoch(value: number): Date {
  return new Date(value < 1e10 ? value * 1000 : value);
}

// The schema types datePublished as a String, but the API also sends epoch
// seconds, which GraphQL serializes as a digit string ("1709251200") that
// new Date() cannot read. Accept ISO strings, numbers and digit strings;
// anything else, or anything that is not a valid date, is null.
export function parseDate(value: unknown): Date | null {
  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'number') {
    date = fromEpoch(value);
  } else if (typeof value === 'string' && /^\d+$/.test(value)) {
    date = fromEpoch(Number(value));
  } else if (typeof value === 'string') {
    date = new Date(value);
  } else {
    return null;
  }
  return Number.isNaN(date.getTime()) ? null : date;
}

function isAuthor(value: unknown): value is Author {
  const author = value as Author | null;
  return (
    typeof author?.id === 'string' && typeof author.displayName === 'string'
  );
}

export function parseAuthors(value: unknown): Author[] {
  return Array.isArray(value) ? value.filter(isAuthor) : [];
}

export function parseImage(value: unknown): Image | null {
  const image = value as Image | null;
  return typeof image?.url === 'string' ? image : null;
}

export function parseWordCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function parseArticleSummary(raw: RawArticleSummary): ArticleSummary {
  return {
    id: raw.id,
    title: raw.title,
    dek: raw.dek ?? null,
    url: raw.url,
    datePublished: parseDate(raw.datePublished)?.getTime() ?? null,
    authors: parseAuthors(raw.authors),
    thumbnailImage: parseImage(raw.thumbnailImage),
  };
}

export function parseArticle(raw: RawArticle): Article {
  return {
    ...parseArticleSummary(raw),
    heroImage: parseImage(raw.heroImage),
    body: raw.body,
    wordCount: parseWordCount(raw.wordCount),
  };
}
