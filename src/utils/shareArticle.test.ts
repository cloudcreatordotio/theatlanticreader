import { Platform, Share } from 'react-native';
import { shareArticle } from './shareArticle';

const article = { title: 'First article', url: 'https://example.com/1' };

afterEach(() => jest.restoreAllMocks());

test('shares the title and url on iOS', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  const share = jest
    .spyOn(Share, 'share')
    .mockResolvedValue({ action: Share.sharedAction });

  await expect(shareArticle(article)).resolves.toBe('shared');
  expect(share).toHaveBeenCalledWith({
    title: 'First article',
    url: 'https://example.com/1',
    message: 'First article',
  });
});

test('puts the url in the message on Android', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const share = jest
    .spyOn(Share, 'share')
    .mockResolvedValue({ action: Share.sharedAction });

  await expect(shareArticle(article)).resolves.toBe('shared');
  expect(share).toHaveBeenCalledWith({
    title: 'First article',
    message: 'First article\nhttps://example.com/1',
  });
});

test('reports a dismissed sheet', async () => {
  jest
    .spyOn(Share, 'share')
    .mockResolvedValue({ action: Share.dismissedAction });
  await expect(shareArticle(article)).resolves.toBe('dismissed');
});

test('reports a failure instead of throwing', async () => {
  jest.spyOn(Share, 'share').mockRejectedValue(new Error('no activity'));
  await expect(shareArticle(article)).resolves.toBe('failed');
});
