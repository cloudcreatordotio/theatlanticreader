import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ArticleFeedScreen } from '../screens/ArticleFeed.screen';
import { ArticleDetailScreen } from '../screens/ArticleDetail.screen';
import type { RootStackParamList } from './types';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
        }}
      />
      <Stack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={({ route }) => ({
          headerTitle: route.params.title,
          headerBackTitle: 'Feed',
        })}
      />
    </Stack.Navigator>
  );
}
