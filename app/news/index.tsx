import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NewsCard } from '@/components/NewsCard';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, Typography } from '@/constants/DesignTokens';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchNews } from '@/store/slices/newsSlice';

export default function AllNewsScreen() {
  const dispatch = useAppDispatch();
  const { items: newsData, isLoading } = useAppSelector(state => state.news);

  React.useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  const renderNewsItem = ({ item: news, index }: { item: any; index: number }) => (
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
      style={{ marginBottom: Spacing.m }}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.duration(300)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: Spacing.m,
          paddingVertical: Spacing.s,
          backgroundColor: Colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: Colors.strokeSoft,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: Colors.surfaceSubtle,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: Spacing.m,
          }}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </Pressable>
        
        <View style={{ flex: 1 }}>
          <ThemedText style={{ ...Typography.titleH2, color: Colors.textPrimary }}>
            Все новости
          </ThemedText>
          <ThemedText style={{ ...Typography.caption, color: Colors.textSecondary }}>
            {newsData.length} {newsData.length === 1 ? 'новость' : newsData.length < 5 ? 'новости' : 'новостей'}
          </ThemedText>
        </View>
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
          entering={FadeInDown.duration(400)}
          style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: Spacing.xl
          }}
        >
          <Ionicons name="newspaper-outline" size={64} color={Colors.textSecondary} />
          <ThemedText style={{ 
            ...Typography.titleH2, 
            color: Colors.textSecondary,
            marginTop: Spacing.m,
            textAlign: 'center'
          }}>
            Пока нет новостей
          </ThemedText>
          <ThemedText style={{ 
            ...Typography.body, 
            color: Colors.textSecondary,
            marginTop: Spacing.s,
            textAlign: 'center'
          }}>
            Новости появятся здесь, когда администрация их опубликует
          </ThemedText>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
