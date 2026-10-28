import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ArticleSummary } from '../graphql/types';
import { formatDate } from '../utils/formatDate';
import { BookmarkButton } from './BookmarkButton';
import { colors, spacing, typography } from '../theme';

interface ArticleListItemProps {
  article: ArticleSummary;
  onPress: () => void;
}

export const ArticleListItem = React.memo(function ArticleListItem({
  article,
  onPress,
}: ArticleListItemProps) {
  const byline = article.authors.map(a => a.displayName).join(', ');
  const publishedDate = formatDate(article.datePublished);

  return (
    <TouchableOpacity
      style={[styles.container, !article.thumbnailImage && styles.noThumbnail]}
      onPress={onPress}
    >
      <View style={styles.row}>
        {article.thumbnailImage && (
          <Image
            source={{ uri: article.thumbnailImage.url }}
            style={styles.thumbnail}
          />
        )}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={3}>
            {article.title}
          </Text>
          {byline ? <Text style={styles.byline}>{byline}</Text> : null}
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.date}>{publishedDate}</Text>
        <BookmarkButton article={article} />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  noThumbnail: {
    opacity: 0.9,
  },
  row: {
    flexDirection: 'row',
  },
  thumbnail: {
    width: 90,
    height: 90,
    backgroundColor: colors.surface,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.md,
  },
  byline: {
    ...typography.byline,
  },
  footer: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    ...typography.date,
  },
});
