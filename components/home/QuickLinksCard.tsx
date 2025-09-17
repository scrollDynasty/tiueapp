import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ThemedText } from '../ThemedText';

const quickLinks = [
  {
    id: 'help',
    icon: 'help-circle' as const,
    label: 'Помощь',
    color: '#EF4444',
    action: () => {
      alert('Помощь\n\nДля получения помощи обратитесь к администратору или в службу поддержки университета.\n\nТелефон: +7 (xxx) xxx-xx-xx\nEmail: support@university.edu');
    },
  },
  {
    id: 'events',
    icon: 'calendar' as const,
    label: 'События',
    color: '#3B82F6',
    action: () => router.push('/(tabs)/events'),
  },
  {
    id: 'settings',
    icon: 'settings' as const,
    label: 'Настройки', 
    color: '#10B981',
    action: () => router.push('/(tabs)/profile'),
  },
];

export const QuickLinksCard = React.memo(() => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const { spacing, typography, borderRadius, isSmall } = useResponsive();

  const styles = StyleSheet.create({
    container: {
      marginTop: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      // Оптимизированные тени для платформ
      ...Platform.select({
        android: {
          elevation: 2,
          shadowColor: 'transparent',
        },
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDarkMode ? 0.15 : 0.08,
          shadowRadius: 12,
          elevation: 6,
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDarkMode ? 0.15 : 0.08,
          shadowRadius: 12,
          elevation: 6,
        },
      }),
      borderWidth: 1,
      borderColor: isDarkMode ? colors.border : 'transparent',
    },
    linksContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    linkItem: {
      alignItems: 'center',
      flex: 1,
      paddingVertical: spacing.xs,
    },
    iconContainer: {
      width: isSmall ? 40 : 44,
      height: isSmall ? 40 : 44,
      borderRadius: isSmall ? 20 : 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    linkLabel: {
      fontSize: typography.sm,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <Animated.View 
      entering={FadeInDown.delay(800)}
      style={styles.container}
    >
      <View style={styles.linksContainer}>
        {quickLinks.map((link) => (
          <Pressable 
            key={link.id}
            style={styles.linkItem}
            onPress={link.action}
            android_ripple={{ 
              color: `${link.color}20`,
              borderless: false,
              radius: 30
            }}
          >
            <View style={[
              styles.iconContainer,
              { 
                backgroundColor: Platform.OS === 'android' 
                  ? colors.backgroundSecondary // Нейтральный фон на Android
                  : (isDarkMode ? `${link.color}25` : `${link.color}15`) // Цветной на iOS
              }
            ]}>
              <Ionicons 
                name={link.icon} 
                size={isSmall ? 20 : 22} 
                color={Platform.OS === 'android' ? colors.textSecondary : link.color} // Нейтральные иконки на Android
              />
            </View>
            <ThemedText style={styles.linkLabel}>
              {link.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
});

QuickLinksCard.displayName = 'QuickLinksCard';
