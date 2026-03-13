import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {Article} from '../graphql/types';
import {colors, spacing, typography} from '../theme';

interface ArticleListItemProps {
  article: Article;
  onPress: () => void;
}

export const ArticleListItem = React.memo(function ArticleListItem({
  article,
  onPress,
}: ArticleListItemProps) {
  const byline = article.authors.map(a => a.displayName).join(', ');

  return (
    <TouchableOpacity
      style={{...styles.container, opacity: article.thumbnailImage ? 1 : 0.9}}
      onPress={onPress}>
      <View style={styles.row}>
        {article.thumbnailImage && (
          <Image
            source={{uri: article.thumbnailImage.url}}
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
      {article.datePublished ? (
        <View style={styles.footer}>
          <Text style={styles.date}>
            {new Date(article.datePublished).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
      ) : null}
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
