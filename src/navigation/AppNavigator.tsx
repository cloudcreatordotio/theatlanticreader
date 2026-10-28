import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { ArticleFeedScreen } from '../screens/ArticleFeed.screen';
import { ArticleDetailScreen } from '../screens/ArticleDetail.screen';
import { BookmarksScreen } from '../screens/Bookmarks.screen';
import type { RootStackParamList } from './types';
import { colors, spacing } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

function BookmarksHeaderButton() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('BookmarkedArticles')}
      hitSlop={spacing.sm}
      accessibilityRole="button"
    >
      <Text style={styles.headerButton}>Bookmarks</Text>
    </TouchableOpacity>
  );
}

const renderBookmarksHeaderButton = () => <BookmarksHeaderButton />;

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.accent,
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '600',
          fontSize: 16,
        },
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="ArticleFeed"
        component={ArticleFeedScreen}
        options={{
          title: 'The Atlantic',
          headerTitleStyle: {
            color: colors.text,
            fontWeight: '700',
            fontSize: 18,
          },
          headerRight: renderBookmarksHeaderButton,
        }}
      />
      <Stack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={({ route }) => ({
          headerTitle: route.params.title,
        })}
      />
      <Stack.Screen
        name="BookmarkedArticles"
        component={BookmarksScreen}
        options={{ title: 'Bookmarks', headerBackTitle: 'Feed' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    fontSize: 16,
    color: colors.accent,
  },
});
