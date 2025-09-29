import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  EventsTabIcon,
  HomeTabIcon,
  ScheduleTabIcon,
  SearchTabIcon,
  SettingsTabIcon
} from '@/components/AnimatedTabIcons';
import AuthGuard from '@/components/AuthGuard';
import { ImmersiveContainer } from '@/components/ImmersiveContainer';
import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const insets = useSafeAreaInsets();
  const isVerySmallScreen = width < 470;
  
  // Фикс для Dynamic Island - добавляем отступ сверху
  const topPadding = Platform.OS === 'ios' && insets.top >= 59 ? 10 : 0;
  
  const screenOptions = useMemo(() => ({
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.tabIconDefault,
    headerShown: false,
    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      // Ультра компактная высота для Android
      height: Platform.OS === 'android' 
        ? (isVerySmallScreen ? 50 : 58) 
        : (isVerySmallScreen ? 85 : 95),
      // Правильные отступы снизу - убираем insets для Android полностью
      paddingBottom: Platform.OS === 'android'
        ? (isVerySmallScreen ? 4 : 6) // Минимальные внутренние отступы
        : insets.bottom + (isVerySmallScreen ? 12 : 16),
      paddingTop: Platform.OS === 'android'
        ? (isVerySmallScreen ? 3 : 4) // Минимальные отступы сверху
        : (isVerySmallScreen ? 12 : 16),
      position: 'absolute' as const,
      // ПРИНУДИТЕЛЬНО убираем все отступы снизу для Android
      bottom: 0,
      left: 0,
      right: 0,
      // Убираем margin bottom для Android
      marginBottom: Platform.OS === 'android' ? 0 : undefined,
      elevation: isDarkMode ? 8 : 0,
      shadowOpacity: isDarkMode ? 0.3 : 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowRadius: 8,
      zIndex: 1000,
    },
  }), [isVerySmallScreen, colors, isDarkMode, insets.bottom]);
  return (
    <AuthGuard>
      <ImmersiveContainer backgroundColor={colors.background} includeNavigationBar={Platform.OS === 'android'}>
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
      <Tabs.Screen
        name="students"
        options={{
          href: null, 
        }}
      />
    </Tabs>
    </ImmersiveContainer>
    </AuthGuard>
  );
}
