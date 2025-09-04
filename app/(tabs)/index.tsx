import { ActionCard } from '@/components/ActionCard';
import { AnimatedHeader } from '@/components/AnimatedHeader';
import { CustomRefreshControl } from '@/components/CustomRefreshControl';
import { NewsCard } from '@/components/NewsCard';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing } from '@/constants/DesignTokens';
import { useResponsive } from '@/hooks/useResponsive';
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
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = React.useState(false);
  const { horizontalPadding, cardGap, cardWidth, cardHeight } = useResponsive();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Имитация загрузки данных
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const newsData = [
    {
      id: 1,
      title: "Новая система электронного обучения",
      subtitle: "Запуск современной LMS платформы для всех студентов",
      date: "15 мин назад",
      icon: "school-outline" as const,
    },
    {
      id: 2,
      title: "Стипендиальная программа",
      subtitle: "Открыт приём заявок на повышенную академическую стипендию",
      date: "2 часа назад", 
      icon: "trophy-outline" as const,
    },
    {
      id: 3,
      title: "Научная конференция",
      subtitle: "25-27 сентября состоится международная студенческая конференция",
      date: "1 день назад",
      icon: "people-outline" as const,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Верхняя панель */}
      <AnimatedHeader 
        userName="Emily"
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
            {newsData.map((news, index) => (
              <NewsCard
                key={news.id}
                title={news.title}
                subtitle={news.subtitle}
                date={news.date}
                icon={news.icon}
                index={index}
                onPress={() => console.log(`News ${news.id} pressed`)}
              />
            ))}
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
