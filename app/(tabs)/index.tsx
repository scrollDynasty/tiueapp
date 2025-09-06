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
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';
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
  const { horizontalPadding, cardGap, cardWidth, cardHeight, isVerySmallScreen } = useResponsive();
  const { user } = useAppSelector((state) => state.auth);

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
    } catch (error) {
      console.log('Refresh error:', error);
    }
    setRefreshing(false);
  }, [dispatch, user]);

  // Получаем новости и события из Redux store
  const { items: newsData, isLoading: newsLoading } = useAppSelector((state) => state.news);
  const { items: eventsData, isLoading: eventsLoading } = useAppSelector((state) => state.events);

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
    
    // Количество курсов в зависимости от роли
    let coursesCount = '0';
    if (role === 'student') {
      coursesCount = '8'; // Обычная нагрузка студента
    } else if (role === 'professor') {
      coursesCount = '5'; // Преподаватель ведет несколько курсов
    } else if (role === 'admin') {
      coursesCount = '12'; // Общее количество курсов в университете
    }
    
    // Средний балл или показатель успеваемости
    let gradeValue = '0';
    let gradeTitle = 'Баллы';
    if (role === 'student') {
      gradeValue = '4.2'; // Средний балл студента
      gradeTitle = 'Средний балл';
    } else if (role === 'professor') {
      gradeValue = '4.8'; // Средний балл по курсам преподавателя
      gradeTitle = 'Ср. балл курсов';
    } else if (role === 'admin') {
      gradeValue = newsData.length.toString(); // Количество новостей для админа
      gradeTitle = 'Новости';
    }
    
    return {
      courses: coursesCount,
      events: eventsData.length.toString(),
      grade: gradeValue,
      gradeTitle: gradeTitle
    };
  }, [user?.role, newsData.length, eventsData.length]);

  const screenWidth = Dimensions.get('window').width;

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
            fontWeight: '600',
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
        fontWeight: '700',
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
        padding: 16,
        marginBottom: 12,
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
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
          }} numberOfLines={2}>
            {event.title}
          </ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
            <ThemedText style={{
              fontSize: 12,
              color: colors.textSecondary,
              marginLeft: 4,
            }}>
              {formatDateYMD(event.date)}
            </ThemedText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
            <ThemedText style={{
              fontSize: 12,
              color: colors.textSecondary,
              marginLeft: 4,
            }} numberOfLines={1}>
              {event.location}
            </ThemedText>
          </View>
        </View>
        <View style={{
          backgroundColor: colors.backgroundSecondary,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 6,
          marginLeft: 8,
        }}>
          <ThemedText style={{
            fontSize: 10,
            fontWeight: '600',
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Верхняя панель */}
      <AnimatedHeader 
        userName={user?.first_name || user?.username || 'Пользователь'}
        notificationCount={0}
        onAvatarPress={() => router.push('/(tabs)/profile')}
        onNotificationPress={() => setShowNotifications(prev => !prev)}
      />

      {/* Dropdown уведомлений */}
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
          paddingBottom: 100,
        }}
      >


        {/* Статистические виджеты */}
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

        {/* Сетка карточек 2x2 */}
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
              fontWeight: '700',
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
              // Карточки для администратора
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
              // Карточки для студентов и преподавателей
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

        {/* Предстоящие события */}
        {upcomingEvents.length > 0 && (
          <Animated.View entering={SlideInLeft.delay(400)} style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <ThemedText
                style={{
                  fontSize: 18,
                  lineHeight: 24,
                  fontWeight: '700',
                  color: colors.text,
                  fontFamily: 'Inter',
                }}
              >
                📅 Предстоящие события
              </ThemedText>
              <Pressable
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
                onPress={() => router.push('/(tabs)/events')}
              >
                <ThemedText style={{
                  fontSize: 12,
                  fontWeight: '600',
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

        {/* Важные новости */}
        {importantNews.length > 0 && (
          <Animated.View entering={SlideInRight.delay(500)} style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <ThemedText
                style={{
                  fontSize: 18,
                  lineHeight: 24,
                  fontWeight: '700',
                  color: isDarkMode ? colors.text : '#1E293B',
                  fontFamily: 'Inter',
                }}
              >
                ⚡ Важные новости
              </ThemedText>
              <Pressable
                style={{
                  backgroundColor: isDarkMode ? `${colors.warning}20` : '#FEF3C7',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
                onPress={() => {
                  router.push('/news');
                }}
              >
                <ThemedText style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: isDarkMode ? colors.warning : '#D97706',
                }}>
                  Все новости
                </ThemedText>
              </Pressable>
            </View>
            
            <View style={{ gap: 12 }}>
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
                  onEventPress={(event) => console.log(`Event ${event.id} pressed from news ${news.id}`)}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Секция всех новостей */}
        <Animated.View entering={SlideInRight.delay(600)}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <ThemedText
              style={{
                fontSize: 18,
                lineHeight: 24,
                fontWeight: '700',
                color: isDarkMode ? colors.text : '#1E293B',
                fontFamily: 'Inter',
              }}
            >
              📰 Последние новости
            </ThemedText>
            <View style={{
              backgroundColor: isDarkMode ? `${colors.primary}20` : '#ffffffff',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}>
              <ThemedText style={{
                fontSize: 11,
                fontWeight: '600',
                color: isDarkMode ? colors.primary : '#0369A1',
              }}>
                {newsData.length} новостей
              </ThemedText>
            </View>
          </View>

          <View style={{ gap: 12 }}>
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
                  onEventPress={(event) => console.log(`Event ${event.id} pressed from news ${news.id}`)}
                />
              ))
            ) : (
              <View style={{
                backgroundColor: colors.backgroundSecondary,
                borderRadius: 16,
                padding: 32,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: colors.border,
                borderStyle: 'dashed',
              }}>
                <View style={{
                  backgroundColor: colors.border,
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                  <Ionicons name="newspaper-outline" size={28} color={colors.textSecondary} />
                </View>
                <ThemedText style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: isDarkMode ? colors.text : '#475569',
                  textAlign: 'center',
                  marginBottom: 8,
                }}>
                  Новостей пока нет
                </ThemedText>
                <ThemedText style={{
                  fontSize: 14,
                  color: isDarkMode ? colors.textSecondary : '#94A3B8',
                  textAlign: 'center',
                  lineHeight: 20,
                }}>
                </ThemedText>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Дополнительная информационная карточка */}
        <Animated.View 
          entering={FadeInDown.delay(700)}
          style={{
            marginTop: 32,
            backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          <View style={{
            backgroundColor: isDarkMode ? colors.surface : colors.primary,
            padding: 24,
            borderRadius: 20,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{
                backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.2)',
                width: 48,
                height: 48,
                borderRadius: 24,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16,
              }}>
                <Ionicons name="bulb" size={24} color={isDarkMode ? colors.primary : "#FFFFFF"} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: isDarkMode ? colors.text : '#FFFFFF',
                  marginBottom: 4,
                }}>
                  Совет дня
                </ThemedText>
                <ThemedText style={{
                  fontSize: 12,
                  color: isDarkMode ? colors.textSecondary : '#C7D2FE',
                }}>
                  Полезная информация для студентов
                </ThemedText>
              </View>
            </View>
            <ThemedText style={{
              fontSize: 14,
              lineHeight: 20,
              color: isDarkMode ? colors.textSecondary : '#E0E7FF',
              fontStyle: 'italic',
            }}>
              "Успех — это способность идти от неудачи к неудаче, не теряя энтузиазма." 
              {'\n\n'}Не забывайте проверять расписание и готовиться к предстоящим занятиям!
            </ThemedText>
          </View>
        </Animated.View>

        {/* Финальная карточка с контактной информацией */}
        <Animated.View 
          entering={FadeInDown.delay(800)}
          style={{
            marginTop: 24,
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 20,
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
                // Можно открыть модальное окно с помощью или перейти на страницу поддержки
                console.log('Help pressed');
                // Пример: показать alert с информацией о поддержке
                alert('Помощь\n\nДля получения помощи обратитесь к администратору или в службу поддержки университета.\n\nТелефон: +7 (xxx) xxx-xx-xx\nEmail: support@university.edu');
              }}
            >
              <View style={{
                backgroundColor: isDarkMode ? `${colors.error}25` : '#FEE2E2',
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <Ionicons name="help-circle" size={20} color={colors.error} />
              </View>
              <ThemedText style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>
                Помощь
              </ThemedText>
            </Pressable>
            
            <Pressable 
              style={{ alignItems: 'center' }}
              onPress={() => {
                // Переходим на страницу чатов (events.tsx содержит чаты)
                router.push('/(tabs)/events');
              }}
            >
              <View style={{
                backgroundColor: isDarkMode ? `${colors.primary}25` : '#DBEAFE',
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <Ionicons name="chatbubble" size={20} color={colors.primary} />
              </View>
              <ThemedText style={{ fontSize: 12, color: isDarkMode ? colors.textSecondary : '#64748B', fontWeight: '600' }}>
                Чат
              </ThemedText>
            </Pressable>
            
            <Pressable 
              style={{ alignItems: 'center' }}
              onPress={() => {
                // Переход на страницу настроек/профиля
                router.push('/(tabs)/profile');
              }}
            >
              <View style={{
                backgroundColor: isDarkMode ? `${colors.success}25` : '#D1FAE5',
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <Ionicons name="settings" size={20} color={colors.success} />
              </View>
              <ThemedText style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>
                Настройки
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>
      </AnimatedScrollView>
    </SafeAreaView>
  );
}
