import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorView({
  message = 'Something went wrong',
  onRetry,
}: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Uh oh!</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityRole="button"
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  heading: {
    ...typography.headline,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.black,
    borderRadius: 4,
    minWidth: 160,
    alignItems: 'center',
  },
  retryText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});
