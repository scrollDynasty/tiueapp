import { ThemedText } from '@/components/ThemedText';
import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useResponsive } from '@/hooks/useResponsive';
import { fetchEvents, toggleEventRegistration } from '@/store/slices/eventsSlice';
import { Event } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const { isSmallScreen, spacing, fontSize, isVerySmallScreen } = useResponsive();
  const dispatch = useAppDispatch();
  
  const { items: events } = useAppSelector((state) => state.events);
  const [filter, setFilter] = useState('all');

  // Загружаем события при открытии страницы
  React.useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);
  
  const filteredEvents = events.filter((event: Event) => {
    if (filter === 'all') return true;
    return event.category === filter;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'university': return colors.primary;
      case 'club': return '#8B5CF6';
      case 'conference': return '#EF4444';
      case 'social': return '#EC4899';
      case 'sport': return '#10B981';
      default: return colors.textSecondary;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'university': return 'Университет';
      case 'club': return 'Клубы';
      case 'conference': return 'Конференция';
      case 'social': return 'Социальное';
      case 'sport': return 'Спорт';
      default: return 'Событие';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

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
      
      <SafeAreaView style={{ flex: 1 }}>
        {/* Современный Header */}
        <Animated.View 
          entering={FadeInUp.duration(600).springify()}
          style={[styles.header, { paddingHorizontal: spacing.lg }]}
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
              fontSize: isVerySmallScreen ? fontSize.title : isSmallScreen ? 24 : 28,
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
                width: isVerySmallScreen ? 36 : isSmallScreen ? 40 : 44,
                height: isVerySmallScreen ? 36 : isSmallScreen ? 40 : 44,
                borderRadius: isVerySmallScreen ? 10 : isSmallScreen ? 12 : 14,
                borderWidth: 1,
                borderColor: isDarkMode ? '#4B5563' : '#D1D5DB',
                alignItems: 'center',
                justifyContent: 'center',
              }
            ]}
          >
            <Ionicons name="search" size={isVerySmallScreen ? 16 : isSmallScreen ? 18 : 20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
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
                  onPress={() => setFilter(category.key)}
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
          style={[styles.eventsList, { paddingHorizontal: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : spacing.lg, marginTop: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : spacing.lg }]} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingBottom: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : spacing.lg, 
            paddingTop: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : spacing.lg 
          }}
        >
          <Animated.View entering={FadeInDown.delay(400).duration(800)}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event: Event, index) => (
                <Animated.View 
                  key={event.id} 
                  entering={FadeInUp.delay(500 + index * 100).duration(600).springify()}
                  style={[styles.eventCard, {
                    backgroundColor: 'transparent',
                    borderRadius: isVerySmallScreen ? 16 : isSmallScreen ? 20 : 24,
                    marginBottom: spacing.md,
                    padding: 0,
                    overflow: 'hidden',
                    shadowColor: isDarkMode ? '#000' : '#000',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: isDarkMode ? 0.4 : 0.12,
                    shadowRadius: 20,
                    elevation: isDarkMode ? 12 : 8,
                  }]}
                >
                  <Pressable onPress={() => router.push(`/events/${event.id}`)}>
                    {/* Градиентный фон карточки */}
                    <LinearGradient
                      colors={isDarkMode 
                        ? ['rgba(30,41,59,0.9)', 'rgba(51,65,85,0.8)', 'rgba(71,85,105,0.7)']
                        : ['rgba(255,255,255,0.9)', 'rgba(248,250,252,0.8)', 'rgba(241,245,249,0.7)']
                      }
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: isVerySmallScreen ? 16 : isSmallScreen ? 20 : 24,
                        borderWidth: 1,
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                      }}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    
                    {/* Адаптивное Event Image */}
                    {event.image && (
                      <View style={{ position: 'relative' }}>
                        <Image 
                          source={{ uri: event.image }}
                          style={{
                            width: '100%',
                            height: isVerySmallScreen ? 120 : isSmallScreen ? 140 : 160,
                            borderTopLeftRadius: isVerySmallScreen ? 16 : isSmallScreen ? 20 : 24,
                            borderTopRightRadius: isVerySmallScreen ? 16 : isSmallScreen ? 20 : 24,
                          }}
                          resizeMode="cover"
                        />
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
                  </Pressable>

                  {/* Registration Button - Улучшенный дизайн */}
                  <View style={{ padding: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : spacing.lg }}>
                    <TouchableOpacity
                      style={[
                        styles.registerButton,
                        {
                          backgroundColor: 'transparent',
                          borderRadius: isVerySmallScreen ? 16 : isSmallScreen ? 20 : 24,
                          marginTop: isVerySmallScreen ? 12 : isSmallScreen ? 16 : 20,
                          overflow: 'hidden',
                          shadowColor: event.isRegistered ? 'transparent' : colors.primary,
                          shadowOffset: { width: 0, height: event.isRegistered ? 0 : 6 },
                          shadowOpacity: event.isRegistered ? 0 : 0.25,
                          shadowRadius: event.isRegistered ? 0 : 12,
                          elevation: event.isRegistered ? 0 : 6,
                        }
                      ]}
                      onPress={() => dispatch(toggleEventRegistration(event.id))}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={event.isRegistered 
                          ? isDarkMode 
                            ? ['rgba(30,41,59,0.9)', 'rgba(51,65,85,0.7)']
                            : ['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.9)']
                          : [colors.primary, colors.primary + 'E6', colors.primary + 'CC']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: isVerySmallScreen ? 12 : isSmallScreen ? 16 : 20,
                          paddingHorizontal: isVerySmallScreen ? 16 : isSmallScreen ? 24 : 32,
                          borderRadius: isVerySmallScreen ? 16 : isSmallScreen ? 20 : 24,
                          borderWidth: event.isRegistered ? 2 : 0,
                          borderColor: event.isRegistered ? colors.primary + '60' : 'transparent',
                          minHeight: isVerySmallScreen ? 44 : isSmallScreen ? 52 : 60,
                        }}
                      >
                        <View style={{
                          width: isVerySmallScreen ? 20 : isSmallScreen ? 24 : 28,
                          height: isVerySmallScreen ? 20 : isSmallScreen ? 24 : 28,
                          borderRadius: isVerySmallScreen ? 10 : isSmallScreen ? 12 : 14,
                          backgroundColor: event.isRegistered 
                            ? colors.primary + '20' 
                            : 'rgba(255,255,255,0.25)',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                        }}>
                          <Ionicons 
                            name={event.isRegistered ? "checkmark-circle" : "add-circle"} 
                            size={isVerySmallScreen ? 14 : isSmallScreen ? 16 : 18} 
                            color={event.isRegistered ? colors.primary : '#fff'} 
                          />
                        </View>
                        
                        <View style={{ flex: 1, alignItems: 'center' }}>
                          <ThemedText
                            style={[
                              styles.registerButtonText,
                              {
                                color: event.isRegistered ? colors.primary : '#fff',
                                fontSize: isVerySmallScreen ? fontSize.body : isSmallScreen ? 16 : 18,
                                letterSpacing: 0.5,
                                textAlign: 'center',
                              }
                            ]}
                          >
                            {event.isRegistered ? 'Вы записаны' : 'Записаться'}
                          </ThemedText>
                          
                        </View>
                        
                        {!event.isRegistered && (
                          <View style={{
                            position: 'absolute',
                            right: isSmallScreen ? 16 : 20,
                            width: isSmallScreen ? 6 : 8,
                            height: isSmallScreen ? 6 : 8,
                            borderRadius: isSmallScreen ? 3 : 4,
                            backgroundColor: 'rgba(255,255,255,0.8)',
                          }} />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
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
                  shadowColor: isDarkMode ? '#000' : '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isDarkMode ? 0.4 : 0.12,
                  shadowRadius: 20,
                  elevation: isDarkMode ? 12 : 8,
                }}
              >
                <LinearGradient
                  colors={isDarkMode 
                    ? ['rgba(30,41,59,0.8)', 'rgba(51,65,85,0.6)', 'rgba(71,85,105,0.4)']
                    : ['rgba(255,255,255,0.9)', 'rgba(248,250,252,0.8)', 'rgba(241,245,249,0.7)']
                  }
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: isSmallScreen ? 20 : 24,
                    borderWidth: 1,
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
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
      </SafeAreaView>
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
    // Dynamic styles applied inline
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
    // Dynamic styles applied inline
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    // Dynamic styles applied inline
  },
  categoryBadgeText: {
    // Dynamic styles applied inline
  },
  eventDate: {
    alignItems: 'flex-end',
  },
  dateText: {
    // Dynamic styles applied inline
  },
  timeText: {
    marginTop: 2,
  },
  eventDescription: {
    // Dynamic styles applied inline
  },
  eventDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    // Dynamic styles applied inline
  },
  registerButton: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: 20,
    overflow: 'hidden',
  },
  registerButtonText: {
    textAlign: 'center',
    flex: 1,
  },
});