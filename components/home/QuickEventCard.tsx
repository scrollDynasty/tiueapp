import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { formatDateYMD } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, View } from 'react-native';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { ThemedText } from '../ThemedText';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
}

interface QuickEventCardProps {
  event: Event;
  index: number;
}

export const QuickEventCard = React.memo(({ event, index }: QuickEventCardProps) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const { isVerySmallScreen, spacing, fontSize } = useResponsive();

  const cardStyle = React.useMemo(() => ({
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: isVerySmallScreen ? spacing.sm : spacing.md,
    marginBottom: spacing.sm,
    // Оптимизированные тени для платформ
    ...Platform.select({
      android: {
        elevation: 2,
        shadowColor: 'transparent',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 4,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  }), [colors, isVerySmallScreen, spacing]);

  const titleStyle = React.useMemo(() => ({
    fontSize: fontSize.body,
    color: colors.text,
    marginBottom: spacing.xs,
  }), [fontSize, colors, spacing]);

  const dateContainerStyle = React.useMemo(() => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 2
  }), []);

  const dateTextStyle = React.useMemo(() => ({
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginLeft: 4,
  }), [fontSize, colors]);

  const locationContainerStyle = React.useMemo(() => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const
  }), []);

  const categoryContainerStyle = React.useMemo(() => ({
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: spacing.xs,
  }), [colors, spacing]);

  const categoryTextStyle = React.useMemo(() => ({
    fontSize: fontSize.small - 1,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
  }), [fontSize, colors]);

  return (
    <Animated.View
      entering={SlideInRight.delay(400 + index * 100)}
      style={cardStyle}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <ThemedText style={titleStyle} numberOfLines={2}>
            {event.title}
          </ThemedText>
          <View style={dateContainerStyle}>
            <Ionicons name="calendar-outline" size={10} color={colors.textSecondary} />
            <ThemedText style={dateTextStyle}>
              {formatDateYMD(event.date)}
            </ThemedText>
          </View>
          <View style={locationContainerStyle}>
            <Ionicons name="location-outline" size={10} color={colors.textSecondary} />
            <ThemedText style={dateTextStyle} numberOfLines={1}>
              {event.location}
            </ThemedText>
          </View>
        </View>
        <View style={categoryContainerStyle}>
          <ThemedText style={categoryTextStyle}>
            {event.category}
          </ThemedText>
        </View>
      </View>
    </Animated.View>
  );
});

QuickEventCard.displayName = 'QuickEventCard';
