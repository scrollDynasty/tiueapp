import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import {
  EventsTabIcon,
  HomeTabIcon,
  ScheduleTabIcon,
  SearchTabIcon,
  SettingsTabIcon
} from '@/components/AnimatedTabIcons';
import AuthGuard from '@/components/AuthGuard';
import { ImmersiveContainer } from '@/components/ImmersiveContainer';
import { Colors } from '@/constants/DesignTokens';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isVerySmallScreen = width < 480;
  
  // Отладочное логирование
  console.log('Screen width:', width, 'isVerySmallScreen:', isVerySmallScreen);
  
  const screenOptions = useMemo(() => ({
    tabBarActiveTintColor: Colors.brandPrimary,
    tabBarInactiveTintColor: Colors.tabInactive,
    headerShown: false,
    tabBarStyle: {
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      height: isVerySmallScreen ? 55 : 65, // Уменьшаем высоту на маленьких экранах
      paddingBottom: isVerySmallScreen ? 4 : 8,
      paddingTop: isVerySmallScreen ? 4 : 8,
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      right: 0,
      // Убираем все тени для быстрой отзывчивости
      elevation: 0,
      shadowOpacity: 0,
      // Добавляем дополнительные стили для лучшего прижатия к низу
      zIndex: 1000,
    },
  }), [isVerySmallScreen]);
  return (
    <AuthGuard>
      <ImmersiveContainer backgroundColor="#ffffff" includeNavigationBar={true}>
      <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title : 'Главная',
          tabBarLabel: isVerySmallScreen ? '' : '',
          tabBarIcon: ({ focused }) => {
            return <HomeTabIcon focused={focused} />;
          },
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Курсы',
          tabBarLabel: isVerySmallScreen ? '' : '',
          tabBarIcon: ({ focused }) => {
            return <SearchTabIcon focused={focused} />;
          },
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Расписание',
          tabBarLabel: isVerySmallScreen ? '' : '',
          tabBarIcon: ({ focused }) => {
            return <ScheduleTabIcon focused={focused} />;
          },
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'События',
          tabBarLabel: isVerySmallScreen ? '' : '',
          tabBarIcon: ({ focused }) => {
            return <EventsTabIcon focused={focused} />;
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarLabel: isVerySmallScreen ? '' : '',
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
