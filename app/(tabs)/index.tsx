import { ActionCard } from '@/components/ActionCard';
import { AnimatedHeader } from '@/components/AnimatedHeader';
import { CustomRefreshControl } from '@/components/CustomRefreshControl';
import { NewsCard } from '@/components/NewsCard';
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

import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInDown,
  SlideInRight,
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const { 
    horizontalPadding, 
    cardGap, 
    cardWidth, 
    cardHeight, 
    isVerySmallScreen, 
    isExtraSmallScreen,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
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
        padding: isExtraSmallScreen ? 12 : isVerySmallScreen ? 14 : 20,
        flex: isExtraSmallScreen ? undefined : 1,
        marginHorizontal: isExtraSmallScreen ? 0 : 4,
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
          width: isExtraSmallScreen ? 36 : isVerySmallScreen ? 40 : 48,
          height: isExtraSmallScreen ? 36 : isVerySmallScreen ? 40 : 48,
          borderRadius: isExtraSmallScreen ? 18 : isVerySmallScreen ? 20 : 24,
      justifyContent: 'center',
      alignItems: 'center',
          marginBottom: 12,
          shadowColor: color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}>
          <Ionicons name={icon} size={isExtraSmallScreen ? 18 : isVerySmallScreen ? 20 : 24} color={color} />
        </View>
        
        <ThemedText style={{
          fontSize: isExtraSmallScreen ? 20 : isVerySmallScreen ? 22 : 28,
          fontWeight: '700',
          color: colors.text,
          textAlign: 'center',
          marginBottom: 4,
        }}>
          {value}
        </ThemedText>
        
        <ThemedText style={{
          fontSize: isExtraSmallScreen ? 10 : 12,
          color: colors.textSecondary,
          textAlign: 'center',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: isExtraSmallScreen ? 0.5 : 1,
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
      
      <SafeAreaView style={{ flex: 1 }}>
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
          paddingBottom: isExtraSmallScreen ? 80 : isVerySmallScreen ? 85 : 90,
        }}
      >

        {/* Красивая статистика */}
        <Animated.View 
          entering={FadeInDown.delay(300)}
          style={{
            marginBottom: spacing.lg,
          }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.md,
            paddingHorizontal: isExtraSmallScreen ? 4 : 0,
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
              📊 Статистика
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
            🎨 Быстрые действия
          </ThemedText>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: isExtraSmallScreen ? 'center' : 'space-between',
              gap: cardGap,
              ...(isExtraSmallScreen && {
                alignItems: 'center',
              }),
            }}
          >
            {user?.role === 'admin' ? (
              <>
                <ActionCard
                  title="ПОЛЬЗОВАТЕЛИ"
                  icon="people-outline"
                  onPress={() => router.push('/admin/users')}
                  style={{ 
                    width: isExtraSmallScreen ? Math.min(cardWidth * 1.2, width - horizontalPadding * 2) : cardWidth, 
                    height: cardHeight 
                  }}
                />
                <ActionCard
                  title="НОВОСТИ"
                  icon="newspaper-outline"
                  onPress={() => router.push('/admin/news')}
                  style={{ 
                    width: isExtraSmallScreen ? Math.min(cardWidth * 1.2, width - horizontalPadding * 2) : cardWidth, 
                    height: cardHeight 
                  }}
                />
                <ActionCard
                  title="СОБЫТИЯ"
                  icon="calendar-outline"
                  onPress={() => router.push('/admin/events')}
                  style={{ 
                    width: isExtraSmallScreen ? Math.min(cardWidth * 1.2, width - horizontalPadding * 2) : cardWidth, 
                    height: cardHeight 
                  }}
                />
                <ActionCard
                  title="АНАЛИТИКА"
                  icon="analytics-outline"
                  onPress={() => router.push('/(tabs)/profile')}
                  style={{ 
                    width: isExtraSmallScreen ? Math.min(cardWidth * 1.2, width - horizontalPadding * 2) : cardWidth, 
                    height: cardHeight 
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
                    width: isExtraSmallScreen ? Math.min(cardWidth * 1.2, width - horizontalPadding * 2) : cardWidth, 
                    height: cardHeight 
                  }}
                />
                <ActionCard
                  title="РАСПИСАНИЕ"
                  icon="time-outline"
                  onPress={() => router.push('/(tabs)/schedule')}
                  style={{ 
                    width: isExtraSmallScreen ? Math.min(cardWidth * 1.2, width - horizontalPadding * 2) : cardWidth, 
                    height: cardHeight 
                  }}
                />
                <ActionCard
                  title="ЗАДАНИЯ"
                  icon="list-outline"
                  onPress={() => router.push('/(tabs)/explore')}
                  style={{ 
                    width: isExtraSmallScreen ? Math.min(cardWidth * 1.2, width - horizontalPadding * 2) : cardWidth, 
                    height: cardHeight 
                  }}
                />
                <ActionCard
                  title="ОЦЕНКИ"
                  icon="analytics-outline"
                  onPress={() => router.push('/(tabs)/profile')}
                  style={{ 
                    width: isExtraSmallScreen ? Math.min(cardWidth * 1.2, width - horizontalPadding * 2) : cardWidth, 
                    height: cardHeight 
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
        />

        {/* Красивые диаграммы успеваемости */}
        <Animated.View
          entering={FadeInDown.delay(500)}
          style={{
            marginBottom: 32,
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
              backgroundColor: '#10B981' + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}>
              <Ionicons name="trending-up" size={16} color="#10B981" />
            </View>
            <ThemedText style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
            }}>
              📈 Академическая успеваемость
            </ThemedText>
          </View>
          
          <View style={{
            flexDirection: 'row',
            gap: 16,
          }}>
            <View style={{ flex: 1 }}>
              <CircularChart
                value={parseFloat(statsData.grade) || 3.8}
                maxValue={user?.role === 'student' ? 5 : 5}
                title="Средний балл"
                subtitle="GPA"
                color="#3B82F6"
                icon="trophy"
                size={140}
              />
            </View>
            <View style={{ flex: 1 }}>
              <CircularChart
                value={85}
                maxValue={100}
                title="Посещаемость"
                subtitle="За семестр"
                color="#10B981"
                icon="checkmark-circle"
                size={140}
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
        />

        {/* Секция новостей с новым дизайном */}
        <Animated.View 
          entering={FadeInDown.delay(600)}
          style={{
            marginBottom: 32,
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
              📰 Последние новости
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
                        📅 {formatDateYMD(news.date)}
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

        <Animated.View entering={SlideInRight.delay(600)}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <ThemedText
              style={{
                fontSize: fontSize.title,
                lineHeight: isVerySmallScreen ? 22 : 24,
                color: isDarkMode ? colors.text : '#1E293B',
                fontFamily: 'Inter',
              }}
            >
              📰 Последние новости
            </ThemedText>
            <View style={{
              backgroundColor: isDarkMode ? `${colors.primary}20` : '#ffffffff',
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: 12,
            }}>
              <ThemedText style={{
                fontSize: fontSize.small - 1,
                color: isDarkMode ? colors.primary : '#0369A1',
              }}>
                {newsData.length} новостей
              </ThemedText>
            </View>
          </View>

          <View style={{ gap: spacing.sm }}>
            {newsData.length > 0 ? (
              newsData.slice(0, 5).map((news, index) => (
                <NewsCard
                  key={news.id}
                  title={news.title}
                  subtitle={news.subtitle}
                  date={news.date}
                  image={news.image}
                  events={news.events || []}
                  icon={news.icon}
                  index={index}
                  onPress={() => router.push(`/news/${news.id}`)}
                />
              ))
            ) : (
              <View style={{
                backgroundColor: colors.backgroundSecondary,
                borderRadius: 16,
                padding: spacing.lg,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: colors.border,
                borderStyle: 'dashed',
              }}>
                <View style={{
                  backgroundColor: colors.border,
                  width: isVerySmallScreen ? 48 : 60,
                  height: isVerySmallScreen ? 48 : 60,
                  borderRadius: isVerySmallScreen ? 24 : 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: spacing.md,
                }}>
                  <Ionicons name="newspaper-outline" size={isVerySmallScreen ? 22 : 28} color={colors.textSecondary} />
                </View>
                <ThemedText style={{
                  fontSize: fontSize.body,
                  color: isDarkMode ? colors.text : '#475569',
                  textAlign: 'center',
                  marginBottom: spacing.xs,
                }}>
                  Новостей пока нет
                </ThemedText>
                <ThemedText style={{
                  fontSize: fontSize.small,
                  color: isDarkMode ? colors.textSecondary : '#94A3B8',
                  textAlign: 'center',
                  lineHeight: 20,
                }}>
                </ThemedText>
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(700)}
          style={{
            marginTop: spacing.lg,
            borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={isDarkMode ? ['#3B0764', '#2B6CB0'] : ['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20 }}
          >
            <View style={{
              backgroundColor: 'transparent',
              padding: spacing.lg,
              borderRadius: 20,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                <View style={{
                  backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.12)',
                  width: isVerySmallScreen ? 40 : 48,
                  height: isVerySmallScreen ? 40 : 48,
                  borderRadius: isVerySmallScreen ? 20 : 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  <Ionicons name="bulb" size={isVerySmallScreen ? 20 : 24} color={isDarkMode ? colors.primary : "#FFFFFF"} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{
                    fontSize: fontSize.body,
                    color: isDarkMode ? colors.text : '#FFFFFF',
                    marginBottom: 4,
                  }}>
                    Совет дня
                  </ThemedText>
                  <ThemedText style={{
                    fontSize: fontSize.small,
                    color: isDarkMode ? colors.textSecondary : '#C7D2FE',
                  }}>
                    Полезная информация для студентов
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[styles.quoteText, { color: isDarkMode ? colors.text : '#FFFFFF' }]}>&quot;Стремитесь не к успеху, а к ценностям, которые он дает.&quot;</ThemedText>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(800)}
          style={{
            marginTop: spacing.lg,
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: spacing.md,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDarkMode ? 0.15 : 0.08,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <Pressable 
              style={{ alignItems: 'center' }}
              onPress={() => {
                alert('Помощь\n\nДля получения помощи обратитесь к администратору или в службу поддержки университета.\n\nТелефон: +7 (xxx) xxx-xx-xx\nEmail: support@university.edu');
              }}
            >
              <View style={{
                backgroundColor: isDarkMode ? `${colors.error}25` : '#FEE2E2',
                width: isVerySmallScreen ? 36 : 40,
                height: isVerySmallScreen ? 36 : 40,
                borderRadius: isVerySmallScreen ? 18 : 20,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: spacing.xs,
              }}>
                <Ionicons name="help-circle" size={isVerySmallScreen ? 18 : 20} color={colors.error} />
              </View>
              <ThemedText style={{ fontSize: fontSize.small, color: colors.textSecondary }}>
                Помощь
              </ThemedText>
            </Pressable>
            
            <Pressable 
              style={{ alignItems: 'center' }}
              onPress={() => {
                router.push('/(tabs)/events');
              }}
            >
              <View style={{
                backgroundColor: isDarkMode ? `${colors.primary}25` : '#DBEAFE',
                width: isVerySmallScreen ? 36 : 40,
                height: isVerySmallScreen ? 36 : 40,
                borderRadius: isVerySmallScreen ? 18 : 20,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: spacing.xs,
              }}>
                <Ionicons name="chatbubble" size={isVerySmallScreen ? 18 : 20} color={colors.primary} />
              </View>
              <ThemedText style={{ fontSize: fontSize.small, color: isDarkMode ? colors.textSecondary : '#64748B' }}>
                События
              </ThemedText>
            </Pressable>
            
            <Pressable 
              style={{ alignItems: 'center' }}
              onPress={() => {
                router.push('/(tabs)/profile');
              }}
            >
              <View style={{
                backgroundColor: isDarkMode ? `${colors.success}25` : '#D1FAE5',
                width: isVerySmallScreen ? 36 : 40,
                height: isVerySmallScreen ? 36 : 40,
                borderRadius: isVerySmallScreen ? 18 : 20,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: spacing.xs,
              }}>
                <Ionicons name="settings" size={isVerySmallScreen ? 18 : 20} color={colors.success} />
              </View>
              <ThemedText style={{ fontSize: fontSize.small, color: colors.textSecondary }}>
                Настройки
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>
      </AnimatedScrollView>
      </SafeAreaView>
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