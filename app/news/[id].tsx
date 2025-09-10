import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { getThemeColors } from '@/constants/Colors';
import { Spacing } from '@/constants/DesignTokens';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSelector } from '@/hooks/redux';
import { useResponsive } from '@/hooks/useResponsive';
import { formatDateYMD } from '@/utils/date';

export default function NewsDetailScreen() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const colors = getThemeColors(isDarkMode);
  
  const { id } = useLocalSearchParams();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const { isSmallScreen, spacing, fontSize } = useResponsive();
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  // Динамическая высота изображения, которая обновляется при изменении размера окна/экрана
  const baseImageHeight = (isSmallScreen ? 0.35 : 0.4) * viewportHeight;
  const imageHeight = Math.max(220, Math.min(baseImageHeight, 520));
  
  // Приводим ID к строке и ищем новость
  const newsId = Array.isArray(id) ? id[0] : id;
  const newsItems = useAppSelector(state => state.news.items);
  
  const news = newsItems.find(item => {
    // Приводим оба ID к строке для сравнения
    const itemIdString = String(item.id);
    const searchIdString = String(newsId);
    return itemIdString === searchIdString;
  });

  // Debug logs removed to reduce noise and overhead

  if (!news) {
    return (
      <LinearGradient
        colors={isDarkMode 
          ? ['#0F172A', '#1E293B', '#334155']
          : ['#FFFFFF', '#F8FAFC', '#F1F5F9']
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
            <Ionicons name="newspaper-outline" size={isSmallScreen ? 48 : 64} color={colors.textSecondary} />
            <ThemedText style={{ 
              fontSize: isSmallScreen ? 18 : 20,
              color: colors.textSecondary,
              marginTop: isSmallScreen ? spacing.md : Spacing.m,
              textAlign: 'center'
            }}>
              Новость не найдена
            </ThemedText>
            <Pressable
              onPress={() => router.back()}
              style={{
                backgroundColor: colors.primary,
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
        ? ['#0F172A', '#1E293B', '#334155']
        : ['#FFFFFF', '#F8FAFC', '#F1F5F9']
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
              height: isSmallScreen ? 100 : 120,
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
              height: isSmallScreen ? 60 : 80,
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
                  width: isSmallScreen ? 40 : 44,
                  height: isSmallScreen ? 40 : 44,
                  borderRadius: isSmallScreen ? 20 : 22,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md,
                  ...(Platform.OS === 'ios' && {
                    backdropFilter: 'blur(10px)',
                  }),
                }}
              >
                <Ionicons name="arrow-back" size={isSmallScreen ? 20 : 24} color="white" />
              </Pressable>
              
              <View style={{ flex: 1 }}>
                <ThemedText style={{ 
                  fontSize: isSmallScreen ? 12 : 14,
                  color: 'rgba(255,255,255,0.8)',
                }}>
                  Новость
                </ThemedText>
                <ThemedText style={{ 
                  fontSize: isSmallScreen ? 14 : 16,
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
                width: isSmallScreen ? 36 : 40,
                height: isSmallScreen ? 36 : 40,
                borderRadius: isSmallScreen ? 18 : 20,
                backgroundColor: colors.surfaceSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.md,
              }}
            >
              <Ionicons name="arrow-back" size={isSmallScreen ? 18 : 20} color={colors.text} />
            </Pressable>
            
            <View style={{ flex: 1 }}>
              <ThemedText style={{ 
                fontSize: isSmallScreen ? 12 : 14,
                color: colors.textSecondary 
              }}>
                Новость
              </ThemedText>
              <ThemedText style={{ 
                fontSize: isSmallScreen ? 14 : 16,
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
          paddingBottom: isSmallScreen ? 80 : 100,
        }}
      >
        {/* Адаптивный контейнер с контентом */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(300)}
          style={{
            backgroundColor: 'transparent',
            borderTopLeftRadius: news.image ? (isSmallScreen ? 20 : 24) : 0,
            borderTopRightRadius: news.image ? (isSmallScreen ? 20 : 24) : 0,
            marginTop: news.image ? (isSmallScreen ? -16 : -20) : 0,
            paddingTop: news.image ? (isSmallScreen ? spacing.lg : spacing.xl) : spacing.md,
            paddingHorizontal: spacing.lg,
            position: 'relative',
            zIndex: 5,
          }}
        >
          {/* Адаптивная мета информация */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            marginBottom: spacing.lg,
            flexWrap: 'wrap'
          }}>
            <View style={{
              backgroundColor: colors.primary + '15',
              borderRadius: isSmallScreen ? 16 : 20,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              marginRight: spacing.sm,
              marginBottom: spacing.sm,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons name={news.icon as any} size={isSmallScreen ? 14 : 16} color={colors.primary} />
              <ThemedText style={{ 
                fontSize: isSmallScreen ? 11 : 12,
                color: colors.primary,
                marginLeft: 6,
              }}>
                {news.category}
              </ThemedText>
            </View>
            
            <View style={{
              backgroundColor: colors.surfaceSecondary,
              borderRadius: isSmallScreen ? 16 : 20,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              marginBottom: spacing.sm,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons name="time-outline" size={isSmallScreen ? 14 : 16} color={colors.textSecondary} />
              <ThemedText style={{ 
                fontSize: isSmallScreen ? 11 : 12,
                color: colors.textSecondary,
                marginLeft: 6,
              }}>
                {formatDateYMD(news.date)}
              </ThemedText>
            </View>
          </View>

          {/* Адаптивный заголовок */}
          <ThemedText style={{
            fontSize: isSmallScreen ? 22 : 28,
            color: colors.text,
            lineHeight: isSmallScreen ? 28 : 36,
            marginBottom: spacing.lg,
            letterSpacing: -0.5,
          }}>
            {news.title}
          </ThemedText>

          {/* Адаптивный подзаголовок */}
          {news.subtitle && (
            <ThemedText style={{
              fontSize: isSmallScreen ? 16 : 18,
              color: colors.textSecondary,
              lineHeight: isSmallScreen ? 22 : 26,
              marginBottom: spacing.xl,
            }}>
              {news.subtitle}
            </ThemedText>
          )}

          {/* Адаптивный контент */}
          <ThemedText style={{
            fontSize: isSmallScreen ? 15 : 16,
            color: colors.text,
            lineHeight: isSmallScreen ? 22 : 24,
            marginBottom: spacing.xl,
          }}>
            {news.content}
          </ThemedText>

          {/* Адаптивная информация об авторе */}
          <View style={{
            backgroundColor: colors.surfaceSecondary,
            borderRadius: isSmallScreen ? 12 : 16,
            padding: spacing.lg,
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
                width: isSmallScreen ? 36 : 40,
                height: isSmallScreen ? 36 : 40,
                borderRadius: isSmallScreen ? 18 : 20,
                backgroundColor: colors.primary + '15',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.md,
              }}>
                <Ionicons name="person" size={isSmallScreen ? 18 : 20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ 
                  fontSize: isSmallScreen ? 12 : 14,
                  color: colors.textSecondary,
                }}>
                  Опубликовано
                </ThemedText>
                <ThemedText style={{ 
                  fontSize: isSmallScreen ? 14 : 16,
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
                paddingVertical: spacing.sm,
              }}>
                <Pressable
                  onPress={() => setImageModalVisible(false)}
                  style={{
                    width: isSmallScreen ? 40 : 44,
                    height: isSmallScreen ? 40 : 44,
                    borderRadius: isSmallScreen ? 20 : 22,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="close" size={isSmallScreen ? 20 : 24} color="white" />
                </Pressable>
              </View>
            </SafeAreaView>
            
            <Image
              source={{ uri: news.image }}
              style={{
                width: Math.min(viewportWidth * (isSmallScreen ? 0.95 : 0.9), 1200),
                height: Math.min(viewportHeight * (isSmallScreen ? 0.7 : 0.8), 1000),
              }}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </LinearGradient>
  );
}
