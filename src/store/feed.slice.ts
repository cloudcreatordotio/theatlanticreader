import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ArticleSummary } from '../graphql/types';

interface FeedState {
  // The last feed that loaded, so a failed refresh or an offline launch still
  // has articles to show.
  articles: ArticleSummary[];
  // When that feed loaded, in epoch milliseconds.
  updatedAt: number | null;
}

const initialState: FeedState = {
  articles: [],
  updatedAt: null,
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    feedLoaded(
      state,
      action: PayloadAction<{ articles: ArticleSummary[]; updatedAt: number }>,
    ) {
      state.articles = action.payload.articles;
      state.updatedAt = action.payload.updatedAt;
    },
  },
});

export const selectSavedFeed = (state: { feed: FeedState }) =>
  state.feed.articles;

export const selectFeedUpdatedAt = (state: { feed: FeedState }) =>
  state.feed.updatedAt;

export const { feedLoaded } = feedSlice.actions;
export default feedSlice.reducer;
