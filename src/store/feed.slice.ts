import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ArticleSummary } from '../graphql/types';

interface FeedState {
  // The last feed that loaded, so a failed refresh or an offline launch still
  // has articles to show.
  articles: ArticleSummary[];
}

const initialState: FeedState = {
  articles: [],
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    feedLoaded(state, action: PayloadAction<ArticleSummary[]>) {
      state.articles = action.payload;
    },
  },
});

export const selectSavedFeed = (state: { feed: FeedState }) =>
  state.feed.articles;

export const { feedLoaded } = feedSlice.actions;
export default feedSlice.reducer;
