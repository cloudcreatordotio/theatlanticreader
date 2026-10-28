import React from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ArticleSummary } from '../graphql/types';
import { colors, spacing, typography } from '../theme';

interface ExpandedArticleCardProps {
  article: ArticleSummary;
  onPress: () => void;
}

export function ExpandedArticleCard({
  article,
  onPress,
}: ExpandedArticleCardProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const onImageLoad = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const byline = article.authors.map(a => a.displayName).join(', ');

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {article.thumbnailImage && (
        <Animated.Image
          source={{ uri: article.thumbnailImage.url }}
          style={[styles.heroImage, { opacity: fadeAnim }]}
          onLoad={onImageLoad}
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{article.title}</Text>
        {article.dek && (
          <Text style={styles.dek} numberOfLines={3}>
            {article.dek}
          </Text>
        )}
        <View style={styles.footer}>
          {byline ? <Text style={styles.byline}>{byline}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xl,
    paddingBottom: 0,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  heroImage: {
    width: '100%',
    height: 220,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  title: {
    ...typography.headline,
    marginBottom: spacing.sm,
  },
  dek: {
    ...typography.dek,
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  byline: {
    ...typography.byline,
  },
});
