import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { useAppSelector } from '@/hooks/redux';
import { useColorScheme } from '@/hooks/useColorScheme';
import { News } from '@/types';
import { selectNewsItems } from '@/types/redux';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const news = useAppSelector(selectNewsItems);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'announcement': return 'megaphone-outline';
      case 'news': return 'newspaper-outline';
      case 'academic': return 'school-outline';
      case 'events': return 'calendar-outline';
      default: return 'information-circle-outline';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'announcement': return 'Объявление';
      case 'news': return 'Новости';
      case 'academic': return 'Академическое';
      case 'events': return 'События';
      default: return 'Информация';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>Новости</ThemedText>
        <TouchableOpacity style={[styles.searchButton, { backgroundColor: colors.surfaceSecondary }]}>
          <Ionicons name="search" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* News List */}
      <ScrollView style={styles.newsList} showsVerticalScrollIndicator={false}>
        <View style={styles.newsContainer}>
          {news && news.length > 0 ? (
            news.map((newsItem: News) => (
              <Card key={newsItem.id} style={styles.newsCard}>
                <TouchableOpacity style={styles.newsItem}>
                  {/* News Image */}
                  {newsItem.image && (
                    <Image 
                      source={{ uri: newsItem.image }}
                      style={styles.newsImage}
                      resizeMode="cover"
                    />
                  )}
                  
                  <View style={styles.newsContent}>
                    {/* News Header */}
                    <View style={styles.newsHeader}>
                      <View style={[
                        styles.categoryBadge,
                        { 
                          backgroundColor: newsItem.isImportant 
                            ? `${colors.error}20` 
                            : `${colors.primary}20`
                        }
                      ]}>
                        <Ionicons 
                          name={getCategoryIcon(newsItem.category) as keyof typeof Ionicons.glyphMap} 
                          size={12} 
                          color={newsItem.isImportant ? colors.error : colors.primary} 
                        />
                        <ThemedText style={[
                          styles.categoryText,
                          { color: newsItem.isImportant ? colors.error : colors.primary }
                        ]}>
                          {getCategoryLabel(newsItem.category)}
                        </ThemedText>
                        {newsItem.isImportant && (
                          <Ionicons name="flame" size={12} color={colors.error} />
                        )}
                      </View>
                      
                      <ThemedText style={[styles.newsDate, { color: colors.textSecondary }]}>
                        {formatDate(newsItem.date)}
                      </ThemedText>
                    </View>

                    {/* News Title */}
                    <ThemedText style={[styles.newsTitle, { color: colors.text }]}>
                      {newsItem.title}
                    </ThemedText>

                    {/* News Content */}
                    <ThemedText 
                      style={[styles.newsText, { color: colors.textSecondary }]}
                      numberOfLines={3}
                    >
                      {newsItem.content}
                    </ThemedText>

                    {/* News Footer */}
                    <View style={styles.newsFooter}>
                      <View style={styles.authorInfo}>
                        <Ionicons name="person-circle-outline" size={16} color={colors.textSecondary} />
                        <ThemedText style={[styles.authorText, { color: colors.textSecondary }]}>
                          {newsItem.author}
                        </ThemedText>
                      </View>
                      
                      <TouchableOpacity style={styles.readMoreButton}>
                        <ThemedText style={[styles.readMoreText, { color: colors.primary }]}>
                          Читать далее
                        </ThemedText>
                        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons name="newspaper-outline" size={64} color={colors.textSecondary} />
                <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
                  Нет новостей
                </ThemedText>
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Новости и объявления появятся здесь
                </ThemedText>
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsList: {
    flex: 1,
  },
  newsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  newsCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  newsItem: {
    flex: 1,
  },
  newsImage: {
    width: '100%',
    height: 180,
  },
  newsContent: {
    padding: 16,
    gap: 12,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  newsDate: {
    fontSize: 12,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  newsText: {
    fontSize: 15,
    lineHeight: 22,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 12,
    marginLeft: 4,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCard: {
    padding: 32,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
