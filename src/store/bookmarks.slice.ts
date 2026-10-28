import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ArticleSummary } from '../graphql/types';

interface BookmarksState {
  // Newest first. Whole summaries, so the Bookmarks screen renders offline.
  items: ArticleSummary[];
}

const initialState: BookmarksState = {
  items: [],
};

// The detail screen passes a full Article; keep only what a list row needs.
function toSummary(article: ArticleSummary): ArticleSummary {
  const { id, title, dek, url, datePublished, authors, thumbnailImage } =
    article;
  return { id, title, dek, url, datePublished, authors, thumbnailImage };
}

const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    addBookmark(state, action: PayloadAction<ArticleSummary>) {
      if (!state.items.some(item => item.id === action.payload.id)) {
        state.items.unshift(toSummary(action.payload));
      }
    },
    removeBookmark(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    toggleBookmark(state, action: PayloadAction<ArticleSummary>) {
      const index = state.items.findIndex(
        item => item.id === action.payload.id,
      );
      if (index === -1) {
        state.items.unshift(toSummary(action.payload));
      } else {
        state.items.splice(index, 1);
      }
    },
  },
});

export const selectBookmarks = (state: { bookmarks: BookmarksState }) =>
  state.bookmarks.items;

export const selectIsBookmarked = (
  state: { bookmarks: BookmarksState },
  id: string,
) => state.bookmarks.items.some(item => item.id === id);

export const { addBookmark, removeBookmark, toggleBookmark } =
  bookmarksSlice.actions;
export default bookmarksSlice.reducer;
