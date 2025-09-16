import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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

interface ImportantNewsSectionProps {
  news: News[];
}

export const ImportantNewsSection = React.memo(({ news }: ImportantNewsSectionProps) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const { spacing, typography, borderRadius } = useResponsive();

  if (news.length === 0) {
    return null;
  }

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
    viewAllButton: {
      backgroundColor: isDarkMode ? `${colors.warning}20` : '#FEF3C7',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.xl,
    },
    viewAllText: {
      fontSize: typography.sm,
      fontWeight: '500',
      color: isDarkMode ? colors.warning : '#D97706',
    },
    newsContainer: {
      gap: spacing.sm,
    },
  });

  return (
    <Animated.View entering={SlideInRight.delay(500)} style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>
          ⚡ Важные новости
        </ThemedText>
        <Pressable
          style={styles.viewAllButton}
          onPress={() => router.push('/news')}
        >
          <ThemedText style={styles.viewAllText}>
            Все новости
          </ThemedText>
        </Pressable>
      </View>
      
      <View style={styles.newsContainer}>
        {news.map((newsItem, index) => (
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
        ))}
      </View>
    </Animated.View>
  );
});

ImportantNewsSection.displayName = 'ImportantNewsSection';
