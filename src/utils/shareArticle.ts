import { Platform, Share } from 'react-native';
import type { ArticleSummary } from '../graphql/types';

export type ShareOutcome = 'shared' | 'dismissed' | 'failed';

// Android ignores `url` and shares only `message`, so the link goes into the
// message there. Never throws: a failed share is reported, not raised.
export async function shareArticle({
  title,
  url,
}: Pick<ArticleSummary, 'title' | 'url'>): Promise<ShareOutcome> {
  const content =
    Platform.OS === 'ios'
      ? { title, url, message: title }
      : { title, message: `${title}\n${url}` };
  try {
    const result = await Share.share(content);
    return result.action === Share.dismissedAction ? 'dismissed' : 'shared';
  } catch {
    return 'failed';
  }
}
