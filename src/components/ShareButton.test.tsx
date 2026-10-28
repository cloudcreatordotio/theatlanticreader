import React from 'react';
import { Alert, Share } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ShareButton } from './ShareButton';
import type { ArticleSummary } from '../graphql/types';

const article: ArticleSummary = {
  id: 'article-1',
  title: 'First article',
  dek: null,
  url: 'https://example.com/1',
  datePublished: null,
  authors: [],
  thumbnailImage: null,
};

afterEach(() => jest.restoreAllMocks());

async function pressShare() {
  render(<ShareButton article={article} />);
  await act(async () => {
    fireEvent.press(screen.getByRole('button', { name: 'Share' }));
  });
}

test('opens the share sheet without a message when it is shared', async () => {
  const share = jest
    .spyOn(Share, 'share')
    .mockResolvedValue({ action: Share.sharedAction });
  const alert = jest.spyOn(Alert, 'alert');

  await pressShare();

  expect(share).toHaveBeenCalledTimes(1);
  expect(alert).not.toHaveBeenCalled();
});

test('stays silent when the sheet is dismissed', async () => {
  jest
    .spyOn(Share, 'share')
    .mockResolvedValue({ action: Share.dismissedAction });
  const alert = jest.spyOn(Alert, 'alert');

  await pressShare();

  expect(alert).not.toHaveBeenCalled();
});

test('tells the reader when sharing fails', async () => {
  jest.spyOn(Share, 'share').mockRejectedValue(new Error('no activity'));
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  await pressShare();

  expect(alert).toHaveBeenCalledWith('Could not share', 'Please try again.');
  expect(screen.getByRole('button', { name: 'Share' })).toBeTruthy();
});
