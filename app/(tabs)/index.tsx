import { AnimatedHeader } from '@/components/AnimatedHeader';
import { CustomRefreshControl } from '@/components/CustomRefreshControl';
import { DailyTipCard } from '@/components/home/DailyTipCard';
import { ImportantNewsSection } from '@/components/home/ImportantNewsSection';
import { NewsSection } from '@/components/home/NewsSection';
import { QuickActionsSection } from '@/components/home/QuickActionsSection';
import { QuickLinksCard } from '@/components/home/QuickLinksCard';
import { StatsSection } from '@/components/home/StatsSection';
import { UpcomingEventsSection } from '@/components/home/UpcomingEventsSection';
import { NotificationModal } from '@/components/NotificationModal';
import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useResponsive } from '@/hooks/useResponsive';
import { fetchEvents } from '@/store/slices/eventsSlice';
import { fetchNews } from '@/store/slices/newsSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
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
  const { padding, spacing, borderRadius } = useResponsive();
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
    } catch (error) {
      // handle error silently in production
      if (__DEV__) {
        console.error('Refresh error:', error);
      }
    } finally {
      setRefreshing(false);
    }
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


  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    background: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    safeArea: {
      flex: 1,
    },
    scrollContainer: {
      paddingHorizontal: padding,
      paddingBottom: spacing.xl + spacing.lg, // 90 equivalent
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDarkMode 
          ? ['#0F172A', '#1E293B', '#334155']
          : ['#FAFAFA', '#F8FAFC', '#EEF2F7']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      
      <SafeAreaView style={styles.safeArea}>
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
          contentContainerStyle={styles.scrollContainer}
        >
          <StatsSection statsData={statsData} />
          
          <QuickActionsSection userRole={user?.role} />
          
          <UpcomingEventsSection events={upcomingEvents} />
          
          <ImportantNewsSection news={importantNews} />
          
          <NewsSection news={newsData} />
          
          <DailyTipCard />
          
          <QuickLinksCard />
        </AnimatedScrollView>
      </SafeAreaView>
    </View>
  );
}