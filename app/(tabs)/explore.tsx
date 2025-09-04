import { ActionCard } from '@/components/ActionCard';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Shadows } from '@/constants/DesignTokens';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { horizontalPadding, cardGap, cardWidth, cardHeight, isSmallScreen, fontSize, spacing } = useResponsive();

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
          paddingHorizontal: horizontalPadding,
          paddingBottom: 100,
        }}
      >
        {/* Заголовок */}
        <Animated.View 
          entering={SlideInRight.duration(400)}
          style={{ paddingVertical: spacing.lg }}
        >
          <ThemedText
            style={{
              fontSize: fontSize.header,
              lineHeight: fontSize.header * 1.2,
              fontWeight: '700',
              color: Colors.textPrimary,
              marginBottom: spacing.sm,
            }}
          >
            Поиск
          </ThemedText>
          <ThemedText
            style={{
              fontSize: fontSize.body,
              lineHeight: fontSize.body * 1.5,
              fontWeight: '400',
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
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            marginBottom: spacing.xl,
            ...Shadows.card,
          }}
        >
          <Ionicons 
            name="search-outline" 
            size={isSmallScreen ? 18 : 20} 
            color={Colors.textSecondary} 
            style={{ marginRight: spacing.sm }}
          />
          <TextInput
            placeholder="Поиск по университету..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              flex: 1,
              fontSize: fontSize.body,
              color: Colors.textPrimary,
            }}
            placeholderTextColor={Colors.textSecondary}
          />
        </Animated.View>

        {/* Категории */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <ThemedText
            style={{
              fontSize: fontSize.title,
              lineHeight: fontSize.title * 1.3,
              fontWeight: '600',
              color: Colors.textPrimary,
              marginBottom: spacing.md,
            }}
          >
            Категории
          </ThemedText>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: cardGap,
            }}
          >
            {categories.map((category, index) => (
              <ActionCard
                key={category.title}
                title={category.title}
                icon={category.icon}
                onPress={() => console.log(`${category.title} pressed`)}
                style={{ 
                  width: cardWidth,
                  height: cardHeight,
                  marginBottom: cardGap,
                }}
              />
            ))}
          </View>
        </Animated.View>

        {/* Популярные запросы */}
        <Animated.View 
          entering={FadeInDown.delay(600)}
          style={{ marginTop: spacing.xl }}
        >
          <ThemedText
            style={{
              fontSize: fontSize.title,
              lineHeight: fontSize.title * 1.3,
              fontWeight: '600',
              color: Colors.textPrimary,
              marginBottom: spacing.md,
            }}
          >
            Популярные запросы
          </ThemedText>

          <View style={{ gap: spacing.sm }}>
            {['Расписание экзаменов', 'Электронная библиотека', 'Стипендия', 'Общежитие'].map((query, index) => (
              <Animated.View
                key={query}
                entering={FadeInDown.delay(700 + index * 100)}
                style={{
                  backgroundColor: Colors.chipBg,
                  borderRadius: 12,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                }}
              >
                <ThemedText
                  style={{
                    fontSize: fontSize.body,
                    fontWeight: '500',
                    color: Colors.chipIcon,
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
