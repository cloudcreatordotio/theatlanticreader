import React, { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { ArticleListItem } from '../components/ArticleListItem';
import { EmptyState } from '../components/EmptyState';
import { useAppSelector } from '../store/hooks';
import { selectBookmarks } from '../store/bookmarks.slice';
import type { ArticleSummary } from '../graphql/types';
import { colors } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'BookmarkedArticles'>;

// Rendered from the stored summaries, so it works offline; each row's own
// bookmark button removes it.
export function BookmarksScreen({ navigation }: Props) {
  const bookmarks = useAppSelector(selectBookmarks);

  const handleArticlePress = useCallback(
    (article: ArticleSummary) => {
      navigation.navigate('ArticleDetail', {
        id: article.id,
        title: article.title,
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: ArticleSummary }) => (
      <ArticleListItem
        article={item}
        onPress={() => handleArticlePress(item)}
      />
    ),
    [handleArticlePress],
  );

  if (bookmarks.length === 0) {
    return (
      <EmptyState
        title="No bookmarks yet"
        message="Tap ☆ on any article to save it here."
      />
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={bookmarks}
      keyExtractor={item => item.id}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
