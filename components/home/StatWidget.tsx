import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
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
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    flex: 1,
    marginHorizontal: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: isSmall ? 2 : 4 },
    shadowOpacity: isDarkMode ? 0.15 : 0.06,
    shadowRadius: isSmall ? 8 : 12,
    elevation: isSmall ? 3 : 6,
    borderLeftWidth: 3,
    borderLeftColor: color,
    borderWidth: isDarkMode ? 1 : 0,
    borderColor: isDarkMode ? colors.border : 'transparent',
    minHeight: isSmall ? 70 : 85,
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
    fontSize: typography.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
    fontWeight: '500' as const,
  }), [colors.textSecondary, typography]);

  const valueStyle = React.useMemo(() => ({
    fontSize: isSmall ? typography.lg : typography.xl,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center' as const,
  }), [isSmall, colors.text, typography]);

  return (
    <Animated.View entering={FadeInDown.delay(200)} style={containerStyle}>
      <View style={headerStyle}>
        <View style={iconContainerStyle}>
          <Ionicons name={icon} size={isSmall ? 14 : 16} color={color} />
        </View>
        {!isSmall && (
          <ThemedText style={titleStyle}>
            {title}
          </ThemedText>
        )}
      </View>
      <ThemedText style={valueStyle}>
        {value}
      </ThemedText>
    </Animated.View>
  );
});

StatWidget.displayName = 'StatWidget';
