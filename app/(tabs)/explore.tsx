import React from 'react';
import { ScrollView, View, TextInput } from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ActionCard } from '@/components/ActionCard';
import { Colors, Spacing, Typography, Shadows } from '@/constants/DesignTokens';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const categories = [
    { title: "БИБЛИОТЕКА", icon: "library-outline" as const },
    { title: "ЛАБОРАТОРИИ", icon: "flask-outline" as const },
    { title: "КАФЕДРЫ", icon: "school-outline" as const },
    { title: "СПОРТ", icon: "fitness-outline" as const },
    { title: "СТУДСОВЕТ", icon: "people-outline" as const },
    { title: "МЕРОПРИЯТИЯ", icon: "calendar-outline" as const },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.l,
          paddingBottom: 100,
        }}
      >
        {/* Заголовок */}
        <Animated.View 
          entering={SlideInRight.duration(400)}
          style={{ paddingVertical: Spacing.l }}
        >
          <ThemedText
            style={{
              ...Typography.displayH1,
              color: Colors.textPrimary,
              marginBottom: Spacing.s,
            }}
          >
            Поиск
          </ThemedText>
          <ThemedText
            style={{
              ...Typography.body,
              color: Colors.textSecondary,
            }}
          >
            Найдите всё, что нужно для учёбы
          </ThemedText>
        </Animated.View>

        {/* Поиск */}
        <Animated.View 
          entering={FadeInDown.delay(200)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.surfaceSubtle,
            borderRadius: 16,
            paddingHorizontal: Spacing.m,
            paddingVertical: Spacing.s,
            marginBottom: Spacing.xl,
            ...Shadows.card,
          }}
        >
          <Ionicons 
            name="search-outline" 
            size={20} 
            color={Colors.textSecondary} 
            style={{ marginRight: Spacing.s }}
          />
          <TextInput
            placeholder="Поиск по университету..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              fontSize: 16,
              color: Colors.textPrimary,
            }}
            placeholderTextColor={Colors.textSecondary}
          />
        </Animated.View>

        {/* Категории */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <ThemedText
            style={{
              ...Typography.titleH2,
              color: Colors.textPrimary,
              marginBottom: Spacing.m,
            }}
          >
            Категории
          </ThemedText>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: Spacing.m,
            }}
          >
            {categories.map((category, index) => (
              <ActionCard
                key={category.title}
                title={category.title}
                icon={category.icon}
                onPress={() => console.log(`${category.title} pressed`)}
                style={{ 
                  width: '48%',
                  marginBottom: Spacing.m,
                }}
              />
            ))}
          </View>
        </Animated.View>

        {/* Популярные запросы */}
        <Animated.View 
          entering={FadeInDown.delay(600)}
          style={{ marginTop: Spacing.l }}
        >
          <ThemedText
            style={{
              ...Typography.titleH2,
              color: Colors.textPrimary,
              marginBottom: Spacing.m,
            }}
          >
            Популярные запросы
          </ThemedText>

          <View style={{ gap: Spacing.s }}>
            {['Расписание экзаменов', 'Электронная библиотека', 'Стипендия', 'Общежитие'].map((query, index) => (
              <Animated.View
                key={query}
                entering={FadeInDown.delay(700 + index * 100)}
                style={{
                  backgroundColor: Colors.chipBg,
                  borderRadius: 12,
                  paddingHorizontal: Spacing.m,
                  paddingVertical: Spacing.s,
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 14,
                    color: Colors.brandPrimary,
                  }}
                >
                  {query}
                </ThemedText>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
