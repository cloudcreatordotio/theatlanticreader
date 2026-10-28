// Formats a parsed datePublished; a missing date renders nothing.
export function formatDate(timestamp: number | null): string | null {
  if (timestamp === null) {
    return null;
  }
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
