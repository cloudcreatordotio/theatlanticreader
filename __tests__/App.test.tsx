/**
 * @format
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import App from '../App';

test('renders the feed from the mock API', async () => {
  render(<App />);
  // findByText advances the fake timers past the mock API's latency.
  expect(
    await screen.findByText(
      'The Hidden Cost of Infinite Scrolling',
      {},
      { timeout: 3000 },
    ),
  ).toBeTruthy();
});

test('shows ten articles and a real date for each, including epoch-seconds ones', async () => {
  render(<App />);
  await screen.findByText(
    'The Hidden Cost of Infinite Scrolling',
    {},
    { timeout: 3000 },
  );
  expect(
    screen.getByText('The Mathematician Who Sees the Future in Traffic Jams'),
  ).toBeTruthy();
  // article-4 and article-10 arrive as "1709251200" and "1710460800"; the
  // other rows are 2025 ISO dates (the first article is the card, no date).
  expect(screen.getByText('March 1, 2024')).toBeTruthy();
  expect(screen.getByText('March 15, 2024')).toBeTruthy();
  expect(screen.getAllByText(/^\w+ \d{1,2}, 2025$/)).toHaveLength(7);
  expect(screen.queryByText('Invalid Date')).toBeNull();
});
