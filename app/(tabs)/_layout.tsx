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
import { Colors, Shadows } from '@/constants/DesignTokens';

export default function TabLayout() {
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
          height: 82,
          paddingBottom: Platform.OS === 'ios' ? 25 : 12,
          paddingTop: 8,
          ...Shadows.tab,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <HomeTabIcon 
              focused={focused} 
              onPress={() => {}} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => (
            <SearchTabIcon 
              focused={focused} 
              onPress={() => {}} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ focused }) => (
            <ScheduleTabIcon 
              focused={focused} 
              onPress={() => {}} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Messages',
          tabBarIcon: ({ focused }) => (
            <MessagesTabIcon 
              focused={focused} 
              onPress={() => {}} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <SettingsTabIcon 
              focused={focused} 
              onPress={() => {}} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
