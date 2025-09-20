import { ThemedText } from '@/components/ThemedText';
import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useResponsive } from '@/hooks/useResponsive';
import { fetchEvents, toggleEventRegistration } from '@/store/slices/eventsSlice';
import { Event } from '@/types';
import { getImageUrl } from '@/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Cross-platform Image with retry - мемоизированный компонент
const ImageWithRetry = React.memo(({ uri, style, resizeMode }: { uri?: string; style?: any; resizeMode?: any }) => {
  const [attempt, setAttempt] = React.useState(0);
  const [failed, setFailed] = React.useState(false);

  const reload = () => {
    setFailed(false);
    setAttempt((s) => s + 1);
  };

  // Убираем cache-busting для предотвращения дублирования запросов
  const getUriWithCacheBuster = (baseUri: string) => {
    return baseUri;
  };

  if (!uri) return null;

  if (Platform.OS === 'web') {
    // Extract numeric width/height from style (if provided) to render attributes and avoid layout shift
    let widthAttr: number | undefined;
    let heightAttr: number | undefined;
    if (style && typeof style === 'object') {
      const h = style.height;
      const w = style.width;
      if (typeof h === 'number') heightAttr = Math.round(h as number);
      if (typeof w === 'number') widthAttr = Math.round(w as number);
    }

    // eslint-disable-next-line jsx-a11y/alt-text
    return (
      <div>
        <img
          src={getUriWithCacheBuster(uri)}
          key={`${uri}:${attempt}`}
          style={style}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          {...(widthAttr ? { width: widthAttr } : {})}
          {...(heightAttr ? { height: heightAttr } : {})}
          onLoad={() => {}}
          onError={() => {
            setFailed(true);
          }}
        />
        {failed && (
          <TouchableOpacity onPress={reload} style={{ marginTop: 6 }}>
            <Text style={{ color: '#ff5252', fontWeight: '600' }}>Попробовать ещё раз</Text>
          </TouchableOpacity>
        )}
      </div>
    );
  }

  return (
    <>
      <Image
        key={`${uri}:${attempt}`}
        source={{ uri: getUriWithCacheBuster(uri) }}
        style={style}
        resizeMode={resizeMode}
        onLoad={() => {}}
        onError={() => {
          setFailed(true);
        }}
      />
      {failed && (
        <TouchableOpacity onPress={reload} style={{ marginTop: 6 }}>
          <Text style={{ color: '#ff5252', fontWeight: '600' }}>Попробовать ещё раз</Text>
        </TouchableOpacity>
      )}
    </>
  );
});

const CATEGORIES = [
  { key: 'all', label: 'Все', icon: 'grid-outline' },
  { key: 'university', label: 'Университет', icon: 'school-outline' },
  { key: 'club', label: 'Клубы', icon: 'people-outline' },
  { key: 'conference', label: 'Конференции', icon: 'megaphone-outline' },
  { key: 'social', label: 'Социальные', icon: 'heart-outline' },
  { key: 'sport', label: 'Спорт', icon: 'fitness-outline' },
];

export default function EventsScreen() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const colors = getThemeColors(isDarkMode);
  const insets = useSafeAreaInsets();
  const { isSmallScreen, spacing, fontSize, isVerySmallScreen, isExtraSmallScreen } = useResponsive();
  const dispatch = useAppDispatch();
  
  
  const { items: events } = useAppSelector((state) => state.events);
  const [filter, setFilter] = useState('all');

  // Мемоизированная фильтрация событий для оптимизации производительности
  const filteredEvents = React.useMemo(() => {
    if (!Array.isArray(events)) return [];
    if (filter === 'all') return events;
    return events.filter(event => event.category === filter);
  }, [events, filter]);

  // Ref для отслеживания размонтирования компонента
  const isMountedRef = React.useRef(true);

  // Cleanup при размонтировании
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Мемоизированная функция для изменения фильтра
  const handleFilterChange = React.useCallback((categoryKey: string) => {
    if (isMountedRef.current) {
      setFilter(categoryKey);
    }
  }, []);

  // Загружаем события при открытии страницы
  React.useEffect(() => {
    let isCancelled = false;

    const loadEvents = async () => {
      try {
        if (!isCancelled && isMountedRef.current) {
          await dispatch(fetchEvents()).unwrap();
        }
      } catch (error) {
        if (!isCancelled && isMountedRef.current) {
          console.error('Failed to load events:', error);
        }
      }
    };

    loadEvents();

    return () => {
      isCancelled = true;
    };
  }, [dispatch]);

  

  const getCategoryColor = React.useCallback((category: string) => {
    switch (category) {
      case 'university': return colors.primary;
      case 'club': return '#8B5CF6';
      case 'conference': return '#EF4444';
      case 'social': return '#EC4899';
      case 'sport': return '#10B981';
      default: return colors.textSecondary;
    }
  }, [colors.primary, colors.textSecondary]);

  const getCategoryLabel = React.useCallback((category: string) => {
    switch (category) {
      case 'university': return 'Университет';
      case 'club': return 'Клубы';
      case 'conference': return 'Конференция';
      case 'social': return 'Социальное';
      case 'sport': return 'Спорт';
      default: return 'Событие';
    }
  }, []);

  const formatDate = React.useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru', {
      day: 'numeric',
      month: 'short',
    });
  }, []);

  const formatTime = React.useCallback((timeString: string) => {
    return timeString.slice(0, 5);
  }, []);

  const handleToggleRegistration = React.useCallback((eventId: string) => {
    if (isMountedRef.current) {
      dispatch(toggleEventRegistration(eventId));
    }
  }, [dispatch]);

  const handleEventPress = React.useCallback((eventId: string) => {
    if (isMountedRef.current) {
      router.push(`/events/${eventId}`);
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Градиентный фон */}
      <LinearGradient
        colors={isDarkMode 
          ? ['#0F172A', '#1E293B', '#334155']
          : ['#FAFAFA', '#F8FAFC', '#EEF2F7']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      <View style={{ flex: 1 }}>
        {/* Современный Header */}
        <Animated.View 
          entering={FadeInUp.duration(600).springify()}
          style={[styles.header, { 
            paddingHorizontal: spacing.lg,
            paddingTop: insets.top + 10 // Контент заголовка под Dynamic Island + 10px
          }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 4,
              height: 32,
              backgroundColor: colors.primary,
              borderRadius: 2,
              marginRight: spacing.sm
            }} />
            <ThemedText style={[styles.title, { 
              fontSize: isExtraSmallScreen ? fontSize.title - 2 : isVerySmallScreen ? fontSize.title : isSmallScreen ? 24 : 28,
              lineHeight: isExtraSmallScreen ? 20 : isVerySmallScreen ? 24 : isSmallScreen ? 30 : 34, // Добавляем lineHeight чтобы текст не обрезался
              letterSpacing: -0.5,
              color: colors.text,
            }]}>
              События
            </ThemedText>
          </View>
          <TouchableOpacity 
            style={[
              styles.searchButton, 
              { 
                backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                width: isExtraSmallScreen ? 32 : isVerySmallScreen ? 36 : isSmallScreen ? 40 : 44,
                height: isExtraSmallScreen ? 32 : isVerySmallScreen ? 36 : isSmallScreen ? 40 : 44,
                borderRadius: isExtraSmallScreen ? 8 : isVerySmallScreen ? 10 : isSmallScreen ? 12 : 14,
                borderWidth: 1,
                borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
                alignItems: 'center',
                justifyContent: 'center',
              }
            ]}
          >
            <Ionicons name="search" size={isExtraSmallScreen ? 14 : isVerySmallScreen ? 16 : isSmallScreen ? 18 : 20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        </Animated.View>

        {/* Красивый Category Filter */}
        <Animated.View 
          entering={SlideInRight.delay(200).duration(800)}
          style={{ marginBottom: -10 }}
        >
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={[styles.categoryContainer, { paddingHorizontal: spacing.lg }]}
            contentContainerStyle={[styles.categoryContent, { paddingBottom: 0 }]}
          >
            {CATEGORIES.map((category, index) => (
              <Animated.View
                key={category.key}
                entering={FadeInUp.delay(300 + index * 50).duration(500)}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: 'transparent',
                      borderRadius: isVerySmallScreen ? 14 : isSmallScreen ? 16 : 18,
                      marginRight: spacing.sm,
                      marginBottom: 0,
                      overflow: 'hidden',
                    }
                  ]}
                  onPress={() => handleFilterChange(category.key)}
                >
                  <LinearGradient
                    colors={filter === category.key 
                      ? isDarkMode 
                        ? ['rgba(99,102,241,0.8)', 'rgba(139,92,246,0.7)']
                        : ['rgba(99,102,241,0.9)', 'rgba(139,92,246,0.8)']
                      : isDarkMode 
                        ? ['rgba(30,41,59,0.8)', 'rgba(51,65,85,0.6)']
                        : ['rgba(255,255,255,0.9)', 'rgba(248,250,252,0.8)']
                    }
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : spacing.lg,
                      paddingVertical: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : spacing.md,
                      borderRadius: isVerySmallScreen ? 14 : isSmallScreen ? 16 : 18,
                      borderWidth: 1,
                      borderColor: filter === category.key 
                        ? isDarkMode ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)'
                        : isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons 
                      name={category.icon as keyof typeof Ionicons.glyphMap} 
                      size={isVerySmallScreen ? 14 : isSmallScreen ? 16 : 18} 
                      color={filter === category.key 
                        ? '#ffffff' 
                        : isDarkMode ? '#E2E8F0' : '#475569'
                      } 
                    />
                    <ThemedText
                      style={[
                        styles.categoryText,
                        {
                          color: filter === category.key 
                            ? '#ffffff' 
                            : isDarkMode ? '#E2E8F0' : '#475569',
                          fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? 14 : 15,
                          marginLeft: 6,
                        }
                      ]}
                    >
                      {category.label}
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Адаптивный Events List */}
        <ScrollView 
          style={[styles.eventsList, { 
            paddingHorizontal: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : spacing.lg, 
            marginTop: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : spacing.lg 
          }]} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingBottom: isVerySmallScreen ? 160 : isSmallScreen ? 140 : 120, // Увеличиваем отступ для новой высоты табов 
            paddingTop: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : spacing.lg 
          }}
        >
          <Animated.View entering={FadeInDown.delay(400).duration(800)}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event: Event, index) => (
                <Animated.View 
                  key={event.id} 
                  entering={FadeInUp.delay(index * 50).duration(300)}
                  style={[styles.eventCard, {
                    backgroundColor: 'transparent',
                    borderRadius: isVerySmallScreen ? 16 : isSmallScreen ? 20 : 24,
                    marginBottom: spacing.md,
                    padding: 0,
                    overflow: 'hidden',
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 6,
                    // Исправлена минимальная высота для лучшей адаптивности
                    minHeight: isExtraSmallScreen ? 280 : isVerySmallScreen ? 300 : isSmallScreen ? 350 : 420,
                    // Добавлены защитные стили
                    maxWidth: '100%',
                    width: '100%',
                  }]}
                >
                  <Pressable onPress={() => handleEventPress(event.id)} style={{ flex: 1 }}>
                    {/* Современный фон карточки */}
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: colors.surface,
                        borderRadius: isVerySmallScreen ? 16 : isSmallScreen ? 20 : 24,
                        borderWidth: 1,
                        borderColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
                      }}
                    />
                    
                    {/* Содержимое карточки в flex контейнере */}
                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                      {/* Верхняя часть - изображение и содержимое */}
                      <View>
                        {/* Адаптивное Event Image */}
                        {event.image && (
                          <View style={{ position: 'relative' }}>
                            {/* Image (no debug UI) */}
                            <Pressable
                              onPress={() => router.push(`/events/${event.id}`)}
                              style={{ width: '100%' }}
                              hitSlop={8}
                            >
                              <ImageWithRetry
                                uri={getImageUrl(event.image) || undefined}
                                style={{
                                  width: '100%',
                                  height: isExtraSmallScreen ? 80 : isVerySmallScreen ? 100 : isSmallScreen ? 120 : 140,
                                  borderTopLeftRadius: isExtraSmallScreen ? 14 : isVerySmallScreen ? 16 : isSmallScreen ? 20 : 24,
                                  borderTopRightRadius: isExtraSmallScreen ? 14 : isVerySmallScreen ? 16 : isSmallScreen ? 20 : 24,
                                  // prevent stretching on web
                                  objectFit: Platform.OS === 'web' ? 'cover' : undefined,
                                }}
                                resizeMode="cover"
                              />
                            </Pressable>
                            {/* Градиентный оверлей на изображение */}
                            <LinearGradient
                              colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.5)']}
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 50,
                              }}
                            />
                          </View>
                        )}
                      
                        <View style={{
                          padding: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : spacing.lg,
                          // Защитные стили для контейнера
                          width: '100%',
                          maxWidth: '100%',
                          overflow: 'hidden',
                        }}>
                          {/* Event Header */}
                          <View style={styles.eventHeader}>
                            <View style={styles.eventInfo}>
                              <ThemedText style={[styles.eventTitle, { 
                                color: colors.text,
                                fontSize: isVerySmallScreen ? fontSize.body : isSmallScreen ? 16 : 18,
                                marginBottom: spacing.sm,
                              }]}>
                                {event.title}
                              </ThemedText>
                              <View style={styles.eventMeta}>
                                <LinearGradient
                                  colors={[`${getCategoryColor(event.category)}30`, `${getCategoryColor(event.category)}20`]}
                                  style={[
                                    styles.categoryBadge,
                                    { 
                                      paddingHorizontal: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : spacing.md,
                                      paddingVertical: isVerySmallScreen ? 4 : isSmallScreen ? spacing.xs : spacing.sm,
                                      borderRadius: isVerySmallScreen ? 10 : isSmallScreen ? 12 : 16,
                                      borderWidth: 1,
                                      borderColor: `${getCategoryColor(event.category)}40`,
                                    }
                                  ]}
                                >
                                  <ThemedText style={[
                                    styles.categoryBadgeText,
                                    { 
                                      color: getCategoryColor(event.category),
                                      fontSize: isVerySmallScreen ? fontSize.small - 2 : isSmallScreen ? 11 : 12,
                                    }
                                  ]}>
                                    {getCategoryLabel(event.category)}
                                  </ThemedText>
                                </LinearGradient>
                              </View>
                            </View>
                            
                            <View style={styles.eventDate}>
                              <ThemedText style={[styles.dateText, { 
                                color: colors.primary,
                                fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? 12 : 14,
                              }]}>
                                {formatDate(event.date)}
                              </ThemedText>
                              <ThemedText style={[styles.timeText, { 
                                color: colors.textSecondary,
                                fontSize: isVerySmallScreen ? fontSize.small - 1 : isSmallScreen ? 11 : 12,
                              }]}>
                                {formatTime(event.time)}
                              </ThemedText>
                            </View>
                          </View>

                          {/* Event Description */}
                          <ThemedText style={[styles.eventDescription, { 
                            color: colors.textSecondary,
                            fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? 14 : 15,
                            lineHeight: isVerySmallScreen ? 16 : isSmallScreen ? 18 : 20,
                            marginBottom: spacing.md,
                          }]}>
                            {event.description}
                          </ThemedText>

                          {/* Event Details */}
                          <View style={[styles.eventDetails, { marginBottom: spacing.md }]}>
                            <View style={styles.detailRow}>
                              <Ionicons name="location-outline" size={isVerySmallScreen ? 12 : isSmallScreen ? 14 : 16} color={colors.textSecondary} />
                              <ThemedText style={[styles.detailText, { 
                                color: colors.textSecondary,
                                fontSize: isVerySmallScreen ? fontSize.small - 1 : isSmallScreen ? 13 : 14,
                                marginLeft: 6,
                              }]}>
                                {event.location}
                              </ThemedText>
                            </View>
                            
                            {event.maxParticipants && (
                              <View style={styles.detailRow}>
                                <Ionicons name="people-outline" size={isVerySmallScreen ? 12 : isSmallScreen ? 14 : 16} color={colors.textSecondary} />
                                <ThemedText style={[styles.detailText, { 
                                  color: colors.textSecondary,
                                  fontSize: isVerySmallScreen ? fontSize.small - 1 : isSmallScreen ? 13 : 14,
                                  marginLeft: 6,
                                }]}>
                                  {event.currentParticipants} / {event.maxParticipants} участников
                                </ThemedText>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>

                      {/* Registration Button - Упрощенный и надежный дизайн */}
                      <View style={{ 
                        padding: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : spacing.lg,
                        paddingTop: 0,
                      }}>
                        <TouchableOpacity
                          style={[
                            styles.registerButton,
                            {
                              backgroundColor: event.isRegistered 
                                ? 'transparent'
                                : colors.primary,
                              borderRadius: isExtraSmallScreen ? 10 : isVerySmallScreen ? 12 : isSmallScreen ? 16 : 20,
                              borderWidth: event.isRegistered ? 2 : 0,
                              borderColor: event.isRegistered ? colors.primary : 'transparent',
                              paddingVertical: isExtraSmallScreen ? 10 : isVerySmallScreen ? 12 : isSmallScreen ? 14 : 16,
                              paddingHorizontal: isExtraSmallScreen ? 12 : isVerySmallScreen ? 16 : isSmallScreen ? 20 : 24,
                              shadowColor: event.isRegistered ? 'transparent' : colors.primary,
                              shadowOffset: { width: 0, height: event.isRegistered ? 0 : 4 },
                              shadowOpacity: event.isRegistered ? 0 : 0.3,
                              shadowRadius: event.isRegistered ? 0 : 8,
                              elevation: event.isRegistered ? 0 : 4,
                              // Защитные стили для предотвращения overflow
                              alignSelf: 'stretch',
                              width: '100%',
                              maxWidth: '100%',
                              overflow: 'hidden',
                            }
                          ]}
                          onPress={() => handleToggleRegistration(event.id)}
                          activeOpacity={0.8}
                        >
                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                          }}>
                            <Ionicons 
                              name={event.isRegistered ? "checkmark-circle" : "add-circle"} 
                              size={isExtraSmallScreen ? 14 : isVerySmallScreen ? 16 : isSmallScreen ? 18 : 20} 
                              color={event.isRegistered ? colors.primary : '#fff'}
                              style={{ marginRight: 8 }}
                            />
                            <ThemedText
                              style={[
                                styles.registerButtonText,
                                {
                                  color: event.isRegistered ? colors.primary : '#fff',
                                  fontSize: isExtraSmallScreen ? fontSize.body - 1 : isVerySmallScreen ? fontSize.body : isSmallScreen ? 15 : 16,
                                  fontWeight: '600',
                                  textAlign: 'center',
                                  flex: 1,
                                }
                              ]}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {event.isRegistered ? 'Вы записаны' : 'Записаться'}
                            </ThemedText>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              ))
            ) : (
              <Animated.View 
                entering={FadeInDown.duration(800).delay(600)}
                style={{
                  backgroundColor: 'transparent',
                  borderRadius: isSmallScreen ? 20 : 24,
                  padding: spacing.xl,
                  alignItems: 'center',
                  marginTop: spacing.lg,
                  overflow: 'hidden',
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: colors.surface,
                    borderRadius: isSmallScreen ? 20 : 24,
                    borderWidth: 1,
                    borderColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
                  }}
                />
                
                <LinearGradient
                  colors={isDarkMode 
                    ? ['rgba(99,102,241,0.2)', 'rgba(139,92,246,0.2)']
                    : ['rgba(99,102,241,0.1)', 'rgba(139,92,246,0.1)']
                  }
                  style={{
                    width: isSmallScreen ? 80 : 100,
                    height: isSmallScreen ? 80 : 100,
                    borderRadius: isSmallScreen ? 20 : 26,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.lg,
                    borderWidth: 1,
                    borderColor: isDarkMode ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)',
                  }}
                >
                  <Ionicons name="calendar-outline" size={isSmallScreen ? 32 : 40} color={isDarkMode ? '#A5B4FC' : '#6366F1'} />
                </LinearGradient>
                
                <ThemedText style={{
                  fontSize: isSmallScreen ? 16 : 18,
                  color: colors.text,
                  textAlign: 'center',
                  marginBottom: spacing.sm,
                }}>
                  Событий не найдено
                </ThemedText>
                <ThemedText style={{
                  fontSize: isSmallScreen ? 14 : 15,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  lineHeight: isSmallScreen ? 18 : 20,
                }}>
                  Попробуйте изменить фильтр или вернуться позже
                </ThemedText>
              </Animated.View>
            )}
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  searchButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryContent: {
    paddingRight: 24,
    paddingBottom: 0,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontWeight: '600',
  },
  eventsList: {
    flex: 1,
  },
  eventCard: {
    // Dynamic styles applied inline
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventInfo: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontWeight: 'bold',
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    // Dynamic styles applied inline
  },
  categoryBadgeText: {
    fontWeight: '600',
  },
  eventDate: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontWeight: 'bold',
  },
  timeText: {
    marginTop: 2,
  },
  eventDescription: {
    lineHeight: 20,
  },
  eventDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    flex: 1,
  },
  registerButton: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 16,
    overflow: 'hidden',
    // Защитные стили для кнопки
    maxWidth: '100%',
    minHeight: 40, // Уменьшена минимальная высота для экстремально маленьких экранов
  },
  registerButtonText: {
    textAlign: 'center',
    fontWeight: '600',
    // Защитные стили для текста
    maxWidth: '100%',
    overflow: 'hidden',
  },
});