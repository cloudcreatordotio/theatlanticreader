import React from 'react';
import {
  AppState,
  type AppStateStatus,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useArticle } from '../graphql/queries';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { BookmarkButton } from '../components/BookmarkButton';
import { formatDate } from '../utils/formatDate';
import { colors, spacing, typography } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { Article } from '../graphql/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ArticleDetail'>;

// Built outside the screen so the header's render function is not a component
// defined during render.
function bookmarkHeader(article: Article) {
  return () => <BookmarkButton article={article} />;
}

export function ArticleDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [{ article, fetching, error }, reexecuteQuery] = useArticle(id);
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Track app background/foreground for reading analytics
  const appState = React.useRef(AppState.currentState);
  React.useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/active/) && nextAppState === 'background') {
        // No analytics client exists yet; report the backgrounding here.
      }
      appState.current = nextAppState;
    };
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [id]);

  // The route carries only id and title, so the header's bookmark toggle
  // waits for the article it saves.
  React.useEffect(() => {
    if (article) {
      navigation.setOptions({
        headerRight: bookmarkHeader(article),
      });
    }
  }, [navigation, article]);

  // Restore reading position once the article, and so the ScrollView, has
  // rendered. A lost position is not worth an error, so storage failures are
  // ignored here and when saving.
  const loadedId = article?.id;
  React.useEffect(() => {
    if (!loadedId) {
      return;
    }
    AsyncStorage.getItem(`reading-position-${loadedId}`)
      .then(value => {
        if (value) {
          const position = parseInt(value, 10);
          scrollViewRef.current?.scrollTo({ y: position, animated: false });
        }
      })
      .catch(() => {});
  }, [loadedId]);

  const handleScroll = React.useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const y = Math.round(event.nativeEvent.contentOffset.y);
      AsyncStorage.setItem(`reading-position-${id}`, String(y)).catch(() => {});
    },
    [id],
  );

  if (fetching) {
    return <LoadingView />;
  }

  if (error || !article) {
    return (
      <ErrorView
        message={error?.message ?? 'Article not found'}
        onRetry={() => reexecuteQuery({ requestPolicy: 'network-only' })}
      />
    );
  }

  const byline = article.authors.map(a => a.displayName).join(', ');
  const publishedDate = formatDate(article.datePublished);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      onScroll={handleScroll}
      scrollEventThrottle={400}
    >
      {article.heroImage && (
        <Image
          source={{ uri: article.heroImage.url }}
          style={styles.heroImage}
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{article.title}</Text>
        {article.dek && <Text style={styles.dek}>{article.dek}</Text>}
        <View style={styles.meta}>
          {byline ? <Text style={styles.byline}>By {byline}</Text> : null}
          {publishedDate ? (
            <Text style={styles.date}>{publishedDate}</Text>
          ) : null}
        </View>
        <Text style={styles.body}>{article.body}</Text>
        {article.wordCount !== null ? (
          <Text style={styles.wordCount}>
            {article.wordCount.toLocaleString()} words
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroImage: {
    width: '100%',
    height: 280,
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.headline,
    marginBottom: spacing.sm,
  },
  dek: {
    ...typography.dek,
    marginBottom: spacing.lg,
  },
  meta: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  byline: {
    ...typography.byline,
    marginBottom: spacing.sm,
  },
  date: {
    ...typography.date,
  },
  body: {
    ...typography.body,
    lineHeight: 28,
  },
  wordCount: {
    ...typography.caption,
    marginTop: spacing.lg,
    textAlign: 'right',
  },
});
