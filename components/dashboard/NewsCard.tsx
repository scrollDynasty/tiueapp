import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card } from 'react-native-paper';
import { ThemedText } from '../ThemedText';

interface NewsItem {
  id: number;
  title: string;
  description: string;
  image: string | null;
  date: string;
}

interface NewsCardProps {
  news: NewsItem[];
  onNewsPress?: (newsId: number) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, onNewsPress }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  const styles = StyleSheet.create({
    card: {
      margin: 8,
      backgroundColor: isDarkMode ? '#1E3A8A' : '#FFFFFF',
      borderRadius: 12,
      elevation: 3,
    },
    cardContent: {
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFFFFF' : '#1E3A8A',
      marginBottom: 12,
    },
    newsItem: {
      marginBottom: 16,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    newsImageContainer: {
      position: 'relative',
      width: '100%',
      height: 160,
    },
    newsImage: {
      width: '100%',
      height: '100%',
      backgroundColor: isDarkMode ? '#334155' : '#E2E8F0',
    },
    newsImagePlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: isDarkMode ? '#3B82F6' : '#E2E8F0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    newsOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      padding: 12,
    },
    newsTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 4,
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    newsDescription: {
      fontSize: 13,
      color: '#E2E8F0',
      marginBottom: 6,
      lineHeight: 18,
    },
    newsDate: {
      fontSize: 12,
      color: '#94A3B8',
      fontWeight: '500',
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <ThemedText style={styles.title}>Новости</ThemedText>
        {news.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.newsItem}
            onPress={() => onNewsPress?.(item.id)}
          >
            <View style={styles.newsImageContainer}>
              {item.image ? (
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.newsImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.newsImagePlaceholder}>
                  <Ionicons 
                    name="newspaper-outline" 
                    size={40} 
                    color={isDarkMode ? '#FFFFFF' : '#64748B'} 
                  />
                </View>
              )}
              <View style={styles.newsOverlay}>
                <ThemedText style={styles.newsTitle} numberOfLines={2}>
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.newsDescription} numberOfLines={2}>
                  {item.description}
                </ThemedText>
                <ThemedText style={styles.newsDate}>
                  {formatDate(item.date)}
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        ))
      }
    </Card.Content>
    </Card>
  );
};
