import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { NewsCard } from '../NewsCard';
import { ThemedText } from '../ThemedText';

interface News {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  image?: string;
  events?: any[];
  icon?: string;
}

interface NewsSectionProps {
  news: News[];
}

export const NewsSection = React.memo(({ news }: NewsSectionProps) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const { spacing, typography, borderRadius, isSmall } = useResponsive();

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    title: {
      fontSize: typography.lg,
      fontWeight: '600',
      color: colors.text,
    },
    counter: {
      backgroundColor: isDarkMode ? `${colors.primary}20` : colors.surface,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.2 : 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    counterText: {
      fontSize: typography.sm - 1,
      fontWeight: '500',
      color: isDarkMode ? colors.primary : '#0369A1',
    },
    newsContainer: {
      gap: spacing.sm,
    },
    emptyState: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      alignItems: 'center',
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
    emptyIconContainer: {
      backgroundColor: isDarkMode ? `${colors.primary}20` : '#F3F4F6',
      width: isSmall ? 60 : 70,
      height: isSmall ? 60 : 70,
      borderRadius: isSmall ? 30 : 35,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    emptyTitle: {
      fontSize: typography.md,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    emptySubtitle: {
      fontSize: typography.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  return (
    <Animated.View entering={SlideInRight.delay(600)} style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>
          Последние новости
        </ThemedText>
        <View style={styles.counter}>
          <ThemedText style={styles.counterText}>
            {news.length} новостей
          </ThemedText>
        </View>
      </View>

      <View style={styles.newsContainer}>
        {news.length > 0 ? (
          news.slice(0, 5).map((newsItem, index) => (
            <NewsCard
              key={newsItem.id}
              title={newsItem.title}
              subtitle={newsItem.subtitle}
              date={newsItem.date}
              image={newsItem.image}
              events={newsItem.events || []}
              icon={newsItem.icon as any}
              index={index}
              onPress={() => router.push(`/news/${newsItem.id}`)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons 
                name="newspaper-outline" 
                size={isSmall ? 28 : 32} 
                color={colors.primary} 
              />
            </View>
            <ThemedText style={styles.emptyTitle}>
              Новостей пока нет
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Скоро здесь появятся последние новости университета
            </ThemedText>
          </View>
        )}
      </View>
    </Animated.View>
  );
});

NewsSection.displayName = 'NewsSection';
