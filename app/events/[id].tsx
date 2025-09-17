import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { authApi } from '@/services/api';
import { addEventToCalendar, parseEventDateTime } from '@/utils/calendar';


export default function EventDetailScreen() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const colors = getThemeColors(isDarkMode);
  
  const { id } = useLocalSearchParams();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isSmallScreen, spacing, fontSize, isVerySmallScreen } = useResponsive();
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const eventId = React.useMemo(() => {
    return Array.isArray(id) ? id[0] : id;
  }, [id]);

  const loadingRef = React.useRef(false);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadEvent = React.useCallback(async () => {
    if (!eventId || loadingRef.current) {
      return; // Предотвращаем дублированные запросы
    }

    try {
      loadingRef.current = true;
      if (isMountedRef.current) {
        setLoading(true);
      }
      
      const response = await authApi.getEventById(eventId);
      
      if (isMountedRef.current && response.success && response.data) {
        setEvent(response.data);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Error loading event:', error);
      }
    } finally {
      loadingRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId && !event) { // Загружаем только если событие еще не загружено
      loadEvent();
    }
  }, [eventId, loadEvent, event]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <ThemedText style={{ 
            fontSize: 16,
            color: '#1E3A8A',
            marginTop: 16,
            textAlign: 'center'
          }}>
            Загрузка события...
          </ThemedText>
        </SafeAreaView>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: 32
          }}>
            <Ionicons name="calendar-outline" size={64} color="#94A3B8" />
            <ThemedText style={{ 
              fontSize: 20,
              color: '#64748B',
              marginTop: 16,
              textAlign: 'center'
            }}>
              Событие не найдено
            </ThemedText>
            <Pressable
              onPress={() => router.back()}
              style={{
                backgroundColor: '#3B82F6',
                borderRadius: 12,
                paddingHorizontal: 24,
                paddingVertical: 16,
                marginTop: 24,
              }}
            >
              <ThemedText style={{
                fontSize: 16,
                color: 'white'
              }}>
                Назад
              </ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Функции для категорий больше не нужны в новом дизайне

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* 1. Хэдер с заголовком */}
      <SafeAreaView style={{ backgroundColor: colors.surface }}>
       <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingVertical: 12,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: isVerySmallScreen ? 36 : isSmallScreen ? 40 : 44,
              height: isVerySmallScreen ? 36 : isSmallScreen ? 40 : 44,
              borderRadius: isVerySmallScreen ? 18 : isSmallScreen ? 20 : 22,
              backgroundColor: colors.backgroundSecondary,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: spacing.md,
            }}
          >
            <Ionicons name="arrow-back" size={isVerySmallScreen ? 18 : isSmallScreen ? 20 : 24} color={colors.text} />
          </Pressable>
          <ThemedText style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
          }}>
            Event Details
          </ThemedText>
        </View>
      </SafeAreaView>

      {/* 2. Большая картинка события */}
      <Animated.View entering={FadeInUp.duration(600)}>
        <Pressable onPress={() => setImageModalVisible(true)}>
          {event.image ? (
            <Image
              source={{ uri: event.image }}
              style={{
                width: '100%',
                height: 280,
                backgroundColor: '#E2E8F0',
              }}
              resizeMode="cover"
            />
          ) : (
            <View style={{
              width: '100%',
              height: 280,
              backgroundColor: '#F8FAFC',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="calendar-outline" size={64} color="#94A3B8" />
              <ThemedText style={{
                fontSize: 16,
                color: '#64748B',
                marginTop: 12,
              }}>
                Изображение события
              </ThemedText>
            </View>
          )}
        </Pressable>
      </Animated.View>

      {/* 3, 4, 5. Контент: информация + описание + кнопка */}
      <ScrollView 
        style={{ flex: 1, backgroundColor: '#FFFFFF' }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 3. Информация о событии в карточке */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(600)}
          style={{
            backgroundColor: '#FFFFFF',
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 16,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            borderWidth: 1,
            borderColor: '#E2E8F0',
          }}
        >
          {/* Заголовок события */}
          <ThemedText style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#1E3A8A',
            marginBottom: 20,
            lineHeight: 32,
          }}>
            {event.title}
          </ThemedText>

          {/* Дата и время */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#3B82F6',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            }}>
              <Ionicons name="calendar" size={24} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1E3A8A',
                marginBottom: 2,
              }}>
                {event.date}
              </ThemedText>
              <ThemedText style={{
                fontSize: 14,
                color: '#64748B',
              }}>
                {event.time}
              </ThemedText>
            </View>
          </View>

          {/* Локация */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: event.maxParticipants ? 16 : 0,
          }}>
            <View style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#1E3A8A',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
            }}>
              <Ionicons name="location" size={24} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#1E3A8A',
              }}>
                {event.location}
              </ThemedText>
            </View>
          </View>

          {/* Количество участников (если есть) */}
          {event.maxParticipants && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#10B981',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16,
              }}>
                <Ionicons name="people" size={24} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#1E3A8A',
                }}>
                  Максимум участников: {event.maxParticipants}
                </ThemedText>
              </View>
            </View>
          )}
        </Animated.View>

        {/* 4. Описание события */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(600)}
          style={{
            backgroundColor: '#FFFFFF',
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 16,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
            borderWidth: 1,
            borderColor: '#E2E8F0',
          }}
        >
          <ThemedText style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#1E3A8A',
            marginBottom: 12,
          }}>
            Описание
          </ThemedText>
          <ThemedText style={{
            fontSize: 16,
            color: '#374151',
            lineHeight: 24,
          }}>
            {event.description}
          </ThemedText>
        </Animated.View>

        {/* 5. Кнопка "Add to Calendar" */}
        <Animated.View 
          entering={FadeInDown.delay(600).duration(600)}
          style={{
            marginHorizontal: 16,
            marginTop: 24,
          }}
        >
          <Pressable
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#2563EB' : '#3B82F6',
              borderRadius: 10,
              paddingVertical: 12,
              paddingHorizontal: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
            onPress={async () => {
              try {
                const startDate = parseEventDateTime(event.date, event.time);
                const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // +2 часа
                
                await addEventToCalendar({
                  title: event.title,
                  startDate,
                  endDate,
                  location: event.location,
                  notes: event.description,
                });
              } catch (error) {
                console.error('Ошибка при добавлении в календарь:', error);
              }
            }}
          >
            <Ionicons name="calendar-outline" size={20} color="white" />
            <ThemedText style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600',
              marginLeft: 8,
            }}>
              Добавить в календарь
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
                  width: viewportWidth - (isVerySmallScreen ? 30 : isSmallScreen ? 40 : 60),
                  height: viewportHeight - (isVerySmallScreen ? 100 : isSmallScreen ? 120 : 150),
                }}
                resizeMode="contain"
              />
              <Pressable
                onPress={() => setImageModalVisible(false)}
                style={{
                  position: 'absolute',
                  top: Platform.OS === 'ios' ? insets.top + 20 : (isVerySmallScreen ? spacing.lg : isSmallScreen ? spacing.xl : 40),
                  right: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : 16,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: 20,
                  width: isVerySmallScreen ? 36 : isSmallScreen ? 40 : 44,
                  height: isVerySmallScreen ? 36 : isSmallScreen ? 40 : 44,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="close" size={isVerySmallScreen ? 18 : isSmallScreen ? 20 : 24} color="white" />
              </Pressable>
            </SafeAreaView>
          </View>
        </Modal>
      )}
    </View>
  );
}