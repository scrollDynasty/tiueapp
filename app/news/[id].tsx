import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { getThemeColors } from '@/constants/Colors';
import { Spacing } from '@/constants/DesignTokens';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { authApi } from '@/services/api';


export default function NewsDetailScreen() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const colors = getThemeColors(isDarkMode);
  
  const { id } = useLocalSearchParams();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isSmallScreen, spacing, fontSize, isVerySmallScreen } = useResponsive();
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // Динамическая высота изображения, которая обновляется при изменении размера окна/экрана
  const baseImageHeight = (isVerySmallScreen ? 0.3 : isSmallScreen ? 0.35 : 0.4) * viewportHeight;
  const imageHeight = Math.max(180, Math.min(baseImageHeight, 520));
  
  // Стабилизируем newsId для предотвращения лишних перерендеров
  const newsId = React.useMemo(() => {
    return Array.isArray(id) ? id[0] : id;
  }, [id]);

  // Используем ref для отслеживания состояния загрузки и предотвращения дублированных запросов
  const loadingRef = React.useRef(false);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadNews = React.useCallback(async () => {
    if (!newsId || loadingRef.current) {
      return; // Предотвращаем дублированные запросы
    }

    try {
      loadingRef.current = true;
      if (isMountedRef.current) {
        setLoading(true);
      }
      
      const response = await authApi.getNewsById(newsId);
      
      if (isMountedRef.current && response.success && response.data) {
        setNews(response.data);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Error loading news:', error);
      }
    } finally {
      loadingRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [newsId]);

  useEffect(() => {
    if (newsId && !news) { // Загружаем только если новость еще не загружена
      loadNews();
    }
  }, [newsId, loadNews, news]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <LinearGradient
        colors={isDarkMode 
          ? ['#1E3A8A', '#2563EB', '#3B82F6']
          : ['#EFF6FF', '#DBEAFE', '#BFDBFE']
        }
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={isDarkMode ? '#FFFFFF' : '#1E3A8A'} />
          <ThemedText style={{ 
            fontSize: 16,
            color: isDarkMode ? '#FFFFFF' : '#1E3A8A',
            marginTop: 16,
            textAlign: 'center'
          }}>
            Загрузка новости...
          </ThemedText>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!news) {
    return (
      <LinearGradient
        colors={isDarkMode 
          ? ['#1E3A8A', '#2563EB', '#3B82F6']
          : ['#EFF6FF', '#DBEAFE', '#BFDBFE']
        }
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: isSmallScreen ? spacing.lg : Spacing.xl
          }}>
            <Ionicons name="newspaper-outline" size={isSmallScreen ? 48 : 64} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            <ThemedText style={{ 
              fontSize: isSmallScreen ? 18 : 20,
              color: isDarkMode ? '#94A3B8' : '#64748B',
              marginTop: isSmallScreen ? spacing.md : Spacing.m,
              textAlign: 'center'
            }}>
              Новость не найдена
            </ThemedText>
            <Pressable
              onPress={() => router.back()}
              style={{
                backgroundColor: isDarkMode ? '#2563EB' : '#3B82F6',
                borderRadius: 12,
                paddingHorizontal: isSmallScreen ? spacing.lg : Spacing.l,
                paddingVertical: isSmallScreen ? spacing.md : Spacing.m,
                marginTop: isSmallScreen ? spacing.lg : Spacing.l,
              }}
            >
              <ThemedText style={{
                fontSize: isSmallScreen ? 14 : 16,
                color: 'white'
              }}>
                Назад
              </ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={isDarkMode 
        ? ['#1E3A8A', '#2563EB', '#3B82F6']
        : ['#EFF6FF', '#DBEAFE', '#BFDBFE']
      }
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Адаптивное изображение с наложенным header */}
      {news.image ? (
        <View style={{ position: 'relative' }}>
          <Pressable onPress={() => setImageModalVisible(true)}>
            <Image
              source={{ uri: news.image }}
              style={{
                width: '100%',
                height: imageHeight,
                backgroundColor: colors.surfaceSecondary,
              }}
              resizeMode="cover"
            />
          </Pressable>
          
          {/* Градиент сверху для лучшей читаемости header */}
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent']}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: isVerySmallScreen ? 80 : isSmallScreen ? 100 : 120,
            }}
          />
          
          {/* Градиент снизу для плавного перехода */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: isVerySmallScreen ? 40 : isSmallScreen ? 60 : 80,
            }}
          />

          {/* Адаптивный header поверх изображения */}
          <SafeAreaView style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}>
            <Animated.View 
              entering={FadeInDown.duration(300)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              }}
            >
              <Pressable
                onPress={() => router.back()}
                style={{
                  width: isVerySmallScreen ? 36 : isSmallScreen ? 40 : 44,
                  height: isVerySmallScreen ? 36 : isSmallScreen ? 40 : 44,
                  borderRadius: isVerySmallScreen ? 18 : isSmallScreen ? 20 : 22,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md,
                  ...(Platform.OS === 'ios' && {
                    backdropFilter: 'blur(10px)',
                  }),
                }}
              >
                <Ionicons name="arrow-back" size={isVerySmallScreen ? 18 : isSmallScreen ? 20 : 24} color="white" />
              </Pressable>
              
              <View style={{ flex: 1 }}>
                <ThemedText style={{ 
                  fontSize: isVerySmallScreen ? fontSize.small - 1 : fontSize.small,
                  color: 'rgba(255,255,255,0.8)',
                }}>
                  Новость
                </ThemedText>
                <ThemedText style={{ 
                  fontSize: isVerySmallScreen ? fontSize.small : fontSize.body,
                  color: 'white'
                }} numberOfLines={1}>
                  {news.title}
                </ThemedText>
              </View>
            </Animated.View>
          </SafeAreaView>
        </View>
      ) : (
        // Адаптивный header без изображения
        <SafeAreaView style={{ backgroundColor: 'transparent' }}>
          <Animated.View 
            entering={FadeInDown.duration(300)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              backgroundColor: 'transparent',
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={{
                width: isVerySmallScreen ? 32 : isSmallScreen ? 36 : 40,
                height: isVerySmallScreen ? 32 : isSmallScreen ? 36 : 40,
                borderRadius: isVerySmallScreen ? 16 : isSmallScreen ? 18 : 20,
                backgroundColor: colors.surfaceSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.md,
              }}
            >
              <Ionicons name="arrow-back" size={isVerySmallScreen ? 16 : isSmallScreen ? 18 : 20} color={colors.text} />
            </Pressable>
            
            <View style={{ flex: 1 }}>
              <ThemedText style={{ 
                fontSize: isVerySmallScreen ? fontSize.small - 1 : fontSize.small,
                color: colors.textSecondary 
              }}>
                Новость
              </ThemedText>
              <ThemedText style={{ 
                fontSize: isVerySmallScreen ? fontSize.small : fontSize.body,
              }} numberOfLines={1}>
                {news.title}
              </ThemedText>
            </View>
          </Animated.View>
        </SafeAreaView>
      )}

      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: isVerySmallScreen ? 60 : isSmallScreen ? 80 : 100,
        }}
      >
        {/* Адаптивный контейнер с контентом */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(300)}
          style={{
            backgroundColor: 'transparent',
            borderTopLeftRadius: news.image ? (isVerySmallScreen ? 16 : isSmallScreen ? 20 : 24) : 0,
            borderTopRightRadius: news.image ? (isVerySmallScreen ? 16 : isSmallScreen ? 20 : 24) : 0,
            marginTop: news.image ? (isVerySmallScreen ? -12 : isSmallScreen ? -16 : -20) : 0,
            paddingTop: news.image ? (isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : spacing.xl) : spacing.md,
            paddingHorizontal: isVerySmallScreen ? spacing.md : spacing.lg,
            position: 'relative',
            zIndex: 5,
          }}
        >
          {/* Красивая мета информация */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            marginBottom: spacing.lg,
            flexWrap: 'wrap'
          }}>
            <View style={{
              backgroundColor: colors.primary + '15',
              borderRadius: isVerySmallScreen ? 12 : isSmallScreen ? 16 : 20,
              paddingHorizontal: isVerySmallScreen ? spacing.sm : spacing.md,
              paddingVertical: isVerySmallScreen ? spacing.xs : spacing.sm,
              marginRight: spacing.sm,
              marginBottom: spacing.sm,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons name={news.icon as any} size={isVerySmallScreen ? 12 : isSmallScreen ? 14 : 16} color={colors.primary} />
              <ThemedText style={{ 
                fontSize: isVerySmallScreen ? fontSize.small - 2 : fontSize.small - 1,
                color: colors.primary,
                marginLeft: 6,
              }}>
                {news.category}
              </ThemedText>
            </View>
            
            <View style={{
              backgroundColor: colors.surfaceSecondary,
              borderRadius: isVerySmallScreen ? 12 : isSmallScreen ? 16 : 20,
              paddingHorizontal: isVerySmallScreen ? spacing.sm : spacing.md,
              paddingVertical: isVerySmallScreen ? spacing.xs : spacing.sm,
              marginBottom: spacing.sm,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons name="time-outline" size={isVerySmallScreen ? 12 : isSmallScreen ? 14 : 16} color={colors.textSecondary} />
              <ThemedText style={{ 
                fontSize: isVerySmallScreen ? fontSize.small - 2 : fontSize.small - 1,
                color: colors.textSecondary,
                marginLeft: 6,
              }}>
                {formatDate(news.created_at || news.date)}
              </ThemedText>
            </View>
          </View>

          {/* Адаптивный заголовок */}
          <ThemedText style={{
            fontSize: isVerySmallScreen ? fontSize.title : isSmallScreen ? 22 : 28,
            color: colors.text,
            lineHeight: isVerySmallScreen ? 24 : isSmallScreen ? 28 : 36,
            marginBottom: spacing.lg,
            letterSpacing: -0.5,
          }}>
            {news.title}
          </ThemedText>

          {/* Адаптивный подзаголовок */}
          {news.subtitle && (
            <ThemedText style={{
              fontSize: isVerySmallScreen ? fontSize.body : isSmallScreen ? 16 : 18,
              color: colors.textSecondary,
              lineHeight: isVerySmallScreen ? 20 : isSmallScreen ? 22 : 26,
              marginBottom: spacing.xl,
            }}>
              {news.subtitle}
            </ThemedText>
          )}

          {/* Адаптивный контент */}
          <ThemedText style={{
            fontSize: isVerySmallScreen ? fontSize.small : fontSize.body,
            color: colors.text,
            lineHeight: isVerySmallScreen ? 20 : isSmallScreen ? 22 : 24,
            marginBottom: spacing.xl,
          }}>
            {news.content}
          </ThemedText>

          {/* Адаптивная информация об авторе */}
          <View style={{
            backgroundColor: colors.surfaceSecondary,
            borderRadius: isVerySmallScreen ? 10 : isSmallScreen ? 12 : 16,
            padding: isVerySmallScreen ? spacing.md : spacing.lg,
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDarkMode ? 0.3 : 0.05,
            shadowRadius: 8,
            elevation: 2,
            marginBottom: spacing.xl,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: isVerySmallScreen ? 32 : isSmallScreen ? 36 : 40,
                height: isVerySmallScreen ? 32 : isSmallScreen ? 36 : 40,
                borderRadius: isVerySmallScreen ? 16 : isSmallScreen ? 18 : 20,
                backgroundColor: colors.primary + '15',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.md,
              }}>
                <Ionicons name="person" size={isVerySmallScreen ? 16 : isSmallScreen ? 18 : 20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ 
                  fontSize: isVerySmallScreen ? fontSize.small - 1 : fontSize.small,
                  color: colors.textSecondary,
                }}>
                  Опубликовано
                </ThemedText>
                <ThemedText style={{ 
                  fontSize: isVerySmallScreen ? fontSize.small : fontSize.body,
                  color: colors.text
                }}>
                  Администрация университета
                </ThemedText>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Модальное окно для полноэкранного просмотра изображения */}
      {news.image && (
        <Modal
          visible={imageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.9)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Pressable
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              onPress={() => setImageModalVisible(false)}
            />
            
            <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.md,
                paddingTop: spacing.lg, // Увеличиваем отступ сверху
                paddingBottom: spacing.sm,
              }}>
                <Pressable
                  onPress={() => setImageModalVisible(false)}
                  style={{
                    width: isVerySmallScreen ? 36 : isSmallScreen ? 40 : 44,
                    height: isVerySmallScreen ? 36 : isSmallScreen ? 40 : 44,
                    borderRadius: isVerySmallScreen ? 18 : isSmallScreen ? 20 : 22,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="close" size={isVerySmallScreen ? 18 : isSmallScreen ? 20 : 24} color="white" />
                </Pressable>
              </View>
            </SafeAreaView>
            
            <Image
              source={{ uri: news.image }}
              style={{
                width: Math.min(viewportWidth * (isVerySmallScreen ? 0.98 : isSmallScreen ? 0.95 : 0.9), 1200),
                height: Math.min(viewportHeight * (isVerySmallScreen ? 0.65 : isSmallScreen ? 0.7 : 0.8), 1000),
              }}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </LinearGradient>
  );
}
