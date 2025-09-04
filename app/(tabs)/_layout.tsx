import { Tabs } from 'expo-router';
import React from 'react';

import {
    HomeTabIcon,
    MessagesTabIcon,
    ScheduleTabIcon,
    SearchTabIcon,
    SettingsTabIcon
} from '@/components/AnimatedTabIcons';
import AuthGuard from '@/components/AuthGuard';
import { ImmersiveContainer } from '@/components/ImmersiveContainer';
import { Colors } from '@/constants/DesignTokens';

export default function TabLayout() {
  return (
    <AuthGuard>
      <ImmersiveContainer backgroundColor="#ffffff" includeNavigationBar={true}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.brandPrimary,
          tabBarInactiveTintColor: Colors.tabInactive,
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          // Убираем все тени для быстрой отзывчивости
          elevation: 0,
          shadowOpacity: 0,
          // Добавляем дополнительные стили для лучшего прижатия к низу
          zIndex: 1000,
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
    </AuthGuard>
  );
}
