import { ActionCard } from '@/components/ActionCard';
import { AnimatedHeader } from '@/components/AnimatedHeader';
import { CustomRefreshControl } from '@/components/CustomRefreshControl';
import { NewsCard } from '@/components/NewsCard';
import { NotificationModal } from '@/components/NotificationModal';
import { ThemedText } from '@/components/ThemedText';
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
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  SlideInLeft,
  SlideInRight,
  useAnimatedScrollHandler,
  useSharedValue,
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
  const { horizontalPadding, cardGap, cardWidth, cardHeight, isVerySmallScreen, fontSize, spacing } = useResponsive();
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
        backgroundColor: isDarkMode ? colors.surfaceSecondary : colors.surface,
        borderRadius: 16,
        padding: isVerySmallScreen ? 12 : 16,
        flex: 1,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.2 : 0.08,
        shadowRadius: 12,
        elevation: 6,
        borderLeftWidth: 4,
        borderLeftColor: color,
        borderWidth: isDarkMode ? 1 : 0,
        borderColor: isDarkMode ? colors.border : 'transparent',
      }}
    >
      <View style={{ 
        flexDirection: isVerySmallScreen ? 'column' : 'row', 
        alignItems: 'center', 
        marginBottom: isVerySmallScreen ? 6 : 8,
        justifyContent: 'center'
      }}>
        <View style={{
          backgroundColor: isDarkMode ? `${color}25` : `${color}15`,
          width: isVerySmallScreen ? 28 : 32,
          height: isVerySmallScreen ? 28 : 32,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: isVerySmallScreen ? 0 : 8,
          marginBottom: isVerySmallScreen ? 4 : 0,
        }}>
          <Ionicons name={icon} size={isVerySmallScreen ? 16 : 18} color={color} />
        </View>
        {!isVerySmallScreen && (
          <ThemedText style={{
            fontSize: 12,
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            {title}
          </ThemedText>
        )}
      </View>
      <ThemedText style={{
        fontSize: isVerySmallScreen ? 20 : 24,
        color: colors.text,
        textAlign: 'center',
      }}>
        {value}
      </ThemedText>
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
          ? ['#0F172A', '#1E293B', '#334155']
          : ['#FAFAFA', '#F8FAFC', '#EEF2F7']
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
          paddingBottom: 90,
        }}
      >

        <View style={{
          flexDirection: 'row',
          marginBottom: 24,
          gap: 8,
        }}>
          <StatWidget 
            icon="book-outline" 
            title="Курсы" 
            value={statsData.courses} 
            color={colors.primary} 
          />
          <StatWidget 
            icon="calendar-outline" 
            title="События" 
            value={statsData.events} 
            color={colors.success} 
          />
          <StatWidget 
            icon="trophy-outline" 
            title={statsData.gradeTitle} 
            value={statsData.grade} 
            color={colors.warning} 
          />
        </View>

        <Animated.View
          entering={FadeInDown.delay(300)}
          style={{
            marginBottom: 32,
          }}
        >
          <ThemedText
            style={{
              fontSize: 18,
              lineHeight: 24,
              color: colors.text,
              marginBottom: 16,
              fontFamily: 'Inter',
            }}
          >
            🚀 Быстрые действия
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
                  style={{ width: cardWidth, height: cardHeight }}
                />
                <ActionCard
                  title="НОВОСТИ"
                  icon="newspaper-outline"
                  onPress={() => router.push('/admin/news')}
                  style={{ width: cardWidth, height: cardHeight }}
                />
                <ActionCard
                  title="СОБЫТИЯ"
                  icon="calendar-outline"
                  onPress={() => router.push('/admin/events')}
                  style={{ width: cardWidth, height: cardHeight }}
                />
                <ActionCard
                  title="АНАЛИТИКА"
                  icon="analytics-outline"
                  onPress={() => router.push('/(tabs)/profile')}
                  style={{ width: cardWidth, height: cardHeight }}
                />
              </>
            ) : (
              <>
                <ActionCard
                  title="КУРСЫ"
                  icon="book-outline"
                  onPress={() => router.push('/(tabs)/explore')}
                  style={{ width: cardWidth, height: cardHeight }}
                />
                <ActionCard
                  title="РАСПИСАНИЕ"
                  icon="time-outline"
                  onPress={() => router.push('/(tabs)/schedule')}
                  style={{ width: cardWidth, height: cardHeight }}
                />
                <ActionCard
                  title="ЗАДАНИЯ"
                  icon="list-outline"
                  onPress={() => router.push('/(tabs)/explore')}
                  style={{ width: cardWidth, height: cardHeight }}
                />
                <ActionCard
                  title="ОЦЕНКИ"
                  icon="analytics-outline"
                  onPress={() => router.push('/(tabs)/profile')}
                  style={{ width: cardWidth, height: cardHeight }}
                />
              </>
            )}
          </View>
        </Animated.View>

        {upcomingEvents.length > 0 && (
          <Animated.View entering={SlideInLeft.delay(400)} style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <ThemedText
                style={{
                  fontSize: fontSize.title,
                  lineHeight: isVerySmallScreen ? 22 : 24,
                  color: colors.text,
                  fontFamily: 'Inter',
                }}
              >
                📅 Предстоящие события
              </ThemedText>
              <Pressable
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  borderRadius: 20,
                }}
                onPress={() => router.push('/(tabs)/events')}
              >
                <ThemedText style={{
                  fontSize: fontSize.small,
                  color: colors.primary,
                }}>
                  Все события
                </ThemedText>
              </Pressable>
            </View>
            
            <View>
              {upcomingEvents.map((event, index) => (
                <QuickEventCard key={event.id} event={event} index={index} />
              ))}
            </View>
          </Animated.View>
        )}

        {importantNews.length > 0 && (
          <Animated.View entering={SlideInRight.delay(500)} style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <ThemedText
                style={{
                  fontSize: fontSize.title,
                  lineHeight: isVerySmallScreen ? 22 : 24,
                  color: isDarkMode ? colors.text : '#1E293B',
                  fontFamily: 'Inter',
                }}
              >
                ⚡ Важные новости
              </ThemedText>
              <Pressable
                style={{
                  backgroundColor: isDarkMode ? `${colors.warning}20` : '#FEF3C7',
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  borderRadius: 20,
                }}
                onPress={() => {
                  router.push('/news');
                }}
              >
                <ThemedText style={{
                  fontSize: fontSize.small,
                  color: isDarkMode ? colors.warning : '#D97706',
                }}>
                  Все новости
                </ThemedText>
              </Pressable>
            </View>
            
            <View style={{ gap: spacing.sm }}>
              {importantNews.map((news, index) => (
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
              ))}
            </View>
          </Animated.View>
        )}

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