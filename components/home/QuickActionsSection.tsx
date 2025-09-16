import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ActionCard } from '../ActionCard';
import { ThemedText } from '../ThemedText';

interface QuickActionsSectionProps {
  userRole?: string;
}

export const QuickActionsSection = React.memo(({ userRole }: QuickActionsSectionProps) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const { gap, cardWidth, cardHeight, spacing, typography } = useResponsive();

  return (
    <Animated.View
      entering={FadeInDown.delay(300)}
      style={{
        marginBottom: spacing.xl,
      }}
    >
      <ThemedText
        style={{
          fontSize: typography.lg,
          lineHeight: typography.lg * 1.3,
          fontWeight: '600',
          color: colors.text,
          marginBottom: spacing.md,
        }}
      >
        🚀 Быстрые действия
      </ThemedText>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: gap,
        }}
      >
        {userRole === 'admin' ? (
          <>
            <ActionCard
              title="ПОЛЬЗОВАТЕЛИ"
              icon="people-outline"
              onPress={() => router.push('/admin/users')}
              style={{ width: cardWidth, height: cardHeight }}
            />
            <ActionCard
              title="НОВОСТИ"
              icon="newspaper-outline"
              onPress={() => router.push('/admin/news')}
              style={{ width: cardWidth, height: cardHeight }}
            />
            <ActionCard
              title="СОБЫТИЯ"
              icon="calendar-outline"
              onPress={() => router.push('/admin/events')}
              style={{ width: cardWidth, height: cardHeight }}
            />
            <ActionCard
              title="АНАЛИТИКА"
              icon="analytics-outline"
              onPress={() => router.push('/(tabs)/profile')}
              style={{ width: cardWidth, height: cardHeight }}
            />
          </>
        ) : (
          <>
            <ActionCard
              title="КУРСЫ"
              icon="book-outline"
              onPress={() => router.push('/(tabs)/explore')}
              style={{ width: cardWidth, height: cardHeight }}
            />
            <ActionCard
              title="РАСПИСАНИЕ"
              icon="time-outline"
              onPress={() => router.push('/(tabs)/schedule')}
              style={{ width: cardWidth, height: cardHeight }}
            />
            <ActionCard
              title="ЗАДАНИЯ"
              icon="list-outline"
              onPress={() => router.push('/(tabs)/explore')}
              style={{ width: cardWidth, height: cardHeight }}
            />
            <ActionCard
              title="ОЦЕНКИ"
              icon="analytics-outline"
              onPress={() => router.push('/(tabs)/profile')}
              style={{ width: cardWidth, height: cardHeight }}
            />
          </>
        )}
      </View>
    </Animated.View>
  );
});

QuickActionsSection.displayName = 'QuickActionsSection';
