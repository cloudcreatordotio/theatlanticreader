import React, { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useLatestArticles } from '../graphql/queries';
import { useRefreshControl } from '../hooks/useRefreshControl';
import { ArticleListItem } from '../components/ArticleListItem';
import { ExpandedArticleCard } from '../components/ExpandedArticleCard';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import type { ArticleSummary } from '../graphql/types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { feedLoaded, selectSavedFeed } from '../store/feed.slice';
import { colors, spacing, typography } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ArticleFeed'>;

export function ArticleFeedScreen({ navigation }: Props) {
  const [{ articles, fetching, error }, reexecuteQuery] = useLatestArticles(10);
  const dispatch = useAppDispatch();
  const savedArticles = useAppSelector(selectSavedFeed);

  // urql drops its data when a refetch fails and keeps nothing across
  // launches, so every good load is saved and shown in place of an error.
  React.useEffect(() => {
    if (articles) {
      dispatch(feedLoaded(articles));
    }
  }, [dispatch, articles]);
  const showingSaved = !articles && savedArticles.length > 0;
  const visibleArticles = showingSaved ? savedArticles : articles;

  const { refreshing, onRefresh: baseOnRefresh } = useRefreshControl({
    fetching,
    refetch: reexecuteQuery,
  });

  // Track when feed was last refreshed
  const [lastRefreshed, setLastRefreshed] = React.useState<Date>(new Date());
  const [refreshLabel, setRefreshLabel] = React.useState('Just now');

  React.useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor(
        (new Date().getTime() - lastRefreshed.getTime()) / 1000,
      );
      if (seconds < 60) {
        setRefreshLabel('Just now');
      } else if (seconds < 3600) {
        setRefreshLabel(`${Math.floor(seconds / 60)}m ago`);
      } else {
        setRefreshLabel(`${Math.floor(seconds / 3600)}h ago`);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [lastRefreshed]);

  const onRefresh = useCallback(() => {
    setLastRefreshed(new Date());
    setRefreshLabel('Just now');
    baseOnRefresh();
  }, [baseOnRefresh]);

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
    ({ item, index }: { item: ArticleSummary; index: number }) => {
      if (index === 0) {
        return (
          <ExpandedArticleCard
            article={item}
            onPress={() => handleArticlePress(item)}
          />
        );
      }
      return (
        <ArticleListItem
          article={item}
          onPress={() => handleArticlePress(item)}
        />
      );
    },
    [handleArticlePress],
  );

  if (fetching && !visibleArticles) {
    return <LoadingView />;
  }

  if (error && !visibleArticles) {
    return (
      <ErrorView
        message="We couldn't load the latest articles. Check your connection and try again."
        onRetry={() => reexecuteQuery({ requestPolicy: 'network-only' })}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={visibleArticles}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <>
            {showingSaved && error ? (
              <View style={styles.savedBanner}>
                <Text style={styles.savedBannerText}>
                  Couldn't refresh. Showing saved articles; pull down to try
                  again.
                </Text>
              </View>
            ) : null}
            <View style={styles.refreshHeader}>
              <Text style={styles.refreshLabel}>Updated {refreshLabel}</Text>
            </View>
          </>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  savedBanner: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.text,
  },
  savedBannerText: {
    ...typography.caption,
    color: colors.white,
  },
  refreshHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  refreshLabel: {
    ...typography.caption,
    textAlign: 'right',
  },
});
