import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  HomeTabIcon,
  MessagesTabIcon,
  ScheduleTabIcon,
  SearchTabIcon,
  SettingsTabIcon
} from '@/components/AnimatedTabIcons';
import { Colors, Shadows } from '@/constants/DesignTokens';
import { useSystemBars } from '@/hooks/useSystemBars';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  useSystemBars(); // Активируем immersive mode

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.brandPrimary,
        tabBarInactiveTintColor: Colors.tabInactive,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 0,
          height: Platform.OS === 'android' ? 60 : 82,
          paddingBottom: Platform.OS === 'android' ? 8 : 25,
          paddingTop: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          ...Shadows.tab,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => {
            return <HomeTabIcon focused={focused} />;
          },
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Search', 
          tabBarIcon: ({ focused }) => {
            return <SearchTabIcon focused={focused} />;
          },
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ focused }) => {
            return <ScheduleTabIcon focused={focused} />;
          },
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Messages',
          tabBarIcon: ({ focused }) => {
            return <MessagesTabIcon focused={focused} />;
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => {
            return <SettingsTabIcon focused={focused} />;
          },
        }}
      />
    </Tabs>
  );
}
