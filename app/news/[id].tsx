import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { Colors, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { useAppSelector } from '@/hooks/redux';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams();
  const news = useAppSelector(state => state.news.items.find(item => item.id === id));

  if (!news) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: Spacing.xl
        }}>
          <Ionicons name="newspaper-outline" size={64} color={Colors.textSecondary} />
          <ThemedText style={{ 
            ...Typography.titleH2, 
            color: Colors.textSecondary,
            marginTop: Spacing.m,
            textAlign: 'center'
          }}>
            Новость не найдена
          </ThemedText>
          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: Colors.brandPrimary,
              borderRadius: 12,
              paddingHorizontal: Spacing.l,
              paddingVertical: Spacing.m,
              marginTop: Spacing.l,
            }}
          >
            <ThemedText style={{ color: Colors.surface, fontWeight: '600' }}>
              Назад
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
          <ThemedText style={{ ...Typography.caption, color: Colors.textSecondary }}>
            Новость
          </ThemedText>
          <ThemedText style={{ ...Typography.body, fontWeight: '600' }} numberOfLines={1}>
            {news.title}
          </ThemedText>
        </View>
      </Animated.View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Spacing.m }}
        showsVerticalScrollIndicator={false}
      >
        {/* Изображение */}
        {news.image && (
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <Image
              source={{ uri: news.image }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 12,
                marginBottom: Spacing.l,
                backgroundColor: Colors.surfaceSubtle,
              }}
              resizeMode="cover"
            />
          </Animated.View>
        )}

        {/* Заголовок и мета информация */}
        <Animated.View 
          entering={FadeInDown.duration(400).delay(200)}
          style={{ marginBottom: Spacing.l }}
        >
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center',
            marginBottom: Spacing.s
          }}>
            <View style={{
              backgroundColor: Colors.brandPrimary + '20',
              borderRadius: 8,
              paddingHorizontal: Spacing.s,
              paddingVertical: 4,
              marginRight: Spacing.s,
            }}>
              <Ionicons name={news.icon as any} size={16} color={Colors.brandPrimary} />
            </View>
            <ThemedText style={{ 
              ...Typography.caption, 
              color: Colors.textSecondary,
              flex: 1
            }}>
              {news.date && new Date(news.date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </ThemedText>
          </View>

          <ThemedText style={{ 
            ...Typography.titleH2, 
            marginBottom: Spacing.s,
            lineHeight: 32
          }}>
            {news.title}
          </ThemedText>

          <ThemedText style={{ 
            ...Typography.body, 
            color: Colors.textSecondary,
            lineHeight: 24
          }}>
            {news.subtitle}
          </ThemedText>
        </Animated.View>

        {/* Содержание */}
        <Animated.View 
          entering={FadeInDown.duration(400).delay(300)}
          style={{
            backgroundColor: Colors.surfaceSubtle,
            borderRadius: 12,
            padding: Spacing.l,
            ...Shadows.card,
          }}
        >
          <ThemedText style={{ 
            ...Typography.body,
            lineHeight: 24,
            color: Colors.textPrimary
          }}>
            {news.content}
          </ThemedText>
        </Animated.View>

        {/* Автор и дополнительная информация */}
        <Animated.View 
          entering={FadeInDown.duration(400).delay(400)}
          style={{
            marginTop: Spacing.l,
            padding: Spacing.m,
            backgroundColor: Colors.surfaceSubtle,
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: Colors.brandPrimary,
          }}
        >
          <ThemedText style={{ 
            ...Typography.caption, 
            color: Colors.textSecondary,
            marginBottom: 4
          }}>
            Автор новости
          </ThemedText>
          <ThemedText style={{ 
            ...Typography.body, 
            fontWeight: '600'
          }}>
            {(news as any).author_name || 'Администрация'}
          </ThemedText>
        </Animated.View>

        {/* Дополнительное пространство внизу */}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}
