import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing } from '@/constants/DesignTokens';
import { useAppSelector } from '@/hooks/redux';
import { useResponsive } from '@/hooks/useResponsive';
import { formatDateYMD } from '@/utils/date';

export default function NewsDetailScreen() {
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
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: isSmallScreen ? spacing.lg : Spacing.xl
        }}>
          <Ionicons name="newspaper-outline" size={isSmallScreen ? 48 : 64} color={Colors.textSecondary} />
          <ThemedText style={{ 
            fontSize: isSmallScreen ? 18 : 20,
            fontWeight: '600',
            color: Colors.textSecondary,
            marginTop: isSmallScreen ? spacing.md : Spacing.m,
            textAlign: 'center'
          }}>
            Новость не найдена
          </ThemedText>
          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: Colors.brandPrimary,
              borderRadius: 12,
              paddingHorizontal: isSmallScreen ? spacing.lg : Spacing.l,
              paddingVertical: isSmallScreen ? spacing.md : Spacing.m,
              marginTop: isSmallScreen ? spacing.lg : Spacing.l,
            }}
          >
            <ThemedText style={{ color: Colors.surface, fontWeight: '600' }}>
              Назад
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Адаптивное изображение с наложенным header */}
      {news.image ? (
        <View style={{ position: 'relative' }}>
          <Pressable onPress={() => setImageModalVisible(true)}>
            <Image
              source={{ uri: news.image }}
              style={{
                width: '100%',
                height: imageHeight,
                backgroundColor: Colors.surfaceSubtle,
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
                  fontWeight: '500'
                }}>
                  Новость
                </ThemedText>
                <ThemedText style={{ 
                  fontSize: isSmallScreen ? 14 : 16,
                  fontWeight: '600',
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
        <SafeAreaView style={{ backgroundColor: Colors.surface }}>
          <Animated.View 
            entering={FadeInDown.duration(300)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              backgroundColor: Colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: Colors.strokeSoft,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={{
                width: isSmallScreen ? 36 : 40,
                height: isSmallScreen ? 36 : 40,
                borderRadius: isSmallScreen ? 18 : 20,
                backgroundColor: Colors.surfaceSubtle,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.md,
              }}
            >
              <Ionicons name="arrow-back" size={isSmallScreen ? 18 : 20} color={Colors.textPrimary} />
            </Pressable>
            
            <View style={{ flex: 1 }}>
              <ThemedText style={{ 
                fontSize: isSmallScreen ? 12 : 14,
                color: Colors.textSecondary 
              }}>
                Новость
              </ThemedText>
              <ThemedText style={{ 
                fontSize: isSmallScreen ? 14 : 16,
                fontWeight: '600' 
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
            backgroundColor: Colors.surface,
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
              backgroundColor: Colors.brandPrimary + '15',
              borderRadius: isSmallScreen ? 16 : 20,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              marginRight: spacing.sm,
              marginBottom: spacing.sm,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons name={news.icon as any} size={isSmallScreen ? 14 : 16} color={Colors.brandPrimary} />
              <ThemedText style={{ 
                fontSize: isSmallScreen ? 11 : 12,
                color: Colors.brandPrimary,
                fontWeight: '600',
                marginLeft: 6,
              }}>
                {news.category}
              </ThemedText>
            </View>
            
            <View style={{
              backgroundColor: Colors.surfaceSubtle,
              borderRadius: isSmallScreen ? 16 : 20,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              marginBottom: spacing.sm,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons name="time-outline" size={isSmallScreen ? 14 : 16} color={Colors.textSecondary} />
              <ThemedText style={{ 
                fontSize: isSmallScreen ? 11 : 12,
                color: Colors.textSecondary,
                fontWeight: '500',
                marginLeft: 6,
              }}>
                {formatDateYMD(news.date)}
              </ThemedText>
            </View>
          </View>

          {/* Адаптивный заголовок */}
          <ThemedText style={{
            fontSize: isSmallScreen ? 22 : 28,
            fontWeight: '700',
            color: Colors.textPrimary,
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
              fontWeight: '500',
              color: Colors.textSecondary,
              lineHeight: isSmallScreen ? 22 : 26,
              marginBottom: spacing.xl,
            }}>
              {news.subtitle}
            </ThemedText>
          )}

          {/* Адаптивный контент */}
          <ThemedText style={{
            fontSize: isSmallScreen ? 15 : 16,
            fontWeight: '400',
            color: Colors.textPrimary,
            lineHeight: isSmallScreen ? 22 : 24,
            marginBottom: spacing.xl,
          }}>
            {news.content}
          </ThemedText>

          {/* Адаптивная информация об авторе */}
          <View style={{
            backgroundColor: Colors.surfaceSubtle,
            borderRadius: isSmallScreen ? 12 : 16,
            padding: spacing.lg,
            borderLeftWidth: 4,
            borderLeftColor: Colors.brandPrimary,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
            marginBottom: spacing.xl,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: isSmallScreen ? 36 : 40,
                height: isSmallScreen ? 36 : 40,
                borderRadius: isSmallScreen ? 18 : 20,
                backgroundColor: Colors.brandPrimary + '15',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.md,
              }}>
                <Ionicons name="person" size={isSmallScreen ? 18 : 20} color={Colors.brandPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ 
                  fontSize: isSmallScreen ? 12 : 14,
                  color: Colors.textSecondary,
                  fontWeight: '500'
                }}>
                  Опубликовано
                </ThemedText>
                <ThemedText style={{ 
                  fontSize: isSmallScreen ? 14 : 16,
                  fontWeight: '600',
                  color: Colors.textPrimary
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
    </View>
  );
}
