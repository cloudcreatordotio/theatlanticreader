import { formatDate } from './formatDate';

test('formats a timestamp as a long US date', () => {
  expect(formatDate(Date.parse('2025-03-10T14:30:00Z'))).toBe('March 10, 2025');
});

test('keeps the UTC calendar day in every time zone', () => {
  // The API's epoch dates are midnight UTC; local time would show the day
  // before anywhere west of Greenwich.
  expect(formatDate(Date.parse('2024-03-01T00:00:00Z'))).toBe('March 1, 2024');
});

test('formats nothing for a missing date', () => {
  expect(formatDate(null)).toBeNull();
});
