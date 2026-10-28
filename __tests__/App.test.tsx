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
