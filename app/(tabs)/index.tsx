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
import { authApi } from '@/services/api';
import { fetchEvents } from '@/store/slices/eventsSlice';
import { fetchNews } from '@/store/slices/newsSlice';
import { formatDateYMD } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import React from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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
  const [gradesData, setGradesData] = React.useState<any[]>([]);
  const [gradesLoading, setGradesLoading] = React.useState(false);
  const [coursesData, setCoursesData] = React.useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = React.useState(false);
  const [attendanceData, setAttendanceData] = React.useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = React.useState(false);
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
  // Мемоизированный селектор для оптимизации
  const authData = useAppSelector(React.useCallback((state) => ({
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated
  }), []), (left, right) => left.user?.id === right.user?.id && left.isAuthenticated === right.isAuthenticated);
  
  const { user } = authData;
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Функция для загрузки оценок
  const fetchGrades = React.useCallback(async () => {
    if (user?.role !== 'student') {
      if (__DEV__) {
      }
      return;
    }
    
    try {
      if (__DEV__) {
      }
      setGradesLoading(true);
      
      const response = await authApi.getGrades();
      
      if (response.success && response.data) {
        // API возвращает объект с полем data, которое содержит массив
        const responseData = response.data as any || {};
        const gradesArray = Array.isArray(responseData.data) ? responseData.data : [];
        
        // Преобразуем данные LDAP в упрощенный формат для расчета GPA
        const formattedGrades = gradesArray.map((item: any) => ({
          grade: parseFloat(item.final_grade || item.grade || item.score || 0),
          maxGrade: 100
        }));
        
        setGradesData(formattedGrades);
      } else {
        // Если нет данных, устанавливаем пустой массив
        setGradesData([]);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('🎓 Error fetching grades:', error);
      }
      // В случае ошибки устанавливаем пустой массив
      setGradesData([]);
    } finally {
      setGradesLoading(false);
    }
  }, [user?.role]);

  // Функция для загрузки курсов
  const fetchCourses = React.useCallback(async () => {
    if (user?.role !== 'student') {
      return;
    }
    
    try {
      if (__DEV__) {
      }
      setCoursesLoading(true);
      
      const response = await authApi.getCourses();
      
      if (response.success && response.data) {
        const responseData = response.data as any || {};
        const coursesArray = Array.isArray(responseData.data) ? responseData.data : [];
        
        
        setCoursesData(coursesArray);
      } else {
        setCoursesData([]);
      }
    } catch (error) {
      if (__DEV__) {
      }
      setCoursesData([]);
    } finally {
      setCoursesLoading(false);
    }
  }, [user?.role]);

  // Посещаемость недоступна в LDAP - пока отключена
  // const fetchAttendance = React.useCallback(async () => {
  //   // Данные о посещаемости пока не доступны в LDAP системе
  // }, [user?.role]);

  // Загружаем данные при монтировании компонента
  React.useEffect(() => {
    if (user) {
      dispatch(fetchNews());
      dispatch(fetchEvents());
      fetchGrades();
      fetchCourses();
      // fetchAttendance(); // Отключено - нет данных в LDAP
    }
  }, [dispatch, user, fetchGrades, fetchCourses]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      if (user) {
        await Promise.all([
          dispatch(fetchNews()).unwrap(),
          dispatch(fetchEvents()).unwrap(),
          fetchGrades(),
          fetchCourses()
          // fetchAttendance() // Отключено - нет данных в LDAP
        ]);
      }
    } catch {
      // handle error
    }
    setRefreshing(false);
  }, [dispatch, user, fetchGrades, fetchCourses]);

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

  // Мемоизированный расчет среднего балла (GPA) из реальных данных
  const gpaValue = React.useMemo(() => {
    if (!gradesData || gradesData.length === 0) return 0;
    
    // Считаем средний балл как среднее арифметическое всех оценок
    const total = gradesData.reduce((sum, grade) => {
      return sum + parseFloat(grade.grade || 0);
    }, 0);
    
    return Math.round((total / gradesData.length) * 100) / 100; // Округляем до 2 знаков
  }, [gradesData]);

  // Обратная совместимость
  const calculateGPA = React.useCallback((grades: any[]) => {
    return gpaValue;
  }, [gpaValue]);

  // Посещаемость пока недоступна в LDAP - все данные равны 0
  // const calculateOverallAttendance = React.useCallback((attendanceList: any[]) => {
  //   // LDAP система пока не предоставляет данные о посещаемости
  //   // Все present_count и absent_count равны 0
  //   return null;
  // }, []);

  // Динамические данные для виджетов
  const statsData = React.useMemo(() => {
    const role = user?.role;
    
    // Используем реальные данные курсов
    let coursesCount = '0';
    if (role === 'student') {
      if (coursesLoading) {
        coursesCount = '...';
      } else {
        // Подсчитываем уникальные предметы по названию
        const uniqueSubjects = new Set(
          coursesData.map((course: any) => course.course_name || course.name || 'Unknown')
        );
        coursesCount = uniqueSubjects.size.toString();

      }
    } else if (role === 'professor') {
      coursesCount = '5'; // TODO: получать из API для преподавателей
    } else if (role === 'admin') {
      coursesCount = '12'; // TODO: получать из API для админов
    }
    
    let gradeValue = '0';
    let gradeTitle = 'Баллы';
    if (role === 'student') {
      if (gradesLoading) {
        gradeValue = '...';
      } else if (gradesData.length > 0) {
        gradeValue = gpaValue.toFixed(1);
      } else {
        gradeValue = 'Нет данных';
      }
      gradeTitle = 'Средний балл';
    } else if (role === 'professor') {
      gradeValue = '4.8'; // TODO: получать из API для преподавателей
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
  }, [user?.role, newsData.length, eventsData.length, gradesData, gradesLoading, coursesData, coursesLoading, gpaValue]);

  // Компонент статистического виджета
  const StatWidget = ({ icon, title, value, color, onPress }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value: string;
    color: string;
    onPress?: () => void;
  }) => {
    const Widget = onPress ? TouchableOpacity : View;
    
    return (
      <Widget 
        onPress={onPress}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: isExtraSmallScreen ? 10 : isVerySmallScreen ? 12 : 16,
          flex: isExtraSmallScreen ? undefined : 1,
          marginHorizontal: isExtraSmallScreen ? 0 : isVerySmallScreen ? 2 : 4,
          marginBottom: isExtraSmallScreen ? spacing.sm : 0,
          shadowColor: Platform.OS === 'android' ? 'transparent' : color,
          shadowOffset: { width: 0, height: Platform.OS === 'android' ? 2 : 8 },
          shadowOpacity: Platform.OS === 'android' ? 0 : 0.15,
          shadowRadius: Platform.OS === 'android' ? 0 : 16,
          elevation: Platform.OS === 'android' ? 2 : 8,
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
          shadowColor: Platform.OS === 'android' ? 'transparent' : color,
          shadowOffset: { width: 0, height: Platform.OS === 'android' ? 0 : 4 },
          shadowOpacity: Platform.OS === 'android' ? 0 : 0.3,
          shadowRadius: Platform.OS === 'android' ? 0 : 8,
          elevation: Platform.OS === 'android' ? 1 : 4,
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
      </Widget>
    );
  };

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
          paddingBottom: Platform.OS === 'android' 
            ? (isExtraSmallScreen ? 70 : isVerySmallScreen ? 80 : 90) + Math.max(insets.bottom, 0) // Компактные + insets для Android
            : (isExtraSmallScreen ? 110 : isVerySmallScreen ? 115 : 120), // Обычные для iOS
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
              title="Предметы" 
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
              onPress={() => router.push('/grades')}
            />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400)}
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
                  gradientColors={['#3B82F6', '#1D4ED8']}
                  iconColor="#FFFFFF"
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
                  gradientColors={['#10B981', '#059669']}
                  iconColor="#FFFFFF"
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
                  gradientColors={['#8B5CF6', '#7C3AED']}
                  iconColor="#FFFFFF"
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
                  gradientColors={['#F59E0B', '#D97706']}
                  iconColor="#FFFFFF"
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
                  onPress={() => router.push('/courses')}
                  gradientColors={['#3B82F6', '#1E40AF']}
                  iconColor="#FFFFFF"
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
                  gradientColors={['#10B981', '#047857']}
                  iconColor="#FFFFFF"
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
                  gradientColors={['#EF4444', '#DC2626']}
                  iconColor="#FFFFFF"
                  style={{ 
                    width: (width - horizontalPadding * 4) / 2 - cardGap / 2, 
                    height: cardHeight,
                    marginBottom: cardGap,
                  }}
                />
                <ActionCard
                  title="ОЦЕНКИ"
                  icon="analytics-outline"
                  onPress={() => router.push('/grades')}
                  gradientColors={['#F59E0B', '#D97706']}
                  iconColor="#FFFFFF"
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
          entering={FadeInDown.delay(550)}
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
              backgroundColor: colors.backgroundSecondary,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: isExtraSmallScreen ? 8 : 12,
            }}>
              <Ionicons name="trending-up" size={isExtraSmallScreen ? 14 : 16} color={Platform.OS === 'android' ? colors.textSecondary : "#10B981"} />
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
            <TouchableOpacity 
              style={{ flex: 1 }}
              onPress={() => user?.role === 'student' ? router.push('/grades') : null}
            >
              <CircularChart
                value={parseFloat(statsData.grade) || 0}
                maxValue={100}
                title="Средний балл"
                subtitle="из 100"
                color="#3B82F6"
              />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <CircularChart
                value={0}
                maxValue={100}
                title="Посещаемость"
                subtitle="Нет данных в LDAP"
                color="#10B981"
              />
            </View>
          </View>
        </Animated.View>

        {/* Красивый компонент курсов */}
        <CourseProgressCard 
          courses={coursesData.map((course: any, index: number) => {
            // Рассчитываем прогресс на основе оценки или статуса курса
            let progress = 0;
            if (course.final_grade && course.final_grade > 0) {
              progress = Math.min(course.final_grade / 100, 1); // Если есть итоговая оценка
            } else if (course.status === 'current') {
              progress = 0.6; // Текущие курсы - 60% прогресса
            } else if (course.status === 'past') {
              progress = 1.0; // Завершенные курсы - 100%
            } else {
              progress = 0.3; // По умолчанию - 30%
            }
            
            return {
              id: course.course_id || index,
              name: course.course_name || course.name || 'Неизвестный курс',
              progress: progress,
              instructor: course.instructor || 'Преподаватель не указан',
              nextClass: course.status === 'current' ? 'В процессе изучения' : 
                        course.status === 'past' ? 'Курс завершен' : 'Статус неизвестен'
            };
          })}
          onCoursePress={(courseId: number) => {
            router.push('/courses');
          }}
          onViewAllPress={() => {
            router.push('/courses');
          }}
          horizontalPadding={horizontalPadding}
          containerStyle={{ marginBottom: spacing.xl }}
        />

        {/* Секция новостей с новым дизайном */}
        <Animated.View 
          entering={FadeInDown.delay(650)}
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
              backgroundColor: colors.backgroundSecondary,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}>
              <Ionicons name="newspaper" size={16} color={Platform.OS === 'android' ? colors.textSecondary : "#3B82F6"} />
            </View>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <ThemedText style={{
                fontSize: isVerySmallScreen ? 16 : 18,
                fontWeight: '600',
                color: colors.text,
              }}>
                Последние новости
              </ThemedText>
            </View>
            {newsData.length > 0 && (
              <View style={{
                backgroundColor: colors.backgroundSecondary,
                paddingHorizontal: isVerySmallScreen ? 8 : 12,
                paddingVertical: isVerySmallScreen ? 4 : 6,
                borderRadius: 12,
                minWidth: isVerySmallScreen ? 60 : 80,
                maxWidth: isVerySmallScreen ? 100 : 120,
              }}>
                <ThemedText style={{
                  fontSize: isVerySmallScreen ? 10 : 12,
                  fontWeight: '600',
                  color: colors.textSecondary,
                  textAlign: 'center',
                }} numberOfLines={1}>
                  {newsData.length} новост{newsData.length === 1 ? 'ь' : newsData.length < 5 ? 'и' : 'ей'}
                </ThemedText>
              </View>
            )}
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
                    shadowColor: 'transparent',
                    shadowOffset: { width: 0, height: Platform.OS === 'android' ? 2 : 4 },
                    shadowOpacity: Platform.OS === 'android' ? 0 : 0.1,
                    shadowRadius: Platform.OS === 'android' ? 0 : 8,
                    elevation: Platform.OS === 'android' ? 2 : 6,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  onPress={() => router.push(`/news/${news.id}` as any)}
                >
                  <View style={{ flexDirection: 'row' }}>
                    {news.image && (
                      <View style={{
                        width: 60,
                        height: 60,
                        borderRadius: 12,
                        backgroundColor: colors.backgroundSecondary,
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
                        color: Platform.OS === 'android' ? colors.textSecondary : '#3B82F6',
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
          entering={FadeInDown.delay(750)}
          style={{
            marginTop: spacing.xl,
            paddingHorizontal: horizontalPadding,
            marginBottom: spacing.lg,
          }}
        >
          {Platform.OS === 'android' ? (
            <View
              style={{ 
                borderRadius: 20,
                backgroundColor: colors.surface,
                shadowColor: 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0,
                shadowRadius: 0,
                elevation: 2,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{
                backgroundColor: 'transparent',
                padding: spacing.xl,
                borderRadius: 20,
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
                {Platform.OS === 'android' ? (
                  <View
                    style={{
                      width: isVerySmallScreen ? 48 : 56,
                      height: isVerySmallScreen ? 48 : 56,
                      borderRadius: isVerySmallScreen ? 24 : 28,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: spacing.md,
                      backgroundColor: colors.backgroundSecondary,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Ionicons 
                      name="diamond" 
                      size={isVerySmallScreen ? 24 : 28} 
                      color={colors.primary} 
                    />
                  </View>
                ) : (
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
                )}
                <View style={{ flex: 1 }}>
                  <ThemedText style={{
                    fontSize: isVerySmallScreen ? fontSize.title : fontSize.title + 2,
                    fontWeight: '700',
                    color: Platform.OS === 'android' ? colors.text : '#FFFFFF',
                    marginBottom: 6,
                    letterSpacing: 0.5,
                  }}>
                    Совет дня
                  </ThemedText>
                  <ThemedText style={{
                    fontSize: fontSize.small,
                    color: Platform.OS === 'android' ? colors.textSecondary : 'rgba(255,255,255,0.8)',
                  }}>
                    Мотивация и полезные советы
                  </ThemedText>
                </View>
              </View>
              <View style={{
                backgroundColor: Platform.OS === 'android' ? colors.backgroundSecondary : 'rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: spacing.md,
                borderLeftWidth: 4,
                borderLeftColor: Platform.OS === 'android' ? colors.primary : 'rgba(255,255,255,0.3)',
              }}>
                <ThemedText style={{
                  fontSize: fontSize.body,
                  fontWeight: '500',
                  color: Platform.OS === 'android' ? colors.text : '#FFFFFF',
                  lineHeight: 24,
                  fontStyle: 'italic',
                }}>
                  "Стремитесь не к успеху, а к ценностям, которые он дает."
                </ThemedText>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm }}>
                  <Ionicons name="star" size={16} color={Platform.OS === 'android' ? colors.primary : "rgba(255,255,255,0.7)"} />
                  <ThemedText style={{
                    fontSize: fontSize.small,
                    color: Platform.OS === 'android' ? colors.textSecondary : 'rgba(255,255,255,0.7)',
                    marginLeft: spacing.xs,
                    fontWeight: '500',
                  }}>
                    Мотивация дня
                  </ThemedText>
                </View>
              </View>
              </View>
            </View>
          ) : (
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
          )}
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(850)}
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
                  shadowColor: Platform.OS === 'android' ? 'transparent' : '#F59E0B',
                  shadowOffset: { width: 0, height: Platform.OS === 'android' ? 2 : 4 },
                  shadowOpacity: Platform.OS === 'android' ? 0 : 0.3,
                  shadowRadius: Platform.OS === 'android' ? 0 : 8,
                  elevation: Platform.OS === 'android' ? 3 : 6,
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
                  shadowColor: Platform.OS === 'android' ? 'transparent' : colors.primary,
                  shadowOffset: { width: 0, height: Platform.OS === 'android' ? 2 : 4 },
                  shadowOpacity: Platform.OS === 'android' ? 0 : 0.3,
                  shadowRadius: Platform.OS === 'android' ? 0 : 8,
                  elevation: Platform.OS === 'android' ? 3 : 6,
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
                  shadowColor: Platform.OS === 'android' ? 'transparent' : '#10B981',
                  shadowOffset: { width: 0, height: Platform.OS === 'android' ? 2 : 4 },
                  shadowOpacity: Platform.OS === 'android' ? 0 : 0.3,
                  shadowRadius: Platform.OS === 'android' ? 0 : 8,
                  elevation: Platform.OS === 'android' ? 3 : 6,
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

// Оптимизированные стили для производительности
const styles = StyleSheet.create({
  quoteText: {
    fontSize: 16,
    lineHeight: 22,
    opacity: 0.95,
    marginTop: 4,
  },
  // Общие стили для статистических виджетов
  statWidget: {
    borderRadius: 20,
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  statWidgetContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statWidgetIcon: {
    marginBottom: 8,
  },
  statWidgetValue: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  statWidgetTitle: {
    textAlign: 'center',
    fontWeight: '500',
  },
  // Стили для карточек действий
  actionCard: {
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  actionCardText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  // Общий градиент
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});