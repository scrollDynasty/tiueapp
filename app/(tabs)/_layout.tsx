import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import {
  HomeTabIcon,
  MessagesTabIcon,
  ScheduleTabIcon,
  SearchTabIcon,
  SettingsTabIcon
} from '@/components/AnimatedTabIcons';
import { ImmersiveContainer } from '@/components/ImmersiveContainer';
import { Colors } from '@/constants/DesignTokens';

export default function TabLayout() {
  return (
    <ImmersiveContainer backgroundColor="#ffffff" includeNavigationBar={true}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.brandPrimary,
          tabBarInactiveTintColor: Colors.tabInactive,
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            // Убираем стандартную тень и границы
            elevation: 0,
            shadowOpacity: 0.1,
            borderTopWidth: 0,
            // Добавляем небольшую высоту для лучшей видимости
            height: Platform.OS === 'android' ? 65 : 80,
            paddingBottom: Platform.OS === 'android' ? 10 : 20,
            paddingTop: 10,
            // Добавляем небольшую тень сверху
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowRadius: 3,
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
    </ImmersiveContainer>
  );
}
