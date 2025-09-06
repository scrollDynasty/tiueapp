import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, Modal, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { Colors, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { useAppSelector } from '@/hooks/redux';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  
  // Приводим ID к строке и ищем новость
  const newsId = Array.isArray(id) ? id[0] : id;
  const newsItems = useAppSelector(state => state.news.items);
  
  const news = newsItems.find(item => {
    // Приводим оба ID к строке для сравнения
    const itemIdString = String(item.id);
    const searchIdString = String(newsId);
    return itemIdString === searchIdString;
  });

  console.log('NewsDetailScreen:', { 
    searchId: newsId, 
    availableNews: newsItems.map(n => ({ id: n.id, title: n.title })),
    foundNews: news 
  });

  if (!news) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: Spacing.xl
        }}>
          <Ionicons name="newspaper-outline" size={64} color={Colors.textSecondary} />
          <ThemedText style={{ 
            ...Typography.titleH2, 
            color: Colors.textSecondary,
            marginTop: Spacing.m,
            textAlign: 'center'
          }}>
            Новость не найдена
          </ThemedText>
          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: Colors.brandPrimary,
              borderRadius: 12,
              paddingHorizontal: Spacing.l,
              paddingVertical: Spacing.m,
              marginTop: Spacing.l,
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
      {/* Полноэкранное изображение с наложенным header */}
      {news.image ? (
        <View style={{ position: 'relative' }}>
          <Pressable onPress={() => setImageModalVisible(true)}>
            <Image
              source={{ uri: news.image }}
              style={{
                width: screenWidth,
                height: screenHeight * 0.4, // 40% высоты экрана
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
              height: 120,
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
              height: 80,
            }}
          />

          {/* Header поверх изображения */}
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
                paddingHorizontal: Spacing.m,
                paddingVertical: Spacing.s,
              }}
            >
              <Pressable
                onPress={() => router.back()}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: Spacing.m,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </Pressable>
              
              <View style={{ flex: 1 }}>
                <ThemedText style={{ 
                  ...Typography.caption, 
                  color: 'rgba(255,255,255,0.8)',
                  fontWeight: '500'
                }}>
                  Новость
                </ThemedText>
                <ThemedText style={{ 
                  ...Typography.body, 
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
        // Обычный header без изображения
        <SafeAreaView style={{ backgroundColor: Colors.surface }}>
          <Animated.View 
            entering={FadeInDown.duration(300)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: Spacing.m,
              paddingVertical: Spacing.s,
              backgroundColor: Colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: Colors.strokeSoft,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: Colors.surfaceSubtle,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: Spacing.m,
              }}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
            </Pressable>
            
            <View style={{ flex: 1 }}>
              <ThemedText style={{ ...Typography.caption, color: Colors.textSecondary }}>
                Новость
              </ThemedText>
              <ThemedText style={{ ...Typography.body, fontWeight: '600' }} numberOfLines={1}>
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
          paddingBottom: 100,
        }}
      >
        {/* Контейнер с контентом */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(300)}
          style={{
            backgroundColor: Colors.surface,
            borderTopLeftRadius: news.image ? 24 : 0,
            borderTopRightRadius: news.image ? 24 : 0,
            marginTop: news.image ? -20 : 0,
            paddingTop: news.image ? Spacing.xl : Spacing.m,
            paddingHorizontal: Spacing.l,
            position: 'relative',
            zIndex: 5,
          }}
        >
          {/* Мета информация */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            marginBottom: Spacing.l,
            flexWrap: 'wrap'
          }}>
            <View style={{
              backgroundColor: Colors.brandPrimary + '15',
              borderRadius: 20,
              paddingHorizontal: Spacing.m,
              paddingVertical: Spacing.s,
              marginRight: Spacing.s,
              marginBottom: Spacing.s,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons name={news.icon as any} size={16} color={Colors.brandPrimary} />
              <ThemedText style={{ 
                ...Typography.caption, 
                color: Colors.brandPrimary,
                fontWeight: '600',
                marginLeft: 6
              }}>
                Объявление
              </ThemedText>
            </View>
            
            <View style={{
              backgroundColor: Colors.surfaceSubtle,
              borderRadius: 20,
              paddingHorizontal: Spacing.m,
              paddingVertical: Spacing.s,
              marginBottom: Spacing.s,
            }}>
              <ThemedText style={{ 
                ...Typography.caption, 
                color: Colors.textSecondary,
                fontWeight: '500'
              }}>
                {news.date && new Date(news.date).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </ThemedText>
            </View>
          </View>

          {/* Заголовок */}
          <ThemedText style={{ 
            ...Typography.displayH1, 
            marginBottom: Spacing.m,
            lineHeight: 36,
            color: Colors.textPrimary
          }}>
            {news.title}
          </ThemedText>

          {/* Подзаголовок */}
          <ThemedText style={{ 
            ...Typography.titleH2, 
            color: Colors.textSecondary,
            lineHeight: 24,
            marginBottom: Spacing.xl,
            fontWeight: '400'
          }}>
            {news.subtitle}
          </ThemedText>

          {/* Разделитель */}
          <View style={{
            height: 1,
            backgroundColor: Colors.strokeSoft,
            marginBottom: Spacing.xl,
          }} />

          {/* Содержание */}
          <ThemedText style={{ 
            ...Typography.body,
            lineHeight: 28,
            color: Colors.textPrimary,
            fontSize: 16,
            marginBottom: Spacing.xl
          }}>
            {news.content}
          </ThemedText>

          {/* Информация об авторе */}
          <View style={{
            backgroundColor: Colors.surfaceSubtle,
            borderRadius: 16,
            padding: Spacing.l,
            borderLeftWidth: 4,
            borderLeftColor: Colors.brandPrimary,
            ...Shadows.card,
            marginBottom: Spacing.xl,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: Colors.brandPrimary + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: Spacing.m,
              }}>
                <Ionicons name="shield-checkmark" size={24} color={Colors.brandPrimary} />
              </View>
              
              <View style={{ flex: 1 }}>
                <ThemedText style={{ 
                  ...Typography.caption, 
                  color: Colors.textSecondary,
                  marginBottom: 2,
                  fontWeight: '500'
                }}>
                  Автор новости
                </ThemedText>
                <ThemedText style={{ 
                  ...Typography.body, 
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
                paddingHorizontal: Spacing.m,
                paddingVertical: Spacing.s,
              }}>
                <Pressable
                  onPress={() => setImageModalVisible(false)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="close" size={24} color="white" />
                </Pressable>
              </View>
            </SafeAreaView>
            
            <Image
              source={{ uri: news.image }}
              style={{
                width: screenWidth,
                height: screenHeight * 0.8,
              }}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </View>
  );
}
