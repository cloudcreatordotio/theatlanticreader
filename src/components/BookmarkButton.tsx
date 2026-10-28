import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { ArticleSummary } from '../graphql/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectIsBookmarked, toggleBookmark } from '../store/bookmarks.slice';
import { colors, spacing } from '../theme';

interface BookmarkButtonProps {
  article: ArticleSummary;
}

// Subscribes to the store itself, so a memoised list row that contains it
// still updates when the bookmark toggles.
export function BookmarkButton({ article }: BookmarkButtonProps) {
  const dispatch = useAppDispatch();
  const isBookmarked = useAppSelector(state =>
    selectIsBookmarked(state, article.id),
  );

  return (
    <TouchableOpacity
      onPress={() => dispatch(toggleBookmark(article))}
      hitSlop={spacing.md}
      accessibilityRole="button"
      accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Save article'}
      accessibilityState={{ selected: isBookmarked }}
    >
      <Text style={styles.glyph}>{isBookmarked ? '★' : '☆'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  glyph: {
    fontSize: 22,
    lineHeight: 24,
    color: colors.accent,
  },
});
