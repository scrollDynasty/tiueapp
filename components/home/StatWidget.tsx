import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ThemedText } from '../ThemedText';

interface StatWidgetProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  color: string;
}

export const StatWidget = React.memo(({ icon, title, value, color }: StatWidgetProps) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const { isSmall, spacing, typography, borderRadius } = useResponsive();

  const containerStyle = React.useMemo(() => ({
    backgroundColor: isDarkMode ? colors.surfaceSecondary : colors.surface,
    borderRadius: borderRadius.md,
    padding: isSmall ? spacing.xs : spacing.sm,
    flex: 1,
    marginHorizontal: spacing.xs / 2,
    // Оптимизированные тени для платформ
    ...Platform.select({
      android: {
        elevation: isSmall ? 1 : 2,
        shadowColor: 'transparent',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: isSmall ? 1 : 2 },
        shadowOpacity: isDarkMode ? 0.12 : 0.04,
        shadowRadius: isSmall ? 4 : 8,
        elevation: isSmall ? 2 : 4,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: isSmall ? 1 : 2 },
        shadowOpacity: isDarkMode ? 0.12 : 0.04,
        shadowRadius: isSmall ? 4 : 8,
        elevation: isSmall ? 2 : 4,
      },
    }),
    borderLeftWidth: 2,
    borderLeftColor: color,
    borderWidth: isDarkMode ? 1 : 0,
    borderColor: isDarkMode ? colors.border : 'transparent',
    minHeight: isSmall ? 65 : 80,
    maxWidth: isSmall ? '32%' as const : undefined, // Ограничиваем ширину для предотвращения переноса
    alignSelf: 'stretch' as const,
  }), [isDarkMode, colors, isSmall, color, spacing, borderRadius]);

  const headerStyle = React.useMemo(() => ({ 
    flexDirection: isSmall ? 'column' as const : 'row' as const, 
    alignItems: 'center' as const, 
    marginBottom: spacing.xs,
    justifyContent: 'center' as const
  }), [isSmall, spacing]);

  const iconContainerStyle = React.useMemo(() => ({
    backgroundColor: isDarkMode ? `${color}25` : `${color}15`,
    width: isSmall ? 24 : 28,
    height: isSmall ? 24 : 28,
    borderRadius: borderRadius.sm,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: isSmall ? 0 : spacing.xs,
    marginBottom: isSmall ? spacing.xs : 0,
  }), [isDarkMode, color, isSmall, spacing, borderRadius]);

  const titleStyle = React.useMemo(() => ({
    fontSize: isSmall ? typography.xs - 1 : typography.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.2,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
    lineHeight: isSmall ? 12 : 14,
    numberOfLines: 1,
    flexShrink: 1,
  }), [colors.textSecondary, typography, isSmall]);

  const valueStyle = React.useMemo(() => ({
    fontSize: isSmall ? typography.md : typography.lg,
    fontWeight: '700' as const,
    color: colors.text,
    textAlign: 'center' as const,
    lineHeight: isSmall ? typography.md + 2 : typography.lg + 2,
    numberOfLines: 1,
    flexShrink: 1,
  }), [isSmall, colors.text, typography]);

  return (
    <Animated.View entering={FadeInDown.delay(200)} style={containerStyle}>
      <View style={headerStyle}>
        <View style={iconContainerStyle}>
          <Ionicons name={icon} size={isSmall ? 14 : 16} color={color} />
        </View>
        {!isSmall && (
          <ThemedText 
            style={titleStyle}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.8}
          >
            {title}
          </ThemedText>
        )}
      </View>
      <ThemedText 
        style={valueStyle}
        numberOfLines={1}
        adjustsFontSizeToFit={true}
        minimumFontScale={0.7}
      >
        {value}
      </ThemedText>
      {isSmall && (
        <ThemedText 
          style={[titleStyle, { marginTop: 2 }]}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.6}
        >
          {title}
        </ThemedText>
      )}
    </Animated.View>
  );
});

StatWidget.displayName = 'StatWidget';
