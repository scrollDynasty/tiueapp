import { ActionCard } from '@/components/ActionCard';
import { AnimatedHeader } from '@/components/AnimatedHeader';
import { CustomRefreshControl } from '@/components/CustomRefreshControl';
import { NewsCard } from '@/components/NewsCard';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing } from '@/constants/DesignTokens';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useResponsive } from '@/hooks/useResponsive';
import { fetchEvents } from '@/store/slices/eventsSlice';
import { fetchNews } from '@/store/slices/newsSlice';
import React from 'react';
import { ScrollView, View } from 'react-native';
import Animated, {
  FadeInDown,
  SlideInRight,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = React.useState(false);
  const { horizontalPadding, cardGap, cardWidth, cardHeight } = useResponsive();
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

  // Получаем новости из Redux store
  const { items: newsData, isLoading: newsLoading } = useAppSelector((state) => state.news);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Верхняя панель */}
      <AnimatedHeader 
        userName={user?.first_name || user?.username || 'Пользователь'}
        notificationCount={3}
        onAvatarPress={() => console.log('Avatar pressed')}
        onNotificationPress={() => console.log('Notifications pressed')}
      />

              <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <CustomRefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: 100,
        }}
      >
        {/* Сетка карточек 2x2 */}
        <Animated.View
          entering={FadeInDown.delay(300)}
          style={{
            marginBottom: 32,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: cardGap,
            }}
          >
            <ActionCard
              title="COURSES"
              icon="book-outline"
              onPress={() => console.log('Courses pressed')}
              style={{ width: cardWidth, height: cardHeight }}
            />
            <ActionCard
              title="SCHEDULE"
              icon="calendar-outline"
              onPress={() => console.log('Schedule pressed')}
              style={{ width: cardWidth, height: cardHeight }}
            />
            <ActionCard
              title="ASSIGNMENTS"
              icon="list-outline"
              onPress={() => console.log('Assignments pressed')}
              style={{ width: cardWidth, height: cardHeight }}
            />
            <ActionCard
              title="GRADES"
              icon="analytics-outline"
              onPress={() => console.log('Grades pressed')}
              style={{ width: cardWidth, height: cardHeight }}
            />
          </View>
        </Animated.View>

        {/* Секция новостей */}
        <Animated.View entering={SlideInRight.delay(500)}>
          <ThemedText
            style={{
              fontSize: 20,
              lineHeight: 26,
              fontWeight: '600',
              color: '#1E1E1E',
              marginBottom: 16,
              fontFamily: 'Inter',
            }}
          >
            University News
          </ThemedText>

          <View style={{ gap: 12 }}>
            {newsData.length > 0 ? (
              newsData.map((news, index) => (
                <NewsCard
                  key={news.id}
                  title={news.title}
                  subtitle={news.subtitle}
                  date={news.date}
                  icon={news.icon}
                  index={index}
                  onPress={() => console.log(`News ${news.id} pressed`)}
                />
              ))
            ) : (
              <View style={{
                backgroundColor: '#F5F7FB',
                borderRadius: 16,
                padding: 24,
                alignItems: 'center',
              }}>
                <ThemedText style={{
                  fontSize: 16,
                  color: '#475569',
                  textAlign: 'center',
                }}>
                  Новостей пока нет
                </ThemedText>
                <ThemedText style={{
                  fontSize: 14,
                  color: '#94A3B8',
                  textAlign: 'center',
                  marginTop: 4,
                }}>
                  Администратор может добавить новости
                </ThemedText>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Дополнительный контент для демонстрации скролла */}
        <View style={{ height: Spacing.xl }} />
        
        <Animated.View 
          entering={FadeInDown.delay(700)}
          style={{
            padding: 20,
            backgroundColor: '#F5F7FB',
            borderRadius: 16,
            marginTop: 24,
          }}
        >
          <ThemedText
            style={{
              fontSize: 16,
              lineHeight: 24,
              fontWeight: '500',
              color: '#475569',
              textAlign: 'center',
              fontFamily: 'Inter',
            }}
          >
            Добро пожаловать в новую версию университетского приложения! 
            Здесь вы найдете все необходимые инструменты для успешной учёбы.
          </ThemedText>
        </Animated.View>
      </AnimatedScrollView>
    </SafeAreaView>
  );
}
