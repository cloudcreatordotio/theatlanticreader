import { formatDate } from './formatDate';

test('formats a timestamp as a long US date', () => {
  // Midday UTC, so the calendar day is the same in any US or European zone.
  expect(formatDate(Date.parse('2025-03-10T12:00:00Z'))).toBe('March 10, 2025');
});

test('formats nothing for a missing date', () => {
  expect(formatDate(null)).toBeNull();
});
