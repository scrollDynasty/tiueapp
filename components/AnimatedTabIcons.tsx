import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, View } from 'react-native';

interface AnimatedTabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  onPress?: () => void;
}

export function AnimatedTabIcon({ name, focused, onPress }: AnimatedTabIconProps) {

  const iconSize = Platform.OS === 'android' ? 20 : 26;
  const containerHeight = Platform.OS === 'android' ? 32 : 44;
  const containerWidth = Platform.OS === 'android' ? 32 : 44;
  const indicatorWidth = Platform.OS === 'android' ? 18 : 24;
  const indicatorHeight = Platform.OS === 'android' ? 2 : 3;

  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      height: containerHeight,
      width: containerWidth,

      minWidth: containerWidth,
      minHeight: containerHeight
    }}>
      <Ionicons
        name={name}
        size={iconSize}
        color={focused ? '#007BFF' : '#6B7280'}
      />

      {}
      {focused && (
        <View
          style={{
            height: indicatorHeight,
            width: indicatorWidth,
            backgroundColor: '#007BFF',
            borderRadius: indicatorHeight / 2,
            marginTop: Platform.OS === 'android' ? 1 : 2,
          }}
        />
      )}
    </View>
  );
}

export function HomeTabIcon({ focused, onPress }: { focused: boolean; onPress?: () => void }) {
  return (
    <AnimatedTabIcon
      name={focused ? "home" : "home-outline"}
      focused={focused}
      onPress={onPress}
    />
  );
}

export function SearchTabIcon({ focused, onPress }: { focused: boolean; onPress?: () => void }) {
  return (
    <AnimatedTabIcon
      name={focused ? "search" : "search-outline"}
      focused={focused}
      onPress={onPress}
    />
  );
}

export function MessagesTabIcon({ focused, onPress }: { focused: boolean; onPress?: () => void }) {
  return (
    <AnimatedTabIcon
      name={focused ? "chatbubbles" : "chatbubbles-outline"}
      focused={focused}
      onPress={onPress}
    />
  );
}

export function ScheduleTabIcon({ focused, onPress }: { focused: boolean; onPress?: () => void }) {
  return (
    <AnimatedTabIcon
      name={focused ? "time" : "time-outline"}
      focused={focused}
      onPress={onPress}
    />
  );
}

export function EventsTabIcon({ focused, onPress }: { focused: boolean; onPress?: () => void }) {
  return (
    <AnimatedTabIcon
      name={focused ? "calendar" : "calendar-outline"}
      focused={focused}
      onPress={onPress}
    />
  );
}

export function StudentsTabIcon({ focused, onPress }: { focused: boolean; onPress?: () => void }) {
  return (
    <AnimatedTabIcon
      name={focused ? "people" : "people-outline"}
      focused={focused}
      onPress={onPress}
    />
  );
}

export function SettingsTabIcon({ focused, onPress }: { focused: boolean; onPress?: () => void }) {
  return (
    <AnimatedTabIcon
      name={focused ? "settings" : "settings-outline"}
      focused={focused}
      onPress={onPress}
    />
  );
}
