import { ThemedText } from '@/components/ThemedText';
import { Spacing } from '@/constants/DesignTokens';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  showArrow?: boolean;
  rightComponent?: React.ReactNode;
}

export const SettingsItem = React.memo(({ 
  title, 
  subtitle, 
  icon, 
  onPress, 
  showArrow = true, 
  rightComponent 
}: SettingsItemProps) => {
  const { isDarkMode } = useTheme();
  const { isSmallScreen, spacing, fontSize, isVerySmallScreen } = useResponsive();
  
  const handlePress = React.useCallback(() => {
    if (onPress) {
      onPress();
    }
  }, [onPress]);
  
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        backgroundColor: pressed 
          ? isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
          : isDarkMode ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
        borderRadius: isVerySmallScreen ? 10 : isSmallScreen ? 11 : 12,
        padding: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
        marginBottom: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      })}
    >
      <View
        style={{
          width: isVerySmallScreen ? 34 : isSmallScreen ? 36 : 38,
          height: isVerySmallScreen ? 34 : isSmallScreen ? 36 : 38,
          borderRadius: isVerySmallScreen ? 8 : isSmallScreen ? 9 : 10,
          backgroundColor: isDarkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
        }}
      >
        <Ionicons 
          name={icon} 
          size={isVerySmallScreen ? 18 : isSmallScreen ? 19 : 20} 
          color={isDarkMode ? '#8B5CF6' : '#6366F1'} 
        />
      </View>

      <View style={{ flex: 1 }}>
        <ThemedText
          style={{
            fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? fontSize.body : 16,
            color: isDarkMode ? '#F1F5F9' : '#000000',
            marginBottom: subtitle ? 2 : 0,
          }}
        >
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText
            style={{
              fontSize: isVerySmallScreen ? 11 : isSmallScreen ? 12 : 13,
              color: isDarkMode ? '#94A3B8' : '#4A5568',
            }}
          >
            {subtitle}
          </ThemedText>
        )}
      </View>

      {rightComponent || (showArrow && (
        <Ionicons 
          name="chevron-forward" 
          size={isVerySmallScreen ? 16 : isSmallScreen ? 17 : 18} 
          color={isDarkMode ? '#64748B' : '#94A3B8'} 
        />
      ))}
    </Pressable>
  );
});

SettingsItem.displayName = 'SettingsItem';