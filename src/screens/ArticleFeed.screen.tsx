import React, {useCallback} from 'react';
import {FlatList, RefreshControl, StyleSheet, Text, View} from 'react-native';
import {useLatestArticles} from '../graphql/queries';
import {useRefreshControl} from '../hooks/useRefreshControl';
import {ArticleListItem} from '../components/ArticleListItem';
import {ExpandedArticleCard} from '../components/ExpandedArticleCard';
import {LoadingView} from '../components/LoadingView';
import {ErrorView} from '../components/ErrorView';
import type {Article, ArticleEdge} from '../graphql/types';
import {colors, spacing, typography} from '../theme';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ArticleFeed'>;

export function ArticleFeedScreen({navigation}: Props) {
  const [{data, fetching, error}, reexecuteQuery] = useLatestArticles(10);

  const {refreshing, onRefresh: baseOnRefresh} = useRefreshControl({
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
  }, [lastRefreshed]);

  const onRefresh = useCallback(() => {
    setLastRefreshed(new Date());
    setRefreshLabel('Just now');
    baseOnRefresh();
  }, [baseOnRefresh]);

  const articles = data?.latestArticles.edges.map(
    (edge: ArticleEdge) => edge.node,
  );

  const handleArticlePress = useCallback(
    (article: Article) => {
      navigation.navigate('ArticleDetail', {
        id: article.id,
        title: article.title,
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({item, index}: {item: Article; index: number}) => {
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

  if (fetching && !articles) {
    return <LoadingView />;
  }

  if (error && !articles) {
    return (
      <ErrorView
        message={error.message}
        onRetry={() => reexecuteQuery({requestPolicy: 'network-only'})}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.refreshHeader}>
            <Text style={styles.refreshLabel}>Updated {refreshLabel}</Text>
          </View>
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
