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
import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const isVerySmallScreen = width < 470;
  
  const screenOptions = useMemo(() => ({
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.tabIconDefault,
    headerShown: false,
    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      height: isVerySmallScreen ? 55 : 65,
      paddingBottom: isVerySmallScreen ? 4 : 8,
      paddingTop: isVerySmallScreen ? 4 : 8,
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      right: 0,
      elevation: isDarkMode ? 8 : 0,
      shadowOpacity: isDarkMode ? 0.3 : 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowRadius: 8,
      zIndex: 1000,
    },
  }), [isVerySmallScreen, colors, isDarkMode]);
  return (
    <AuthGuard>
      <ImmersiveContainer backgroundColor={colors.background} includeNavigationBar={true}>
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
