import { ActionCard } from '@/components/ActionCard';
import { AnimatedHeader } from '@/components/AnimatedHeader';
import { CustomRefreshControl } from '@/components/CustomRefreshControl';
import { NotificationModal } from '@/components/NotificationModal';
import { ThemedText } from '@/components/ThemedText';
import { CircularChart, CourseProgressCard, EventsCard } from '@/components/dashboard';
import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useResponsive } from '@/hooks/useResponsive';
import { fetchEvents } from '@/store/slices/eventsSlice';
import { fetchNews } from '@/store/slices/newsSlice';
import { formatDateYMD } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInDown,
  SlideInRight,
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const insets = useSafeAreaInsets();
  const { 
    horizontalPadding, 
    cardGap, 
    cardWidth, 
    cardHeight, 
    isVerySmallScreen, 
    isExtraSmallScreen,
    isSmallScreen,
    isLarge,
    fontSize, 
    spacing, 
    width 
  } = useResponsive();
  const { user } = useAppSelector(state => state.auth);
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Загружаем данные при монтировании компонента
  React.useEffect(() => {
    if (user) {
      dispatch(fetchNews());
      dispatch(fetchEvents());
    }
  }, [dispatch, user]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (user) {
        await Promise.all([
          dispatch(fetchNews()).unwrap(),
          dispatch(fetchEvents()).unwrap()
        ]);
      }
    } catch {
      // handle error
    }
    setRefreshing(false);
  }, [dispatch, user]);

  // Получаем новости и события из Redux store
  const { items: newsData } = useAppSelector((state) => state.news);
  const { items: eventsData } = useAppSelector((state) => state.events);

  // Получаем ближайшие события (следующие 3)
  const upcomingEvents = React.useMemo(() => {
    const now = new Date();
    return eventsData
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [eventsData]);

  // Получаем важные новости
  const importantNews = React.useMemo(() => {
    return newsData.filter(news => news.isImportant).slice(0, 2);
  }, [newsData]);

  // Динамические данные для виджетов
  const statsData = React.useMemo(() => {
    const role = user?.role;
    
    let coursesCount = '0';
    if (role === 'student') {
      coursesCount = '8';
    } else if (role === 'professor') {
      coursesCount = '5';
    } else if (role === 'admin') {
      coursesCount = '12';
    }
    
    let gradeValue = '0';
    let gradeTitle = 'Баллы';
    if (role === 'student') {
      gradeValue = '4.2';
      gradeTitle = 'Средний балл';
    } else if (role === 'professor') {
      gradeValue = '4.8';
      gradeTitle = 'Ср. балл курсов';
    } else if (role === 'admin') {
      gradeValue = newsData.length.toString();
      gradeTitle = 'Новости';
    }
    
    return {
      courses: coursesCount,
      events: eventsData.length.toString(),
      grade: gradeValue,
      gradeTitle: gradeTitle
    };
  }, [user?.role, newsData.length, eventsData.length]);

  // Компонент статистического виджета
  const StatWidget = ({ icon, title, value, color }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value: string;
    color: string;
  }) => (
    <Animated.View 
      entering={FadeInDown.delay(200)}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: isExtraSmallScreen ? 10 : isVerySmallScreen ? 12 : 16,
        flex: isExtraSmallScreen ? undefined : 1,
        marginHorizontal: isExtraSmallScreen ? 0 : isVerySmallScreen ? 2 : 4,
        marginBottom: isExtraSmallScreen ? spacing.sm : 0,
        shadowColor: color,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 1,
        borderColor: color + '20',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Декоративный градиент */}
      <LinearGradient
        colors={[color + '10', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
        }}
      />
      
      <View style={{ 
      alignItems: 'center',
        justifyContent: 'center',
      }}>
        <View style={{
          backgroundColor: color + '20',
          width: isExtraSmallScreen ? 32 : isVerySmallScreen ? 36 : 44,
          height: isExtraSmallScreen ? 32 : isVerySmallScreen ? 36 : 44,
          borderRadius: isExtraSmallScreen ? 16 : isVerySmallScreen ? 18 : 22,
      justifyContent: 'center',
      alignItems: 'center',
          marginBottom: 12,
          shadowColor: color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}>
          <Ionicons name={icon} size={isExtraSmallScreen ? 16 : isVerySmallScreen ? 18 : 22} color={color} />
        </View>
        
        <ThemedText style={{
          fontSize: isExtraSmallScreen ? 18 : isVerySmallScreen ? 20 : 24,
          fontWeight: '700',
          color: colors.text,
          textAlign: 'center',
          marginBottom: isExtraSmallScreen ? 2 : 4,
        }}>
          {value}
        </ThemedText>
        
        <ThemedText style={{
          fontSize: isExtraSmallScreen ? 9 : isVerySmallScreen ? 10 : 12,
          color: colors.textSecondary,
          textAlign: 'center',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: isExtraSmallScreen ? 0.3 : 0.8,
        }}>
          {title}
        </ThemedText>
      </View>
    </Animated.View>
  );

  // Компонент быстрого события
  const QuickEventCard = ({ event, index }: { event: any; index: number }) => (
    <Animated.View
      entering={SlideInRight.delay(400 + index * 100)}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: isVerySmallScreen ? spacing.sm : spacing.md,
        marginBottom: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 4,
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <ThemedText style={{
            fontSize: fontSize.body,
            color: colors.text,
            marginBottom: spacing.xs,
          }} numberOfLines={2}>
            {event.title}
          </ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Ionicons name="calendar-outline" size={10} color={colors.textSecondary} />
            <ThemedText style={{
              fontSize: fontSize.small,
              color: colors.textSecondary,
              marginLeft: 4,
            }}>
              {formatDateYMD(event.date)}
            </ThemedText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location-outline" size={10} color={colors.textSecondary} />
            <ThemedText style={{
              fontSize: fontSize.small,
              color: colors.textSecondary,
              marginLeft: 4,
            }} numberOfLines={1}>
              {event.location}
            </ThemedText>
          </View>
        </View>
        <View style={{
          backgroundColor: colors.backgroundSecondary,
          paddingHorizontal: spacing.xs,
          paddingVertical: 4,
          borderRadius: 6,
          marginLeft: spacing.xs,
        }}>
          <ThemedText style={{
            fontSize: fontSize.small - 1,
            color: colors.textSecondary,
            textTransform: 'uppercase',
          }}>
            {event.category}
          </ThemedText>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={isDarkMode 
          ? ['#1E3A8A', '#2563EB', '#3B82F6']
          : ['#EFF6FF', '#DBEAFE', '#BFDBFE']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      <AnimatedHeader 
        userName={user?.first_name || user?.username || 'Пользователь'}
        notificationCount={0}
        onAvatarPress={() => router.push('/(tabs)/profile')}
        onNotificationPress={() => setShowNotifications(prev => !prev)}
      />

      {showNotifications && (
        <NotificationModal
          isVisible={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <CustomRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: Math.max(insets.bottom + (isExtraSmallScreen ? 80 : isVerySmallScreen ? 85 : 90), 100),
        }}
      >

        {/* Красивая статистика */}
        <Animated.View 
          entering={FadeInDown.delay(300)}
          style={{
            marginBottom: spacing.lg,
            paddingHorizontal: horizontalPadding,
          }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.md,
          }}>
            <View style={{
              width: isExtraSmallScreen ? 28 : isVerySmallScreen ? 30 : 32,
              height: isExtraSmallScreen ? 28 : isVerySmallScreen ? 30 : 32,
              borderRadius: isExtraSmallScreen ? 14 : isVerySmallScreen ? 15 : 16,
              backgroundColor: colors.primary + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: isExtraSmallScreen ? 8 : 12,
            }}>
              <Ionicons name="analytics" size={isExtraSmallScreen ? 14 : 16} color={colors.primary} />
            </View>
            <ThemedText style={{
              fontSize: fontSize.title,
              fontWeight: '600',
              color: colors.text,
            }}>
              Статистика
            </ThemedText>
          </View>
          
          <View style={{
            flexDirection: isExtraSmallScreen ? 'column' : 'row',
            gap: isExtraSmallScreen ? spacing.sm : spacing.xs,
            ...(isExtraSmallScreen && {
              alignItems: 'stretch',
            }),
          }}>
            <StatWidget 
              icon="book-outline" 
              title="Курсы" 
              value={statsData.courses} 
              color="#3B82F6" 
            />
            <StatWidget 
              icon="calendar-outline" 
              title="События" 
              value={statsData.events} 
              color="#10B981" 
            />
            <StatWidget 
              icon="trophy-outline" 
              title={statsData.gradeTitle} 
              value={statsData.grade} 
              color="#F59E0B" 
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300)}
          style={{
            marginBottom: spacing.xl,
            paddingHorizontal: horizontalPadding,
          }}
        >
          <ThemedText
            style={{
              fontSize: fontSize.title,
              lineHeight: isExtraSmallScreen ? 20 : 24,
              color: colors.text,
              marginBottom: spacing.md,
              fontFamily: 'Inter',
            }}
          >
            Быстрые действия
          </ThemedText>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: cardGap,
            }}
          >
            {user?.role === 'admin' ? (
              <>
                <ActionCard
                  title="ПОЛЬЗОВАТЕЛИ"
                  icon="people-outline"
                  onPress={() => router.push('/admin/users')}
                  style={{ 
                    width: (width - horizontalPadding * 4) / 2 - cardGap / 2, 
                    height: cardHeight,
                    marginBottom: cardGap,
                  }}
                />
                <ActionCard
                  title="НОВОСТИ"
                  icon="newspaper-outline"
                  onPress={() => router.push('/admin/news')}
                  style={{ 
                    width: (width - horizontalPadding * 4) / 2 - cardGap / 2, 
                    height: cardHeight,
                    marginBottom: cardGap,
                  }}
                />
                <ActionCard
                  title="СОБЫТИЯ"
                  icon="calendar-outline"
                  onPress={() => router.push('/admin/events')}
                  style={{ 
                    width: (width - horizontalPadding * 4) / 2 - cardGap / 2, 
                    height: cardHeight,
                    marginBottom: cardGap,
                  }}
                />
                <ActionCard
                  title="АНАЛИТИКА"
                  icon="analytics-outline"
                  onPress={() => router.push('/(tabs)/profile')}
                  style={{ 
                    width: (width - horizontalPadding * 4) / 2 - cardGap / 2, 
                    height: cardHeight,
                    marginBottom: cardGap,
                  }}
                />
              </>
            ) : (
              <>
                <ActionCard
                  title="КУРСЫ"
                  icon="book-outline"
                  onPress={() => router.push('/(tabs)/explore')}
                  style={{ 
                    width: (width - horizontalPadding * 4) / 2 - cardGap / 2, 
                    height: cardHeight,
                    marginBottom: cardGap,
                  }}
                />
                <ActionCard
                  title="РАСПИСАНИЕ"
                  icon="time-outline"
                  onPress={() => router.push('/(tabs)/schedule')}
                  style={{ 
                    width: (width - horizontalPadding * 4) / 2 - cardGap / 2, 
                    height: cardHeight,
                    marginBottom: cardGap,
                  }}
                />
                <ActionCard
                  title="ЗАДАНИЯ"
                  icon="list-outline"
                  onPress={() => router.push('/(tabs)/explore')}
                  style={{ 
                    width: (width - horizontalPadding * 4) / 2 - cardGap / 2, 
                    height: cardHeight,
                    marginBottom: cardGap,
                  }}
                />
                <ActionCard
                  title="ОЦЕНКИ"
                  icon="analytics-outline"
                  onPress={() => router.push('/(tabs)/profile')}
                  style={{ 
                    width: (width - horizontalPadding * 4) / 2 - cardGap / 2, 
                    height: cardHeight,
                    marginBottom: cardGap,
                  }}
                />
              </>
            )}
          </View>
        </Animated.View>

        {/* Компонент событий */}
        <EventsCard 
          events={eventsData.map(event => ({
            id: event.id,
            title: event.title,
            date: event.date,
            image: event.image || null,
            location: event.location,
            time: event.time
          }))}
          onEventPress={(eventId: string | number) => router.push(`/events/${eventId}` as any)}
          horizontalPadding={horizontalPadding}
        />

        {/* Красивые диаграммы успеваемости */}
        <Animated.View
          entering={FadeInDown.delay(500)}
          style={{
            marginBottom: spacing.xl,
            paddingHorizontal: horizontalPadding,
          }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.md,
          }}>
            <View style={{
              width: isExtraSmallScreen ? 28 : isVerySmallScreen ? 30 : 32,
              height: isExtraSmallScreen ? 28 : isVerySmallScreen ? 30 : 32,
              borderRadius: isExtraSmallScreen ? 14 : isVerySmallScreen ? 15 : 16,
              backgroundColor: '#10B981' + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: isExtraSmallScreen ? 8 : 12,
            }}>
              <Ionicons name="trending-up" size={isExtraSmallScreen ? 14 : 16} color="#10B981" />
            </View>
            <ThemedText style={{
              fontSize: fontSize.title,
              fontWeight: '600',
              color: colors.text,
            }}>
              Академическая успеваемость
            </ThemedText>
          </View>
          
          <View style={{
            flexDirection: isExtraSmallScreen ? 'column' : 'row',
            gap: isExtraSmallScreen ? spacing.md : spacing.lg,
          }}>
            <View style={{ flex: 1 }}>
              <CircularChart
                value={parseFloat(statsData.grade) || 3.8}
                maxValue={user?.role === 'student' ? 5 : 5}
                title="Средний балл"
                subtitle="GPA"
                color="#3B82F6"
              />
            </View>
            <View style={{ flex: 1 }}>
              <CircularChart
                value={85}
                maxValue={100}
                title="Посещаемость"
                subtitle="За семестр"
                color="#10B981"
              />
            </View>
          </View>
        </Animated.View>

        {/* Красивый компонент курсов */}
        <CourseProgressCard 
          courses={[
            { id: 1, name: 'Компьютерные науки', progress: 0.75, instructor: 'Профессор Иванов', nextClass: 'Завтра в 14:00' },
            { id: 2, name: 'Математика', progress: 0.6, instructor: 'Профессор Петров', nextClass: 'Среда в 10:00' },
            { id: 3, name: 'История', progress: 0.9, instructor: 'Профессор Сидоров', nextClass: 'Пятница в 16:00' },
            { id: 4, name: 'Физика', progress: 0.45, instructor: 'Профессор Козлов', nextClass: 'Понедельник в 12:00' },
          ]}
          onCoursePress={(courseId: number) => console.log('Course pressed:', courseId)}
          horizontalPadding={horizontalPadding}
          containerStyle={{ marginBottom: spacing.xl }}
        />

        {/* Секция новостей с новым дизайном */}
        <Animated.View 
          entering={FadeInDown.delay(600)}
          style={{
            marginBottom: spacing.xl,
            paddingHorizontal: horizontalPadding,
          }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.md,
          }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#3B82F6' + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}>
              <Ionicons name="newspaper" size={16} color="#3B82F6" />
            </View>
            <ThemedText style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
            }}>
              Последние новости
            </ThemedText>
            <View style={{ flex: 1 }} />
            <View style={{
              backgroundColor: '#3B82F6' + '15',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
            }}>
              <ThemedText style={{
                fontSize: 12,
                fontWeight: '600',
                color: '#3B82F6',
              }}>
                {newsData.length} новостей
              </ThemedText>
            </View>
          </View>
          
          <View style={{ gap: spacing.sm }}>
            {newsData.length > 0 ? (
              newsData.slice(0, 3).map((news, index) => (
                <TouchableOpacity
                  key={news.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    shadowColor: '#3B82F6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 6,
                    borderWidth: 1,
                    borderColor: '#3B82F6' + '10',
                  }}
                  onPress={() => router.push(`/news/${news.id}` as any)}
                >
                  <View style={{ flexDirection: 'row' }}>
                    {news.image && (
                      <View style={{
                        width: 60,
                        height: 60,
                        borderRadius: 12,
                        backgroundColor: '#3B82F6' + '20',
                        marginRight: 12,
                        overflow: 'hidden',
                      }}>
                        <Image 
                          source={{ uri: news.image }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <ThemedText style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: 4,
                      }} numberOfLines={2}>
                        {news.title}
                      </ThemedText>
                      <ThemedText style={{
                        fontSize: 14,
                        color: colors.textSecondary,
                        marginBottom: 8,
                      }} numberOfLines={2}>
                        {news.subtitle || news.content?.substring(0, 100) + '...' || ''}
                      </ThemedText>
                      <ThemedText style={{
                        fontSize: 12,
                        color: '#3B82F6',
                        fontWeight: '500',
                      }}>
                        {formatDateYMD(news.date)}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 32,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}>
                <Ionicons 
                  name="newspaper-outline" 
                  size={48} 
                  color={colors.textSecondary} 
                  style={{ marginBottom: 16 }}
                />
                <ThemedText style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: 8,
                }}>
                  Новостей пока нет
                </ThemedText>
                <ThemedText style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: 'center',
                }}>
                  Скоро здесь появятся последние новости университета
                </ThemedText>
              </View>
            )}
          </View>
        </Animated.View>


        <Animated.View 
          entering={FadeInDown.delay(700)}
          style={{
            marginTop: spacing.xl,
            paddingHorizontal: horizontalPadding,
            marginBottom: spacing.lg,
          }}
        >
          <LinearGradient
            colors={isDarkMode 
              ? [`${colors.primary}40`, `${colors.primary}60`] 
              : ['#6366F1', '#8B5CF6']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ 
              borderRadius: 20,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View style={{
              backgroundColor: 'transparent',
              padding: spacing.xl,
              borderRadius: 20,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={{
                    width: isVerySmallScreen ? 48 : 56,
                    height: isVerySmallScreen ? 48 : 56,
                    borderRadius: isVerySmallScreen ? 24 : 28,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: spacing.md,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.2)',
                  }}
                >
                  <Ionicons 
                    name="diamond" 
                    size={isVerySmallScreen ? 24 : 28} 
                    color="#FFFFFF" 
                  />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{
                    fontSize: isVerySmallScreen ? fontSize.title : fontSize.title + 2,
                    fontWeight: '700',
                    color: '#FFFFFF',
                    marginBottom: 6,
                    letterSpacing: 0.5,
                  }}>
                    Совет дня
                  </ThemedText>
                  <ThemedText style={{
                    fontSize: fontSize.small,
                    color: 'rgba(255,255,255,0.8)',
                  }}>
                    Мотивация и полезные советы
                  </ThemedText>
                </View>
              </View>
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: spacing.md,
                borderLeftWidth: 4,
                borderLeftColor: 'rgba(255,255,255,0.3)',
              }}>
                <ThemedText style={{
                  fontSize: fontSize.body,
                  fontWeight: '500',
                  color: '#FFFFFF',
                  lineHeight: 24,
                  fontStyle: 'italic',
                }}>
                  "Стремитесь не к успеху, а к ценностям, которые он дает."
                </ThemedText>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
                  <Ionicons name="star" size={16} color="rgba(255,255,255,0.7)" />
                  <ThemedText style={{
                    fontSize: fontSize.small,
                    color: 'rgba(255,255,255,0.7)',
                    marginLeft: spacing.xs,
                    fontWeight: '500',
                  }}>
                    Мотивация дня
                  </ThemedText>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(800)}
          style={{
            marginTop: spacing.lg,
            paddingHorizontal: horizontalPadding,
            marginBottom: spacing.xl,
          }}
        >
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: spacing.lg,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isDarkMode ? 0.2 : 0.1,
            shadowRadius: 16,
            elevation: 8,
            borderWidth: 1,
            borderColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
          }}
        >
          {/* Заголовок секции */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: spacing.lg,
            paddingBottom: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
          }}>
            <LinearGradient
              colors={[`${colors.primary}20`, `${colors.primary}10`]}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.md,
                borderWidth: 1,
                borderColor: `${colors.primary}30`,
              }}
            >
              <Ionicons name="apps" size={20} color={colors.primary} />
            </LinearGradient>
            <ThemedText style={{
              fontSize: fontSize.title,
              fontWeight: '700',
              color: colors.text,
              letterSpacing: 0.5,
            }}>
              Быстрые действия
            </ThemedText>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable 
              style={{ 
                alignItems: 'center',
                flex: 1,
                marginHorizontal: spacing.xs,
              }}
              onPress={() => {
                alert('Помощь\n\nДля получения помощи обратитесь к администратору или в службу поддержки университета.\n\nТелефон: +7 (xxx) xxx-xx-xx\nEmail: support@university.edu');
              }}
            >
              <LinearGradient
                colors={['#F59E0B', '#EF4444']}
                style={{
                  width: isVerySmallScreen ? 48 : 56,
                  height: isVerySmallScreen ? 48 : 56,
                  borderRadius: isVerySmallScreen ? 24 : 28,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: spacing.sm,
                  shadowColor: '#F59E0B',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Ionicons name="help-buoy" size={isVerySmallScreen ? 22 : 26} color="#FFFFFF" />
              </LinearGradient>
              <ThemedText style={{ 
                fontSize: fontSize.small, 
                color: colors.text,
                fontWeight: '600',
                textAlign: 'center',
              }}>
                Помощь
              </ThemedText>
            </Pressable>
            
            <Pressable 
              style={{ 
                alignItems: 'center',
                flex: 1,
                marginHorizontal: spacing.xs,
              }}
              onPress={() => {
                router.push('/(tabs)/events');
              }}
            >
              <LinearGradient
                colors={[colors.primary, '#8B5CF6']}
                style={{
                  width: isVerySmallScreen ? 48 : 56,
                  height: isVerySmallScreen ? 48 : 56,
                  borderRadius: isVerySmallScreen ? 24 : 28,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: spacing.sm,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Ionicons name="calendar" size={isVerySmallScreen ? 22 : 26} color="#FFFFFF" />
              </LinearGradient>
              <ThemedText style={{ 
                fontSize: fontSize.small, 
                color: colors.text,
                fontWeight: '600',
                textAlign: 'center',
              }}>
                События
              </ThemedText>
            </Pressable>
            
            <Pressable 
              style={{ 
                alignItems: 'center',
                flex: 1,
                marginHorizontal: spacing.xs,
              }}
              onPress={() => {
                router.push('/(tabs)/profile');
              }}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={{
                  width: isVerySmallScreen ? 48 : 56,
                  height: isVerySmallScreen ? 48 : 56,
                  borderRadius: isVerySmallScreen ? 24 : 28,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: spacing.sm,
                  shadowColor: '#10B981',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Ionicons name="person-circle" size={isVerySmallScreen ? 22 : 26} color="#FFFFFF" />
              </LinearGradient>
              <ThemedText style={{ 
                fontSize: fontSize.small, 
                color: colors.text,
                fontWeight: '600',
                textAlign: 'center',
              }}>
                Профиль
              </ThemedText>
            </Pressable>
          </View>
          </View>
        </Animated.View>
      </AnimatedScrollView>
    </View>
  );
}

// Local styles
const styles = StyleSheet.create({
  quoteText: {
    fontSize: 16,
    lineHeight: 22,
    opacity: 0.95,
    marginTop: 4,
  },
});