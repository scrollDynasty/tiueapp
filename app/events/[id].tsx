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

export default function EventDetailScreen() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const colors = getThemeColors(isDarkMode);
  
  const { id } = useLocalSearchParams();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const { isSmallScreen, spacing, fontSize } = useResponsive();
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  
  // Приводим ID к строке и ищем событие
  const eventId = Array.isArray(id) ? id[0] : id;
  const eventItems = useAppSelector(state => state.events.items);
  
  const event = eventItems.find(item => {
    // Приводим оба ID к строке для сравнения
    const itemIdString = String(item.id);
    const searchIdString = String(eventId);
    return itemIdString === searchIdString;
  });

  if (!event) {
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
            <Ionicons name="calendar-outline" size={isSmallScreen ? 48 : 64} color={colors.textSecondary} />
            <ThemedText style={{ 
              fontSize: isSmallScreen ? 18 : 20,
              color: colors.textSecondary,
              marginTop: isSmallScreen ? spacing.md : Spacing.m,
              textAlign: 'center'
            }}>
              Событие не найдено
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'university': return colors.primary;
      case 'club': return '#8B5CF6';
      case 'conference': return '#EF4444';
      case 'social': return '#EC4899';
      case 'sport': return '#10B981';
      default: return colors.primary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'university': return 'school-outline';
      case 'club': return 'people-outline';
      case 'conference': return 'megaphone-outline';
      case 'social': return 'heart-outline';
      case 'sport': return 'fitness-outline';
      default: return 'calendar-outline';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'university': return 'Университет';
      case 'club': return 'Клубы';
      case 'conference': return 'Конференции';
      case 'social': return 'Социальные';
      case 'sport': return 'Спорт';
      default: return 'Событие';
    }
  };

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
      {/* Красивое изображение с header поверх */}
      {event.image ? (
        <View style={{ position: 'relative' }}>
          <Animated.View entering={FadeInUp.duration(600)}>
            <Pressable onPress={() => setImageModalVisible(true)}>
              <Image
                source={{ uri: event.image }}
                style={{
                  width: '100%',
                  height: isSmallScreen ? 250 : 300,
                  backgroundColor: colors.surfaceSecondary,
                }}
                resizeMode="cover"
              />
            </Pressable>
          </Animated.View>
          
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

          {/* Красивый header поверх изображения */}
          <SafeAreaView style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}>
            <Animated.View 
              entering={FadeInUp.delay(100).duration(600)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: isSmallScreen ? spacing.md : Spacing.m,
                paddingTop: Platform.OS === 'ios' ? 0 : (isSmallScreen ? spacing.sm : Spacing.s),
                minHeight: isSmallScreen ? 56 : 64,
              }}
            >
              <Pressable
                onPress={() => router.back()}
                style={{
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: 20,
                  width: isSmallScreen ? 40 : 44,
                  height: isSmallScreen ? 40 : 44,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Ionicons name="arrow-back" size={isSmallScreen ? 20 : 24} color="white" />
              </Pressable>
            </Animated.View>
          </SafeAreaView>
        </View>
      ) : (
        // Если нет изображения, показываем обычный header
        <SafeAreaView>
          <Animated.View 
            entering={FadeInUp.delay(100).duration(600)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: isSmallScreen ? spacing.md : Spacing.m,
              paddingVertical: isSmallScreen ? spacing.sm : Spacing.s,
              minHeight: isSmallScreen ? 56 : 64,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                width: isSmallScreen ? 40 : 44,
                height: isSmallScreen ? 40 : 44,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: isDarkMode ? '#000' : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDarkMode ? 0.3 : 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="arrow-back" size={isSmallScreen ? 20 : 24} color={colors.text} />
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      )}

      {/* Контент страницы */}
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: isSmallScreen ? spacing.xl : Spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          entering={FadeInDown.delay(200).duration(600)}
          style={{
            backgroundColor: colors.surface,
            marginHorizontal: isSmallScreen ? spacing.md : Spacing.m,
            marginTop: isSmallScreen ? spacing.md : Spacing.m,
            borderRadius: isSmallScreen ? 20 : 24,
            padding: isSmallScreen ? spacing.lg : Spacing.l,
            shadowColor: isDarkMode ? '#000' : '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {/* Категория события */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: isSmallScreen ? spacing.md : Spacing.m,
          }}>
            <View style={{
              backgroundColor: getCategoryColor(event.category),
              borderRadius: 20,
              paddingHorizontal: isSmallScreen ? 12 : 14,
              paddingVertical: isSmallScreen ? 6 : 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons 
                name={getCategoryIcon(event.category) as any} 
                size={isSmallScreen ? 14 : 16} 
                color="white" 
                style={{ marginRight: isSmallScreen ? 4 : 6 }}
              />
              <ThemedText style={{
                color: 'white',
                fontSize: isSmallScreen ? fontSize.small : fontSize.body,
                fontWeight: '600',
              }}>
                {getCategoryLabel(event.category)}
              </ThemedText>
            </View>
          </View>

          {/* Заголовок */}
          <ThemedText style={{
            fontSize: isSmallScreen ? fontSize.title : fontSize.header,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: isSmallScreen ? spacing.md : Spacing.m,
            lineHeight: isSmallScreen ? fontSize.title * 1.3 : fontSize.header * 1.3,
          }}>
            {event.title}
          </ThemedText>

          {/* Информация о событии */}
          <View style={{
            backgroundColor: colors.surfaceSecondary,
            borderRadius: isSmallScreen ? 12 : 16,
            padding: isSmallScreen ? spacing.md : Spacing.m,
            marginBottom: isSmallScreen ? spacing.lg : Spacing.l,
          }}>
            {/* Дата и время */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: isSmallScreen ? spacing.sm : Spacing.s,
            }}>
              <Ionicons name="calendar" size={isSmallScreen ? 18 : 20} color={colors.primary} />
              <ThemedText style={{
                fontSize: isSmallScreen ? fontSize.small : fontSize.body,
                color: colors.text,
                marginLeft: isSmallScreen ? spacing.sm : Spacing.s,
                fontWeight: '500',
              }}>
                {event.date} в {event.time}
              </ThemedText>
            </View>

            {/* Место */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: isSmallScreen ? spacing.sm : Spacing.s,
            }}>
              <Ionicons name="location" size={isSmallScreen ? 18 : 20} color={colors.primary} />
              <ThemedText style={{
                fontSize: isSmallScreen ? fontSize.small : fontSize.body,
                color: colors.text,
                marginLeft: isSmallScreen ? spacing.sm : Spacing.s,
                fontWeight: '500',
              }}>
                {event.location}
              </ThemedText>
            </View>

            {/* Количество участников */}
            {event.maxParticipants && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Ionicons name="people" size={isSmallScreen ? 18 : 20} color={colors.primary} />
                <ThemedText style={{
                  fontSize: isSmallScreen ? fontSize.small : fontSize.body,
                  color: colors.text,
                  marginLeft: isSmallScreen ? spacing.sm : Spacing.s,
                  fontWeight: '500',
                }}>
                  Максимум участников: {event.maxParticipants}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Описание события */}
          <ThemedText style={{
            fontSize: isSmallScreen ? fontSize.body : fontSize.title,
            color: colors.text,
            lineHeight: isSmallScreen ? fontSize.body * 1.5 : fontSize.title * 1.5,
            marginBottom: isSmallScreen ? spacing.lg : Spacing.l,
          }}>
            {event.description}
          </ThemedText>

          {/* Кнопка регистрации */}
          <Pressable
            style={({ pressed }) => ({
              backgroundColor: pressed ? colors.secondary : colors.primary,
              borderRadius: isSmallScreen ? 12 : 16,
              paddingVertical: isSmallScreen ? spacing.md : Spacing.m,
              paddingHorizontal: isSmallScreen ? spacing.lg : Spacing.l,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
            onPress={() => {
              // Здесь должна быть логика регистрации на событие
              console.log('Регистрация на событие:', event.id);
            }}
          >
            <Ionicons name="add-circle" size={isSmallScreen ? 20 : 24} color="white" />
            <ThemedText style={{
              color: 'white',
              fontSize: isSmallScreen ? fontSize.body : fontSize.title,
              fontWeight: '600',
              marginLeft: isSmallScreen ? spacing.sm : Spacing.s,
            }}>
              Зарегистрироваться
            </ThemedText>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* Модальное окно для просмотра изображения */}
      {event.image && (
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
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Image
                source={{ uri: event.image }}
                style={{
                  width: viewportWidth - (isSmallScreen ? 40 : 60),
                  height: viewportHeight - (isSmallScreen ? 120 : 150),
                }}
                resizeMode="contain"
              />
              <Pressable
                onPress={() => setImageModalVisible(false)}
                style={{
                  position: 'absolute',
                  top: Platform.OS === 'ios' ? 0 : (isSmallScreen ? spacing.md : Spacing.m),
                  right: isSmallScreen ? spacing.md : Spacing.m,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: 20,
                  width: isSmallScreen ? 40 : 44,
                  height: isSmallScreen ? 40 : 44,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="close" size={isSmallScreen ? 20 : 24} color="white" />
              </Pressable>
            </SafeAreaView>
          </View>
        </Modal>
      )}
    </LinearGradient>
  );
}