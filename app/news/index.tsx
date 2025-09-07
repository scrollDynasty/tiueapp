import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, Platform, Pressable, View } from 'react-native';
import Animated, {
    FadeInDown,
    FadeInLeft,
    FadeInUp,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NewsCard } from '@/components/NewsCard';
import { ThemedText } from '@/components/ThemedText';
import { getThemeColors } from '@/constants/Colors';
import { Spacing, Typography } from '@/constants/DesignTokens';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchNews } from '@/store/slices/newsSlice';

const { width } = Dimensions.get('window');

export default function AllNewsScreen() {
  const dispatch = useAppDispatch();
  const { items: newsData, isLoading } = useAppSelector(state => state.news);
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  
  // Анимационные значения
  const headerOpacity = useSharedValue(1);
  const headerScale = useSharedValue(1);

  React.useEffect(() => {
    dispatch(fetchNews());
    
    // Анимация появления хедера
    headerScale.value = withSpring(1, {
      damping: 15,
      stiffness: 150
    });
  }, [dispatch]);

  // Стили для анимированного хедера
  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }]
  }));

  const renderNewsItem = ({ item: news, index }: { item: any; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 100).springify()}
    >
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
        style={{ 
          marginBottom: Spacing.m,
          marginHorizontal: Spacing.xs,
          borderRadius: 20,
          overflow: 'hidden',
          ...Platform.select({
            ios: {
              shadowColor: isDarkMode ? '#000' : '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDarkMode ? 0.3 : 0.1,
              shadowRadius: 8,
            },
            android: {
              elevation: 6,
            },
          }),
        }}
      />
    </Animated.View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Градиентный фон */}
      <LinearGradient
        colors={isDarkMode 
          ? ['#0F172A', '#1E293B', '#334155'] 
          : ['#F8FAFC', '#E2E8F0', '#CBD5E1']
        }
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        {/* Красивый Header с градиентом */}
        <Animated.View 
          style={[animatedHeaderStyle]}
        >
          <LinearGradient
            colors={isDarkMode 
              ? ['rgba(15,23,42,0.95)', 'rgba(30,41,59,0.90)', 'rgba(51,65,85,0.85)']
              : ['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.90)', 'rgba(241,245,249,0.85)']
            }
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: Spacing.m,
              paddingVertical: Spacing.l,
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
              marginBottom: Spacing.s,
              ...Platform.select({
                ios: {
                  shadowColor: isDarkMode ? '#000' : '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isDarkMode ? 0.3 : 0.1,
                  shadowRadius: 12,
                },
                android: {
                  elevation: 8,
                },
              }),
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View entering={SlideInRight.duration(400)}>
              <Pressable
                onPress={() => router.back()}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: Spacing.m,
                  borderWidth: 1,
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </Pressable>
            </Animated.View>
            
            <Animated.View 
              entering={FadeInLeft.delay(200).duration(500)}
              style={{ flex: 1 }}
            >
              <ThemedText style={{ 
                ...Typography.displayH1, 
                color: colors.text,
                fontSize: 28,
                fontWeight: '700',
                marginBottom: 4
              }}>
                📰 University News
              </ThemedText>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDarkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
                paddingHorizontal: Spacing.s,
                paddingVertical: 4,
                borderRadius: 12,
                alignSelf: 'flex-start'
              }}>
                <Ionicons 
                  name="newspaper" 
                  size={16} 
                  color={isDarkMode ? '#A5B4FC' : '#6366F1'} 
                  style={{ marginRight: 6 }}
                />
                <ThemedText style={{ 
                  ...Typography.caption, 
                  color: isDarkMode ? '#A5B4FC' : '#6366F1',
                  fontWeight: '600'
                }}>
                  {newsData.length} articles available
                </ThemedText>
              </View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* Список новостей */}
        {newsData.length > 0 ? (
          <FlatList
            data={newsData}
            renderItem={renderNewsItem}
            contentContainerStyle={{ 
              padding: Spacing.m,
              paddingBottom: Spacing.xl 
            }}
            showsVerticalScrollIndicator={false}
            refreshing={isLoading}
            onRefresh={() => dispatch(fetchNews())}
          />
        ) : (
          <Animated.View 
            entering={FadeInDown.delay(600).duration(800).springify()}
            style={{ 
              flex: 1, 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: Spacing.xl
            }}
          >
            {/* Красивый Empty State */}
            <LinearGradient
              colors={isDarkMode 
                ? ['rgba(99,102,241,0.1)', 'rgba(139,92,246,0.1)']
                : ['rgba(99,102,241,0.05)', 'rgba(139,92,246,0.05)']
              }
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Spacing.l
              }}
            >
              <Ionicons 
                name="newspaper-outline" 
                size={64} 
                color={isDarkMode ? '#A5B4FC' : '#6366F1'} 
              />
            </LinearGradient>
            
            <ThemedText style={{ 
              ...Typography.titleH2, 
              color: colors.text,
              marginBottom: Spacing.s,
              textAlign: 'center',
              fontWeight: '700'
            }}>
              📰 No News Yet
            </ThemedText>
            <ThemedText style={{ 
              ...Typography.body, 
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 24,
              maxWidth: width * 0.8
            }}>
              News articles will appear here when the administration publishes them. Check back soon!
            </ThemedText>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}
