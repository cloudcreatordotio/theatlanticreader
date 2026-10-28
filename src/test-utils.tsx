import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react-native';
import { makeStore } from './store/store';

// Renders inside a fresh Redux store, for components that read bookmarks.
export function renderWithStore(ui: React.ReactElement, store = makeStore()) {
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}
