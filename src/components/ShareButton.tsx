import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { ArticleSummary } from '../graphql/types';
import { shareArticle } from '../utils/shareArticle';
import { colors, spacing } from '../theme';

interface ShareButtonProps {
  article: ArticleSummary;
}

export function ShareButton({ article }: ShareButtonProps) {
  const handlePress = async () => {
    if ((await shareArticle(article)) === 'failed') {
      Alert.alert('Could not share', 'Please try again.');
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={spacing.sm}
      accessibilityRole="button"
    >
      <Text style={styles.label}>Share</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    color: colors.accent,
  },
});
