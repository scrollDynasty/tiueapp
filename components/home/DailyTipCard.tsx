import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ThemedText } from '../ThemedText';

interface DailyTipCardProps {
  tip?: string;
}

export const DailyTipCard = React.memo(({ tip }: DailyTipCardProps) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const { spacing, typography, borderRadius, isSmall } = useResponsive();

  const defaultTip = "Стремитесь не к успеху, а к ценностям, которые он дает.";

  const styles = StyleSheet.create({
    container: {
      marginTop: spacing.lg,
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
      // Оптимизированные тени для платформ
      ...Platform.select({
        android: {
          elevation: 3,
          shadowColor: 'transparent',
        },
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDarkMode ? 0.3 : 0.15,
          shadowRadius: 16,
          elevation: 12,
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDarkMode ? 0.3 : 0.15,
          shadowRadius: 16,
          elevation: 12,
        },
      }),
    },
    content: {
      padding: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    iconContainer: {
      backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.15)',
      width: isSmall ? 44 : 52,
      height: isSmall ? 44 : 52,
      borderRadius: isSmall ? 22 : 26,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    headerTextContainer: {
      flex: 1,
    },
    title: {
      fontSize: typography.md,
      fontWeight: '600',
      color: isDarkMode ? colors.text : '#FFFFFF',
      marginBottom: 2,
    },
    subtitle: {
      fontSize: typography.sm,
      color: isDarkMode ? colors.textSecondary : 'rgba(255,255,255,0.8)',
    },
    tipText: {
      fontSize: typography.md,
      lineHeight: isSmall ? 22 : 24,
      fontWeight: '500',
      color: isDarkMode ? colors.text : '#FFFFFF',
      fontStyle: 'italic',
      opacity: 0.95,
    },
  });

  return (
    <Animated.View 
      entering={FadeInDown.delay(700)}
      style={styles.container}
    >
      <LinearGradient
        colors={isDarkMode 
          ? ['#4C1D95', '#3730A3', '#1E40AF']
          : ['#667eea', '#764ba2', '#5B73DD']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: borderRadius.xl }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name="bulb" 
                size={isSmall ? 22 : 26} 
                color={isDarkMode ? colors.primary : "#FFFFFF"} 
              />
            </View>
            <View style={styles.headerTextContainer}>
              <ThemedText style={styles.title}>
                Совет дня
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Мотивация для успешного обучения
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.tipText}>
            "{tip || defaultTip}"
          </ThemedText>
        </View>
      </LinearGradient>
    </Animated.View>
  );
});

DailyTipCard.displayName = 'DailyTipCard';
