// Formats a parsed datePublished; a missing date renders nothing. The day is
// taken in UTC because the API sends date-only values as midnight UTC, which
// the reader's local zone would shift to the day before.
export function formatDate(timestamp: number | null): string | null {
  if (timestamp === null) {
    return null;
  }
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
