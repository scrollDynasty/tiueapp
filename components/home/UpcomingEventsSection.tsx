import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, { SlideInLeft } from 'react-native-reanimated';
import { ThemedText } from '../ThemedText';
import { QuickEventCard } from './QuickEventCard';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
}

interface UpcomingEventsSectionProps {
  events: Event[];
}

export const UpcomingEventsSection = React.memo(({ events }: UpcomingEventsSectionProps) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const { spacing, fontSize, isVerySmallScreen } = useResponsive();

  if (events.length === 0) {
    return null;
  }

  return (
    <Animated.View entering={SlideInLeft.delay(400)} style={{ marginBottom: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <ThemedText
          style={{
            fontSize: fontSize.title,
            lineHeight: isVerySmallScreen ? 22 : 24,
            color: colors.text,
            fontFamily: 'Inter',
          }}
        >
          📅 Предстоящие события
        </ThemedText>
        <Pressable
          style={{
            backgroundColor: colors.backgroundSecondary,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.xs,
            borderRadius: 20,
          }}
          onPress={() => router.push('/(tabs)/events')}
        >
          <ThemedText style={{
            fontSize: fontSize.small,
            color: colors.primary,
          }}>
            Все события
          </ThemedText>
        </Pressable>
      </View>
      
      <View>
        {events.map((event, index) => (
          <QuickEventCard key={event.id} event={event} index={index} />
        ))}
      </View>
    </Animated.View>
  );
});

UpcomingEventsSection.displayName = 'UpcomingEventsSection';
