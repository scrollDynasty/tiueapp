import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

interface AnimatedTabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  onPress?: () => void;
}

export function AnimatedTabIcon({ name, focused, onPress }: AnimatedTabIconProps) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: 40 }}>
      <Ionicons
        name={name}
        size={24}
        color={focused ? '#007BFF' : '#94A3B8'}
      />
      
      {/* Простой индикатор */}
      {focused && (
        <View
          style={{
            height: 2,
            width: 20,
            backgroundColor: '#007BFF',
            borderRadius: 1,
            marginTop: 4,
          }}
        />
      )}
    </View>
  );
}

// Специальные иконки для каждой вкладки
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
      name={focused ? "calendar" : "calendar-outline"}
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
