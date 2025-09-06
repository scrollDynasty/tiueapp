import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/DesignTokens';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [focusedInput, setFocusedInput] = React.useState<string | null>(null);
  const { horizontalPadding, cardGap, cardWidth, cardHeight, isSmallScreen, fontSize, spacing } = useResponsive();

  const categories = [
    { 
      title: "БИБЛИОТЕКА", 
      icon: "library-outline" as const,
      color: '#6366F1',
      bgColor: '#EEF2FF',
      description: "Электронные книги и ресурсы"
    },
    { 
      title: "ЛАБОРАТОРИИ", 
      icon: "flask-outline" as const,
      color: '#EC4899',
      bgColor: '#FDF2F8',
      description: "Научные исследования"
    },
    { 
      title: "КАФЕДРЫ", 
      icon: "school-outline" as const,
      color: '#10B981',
      bgColor: '#ECFDF5',
      description: "Преподаватели и курсы"
    },
    { 
      title: "СПОРТ", 
      icon: "fitness-outline" as const,
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      description: "Спортивные секции"
    },
    { 
      title: "СТУДСОВЕТ", 
      icon: "people-outline" as const,
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
      description: "Студенческая жизнь"
    },
    { 
      title: "МЕРОПРИЯТИЯ", 
      icon: "calendar-outline" as const,
      color: '#EF4444',
      bgColor: '#FEF2F2',
      description: "События и концерты"
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Градиентный фон */}
      <LinearGradient
        colors={['#FAFAFA', '#F8FAFC', '#EEF2F7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingBottom: 120,
          }}
        >
          {/* Современный заголовок */}
          <Animated.View 
            entering={FadeInUp.duration(600).springify()}
            style={{ paddingVertical: spacing.lg }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
              <View style={{
                width: 4,
                height: 32,
                backgroundColor: Colors.brandPrimary,
                borderRadius: 2,
                marginRight: spacing.sm
              }} />
              <ThemedText
                style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: Colors.textPrimary,
                  letterSpacing: -0.5,
                }}
              >
                Исследуйте
              </ThemedText>
            </View>
            <ThemedText
              style={{
                fontSize: 16,
                fontWeight: '400',
                color: Colors.textSecondary,
                lineHeight: 24,
                marginLeft: spacing.lg,
              }}
            >
              Откройте для себя возможности университета
            </ThemedText>
          </Animated.View>

          {/* Улучшенное поле поиска */}
          <Animated.View 
            entering={SlideInDown.delay(200).duration(800).springify()}
            style={{
              backgroundColor: Colors.surface,
              borderRadius: 20,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              marginBottom: spacing.xl,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 20,
              elevation: 8,
              borderWidth: 1,
              borderColor: focusedInput === 'search' ? Colors.brandPrimary + '40' : 'rgba(0,0,0,0.05)',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: focusedInput === 'search' ? Colors.brandPrimary + '15' : Colors.surfaceSubtle,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.sm
              }}>
                <Ionicons 
                  name="search-outline" 
                  size={20} 
                  color={focusedInput === 'search' ? Colors.brandPrimary : Colors.textSecondary}
                />
              </View>
              <TextInput
                placeholder="Что вы ищете?"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: Colors.textPrimary,
                  fontWeight: '500',
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  margin: 0,
                  padding: 0,
                  ...(Platform.OS === 'android' && {
                    includeFontPadding: false,
                    textAlignVertical: 'center',
                  }),
                  ...(Platform.OS === 'web' && {
                    outline: 'none',
                    boxShadow: 'none',
                  }),
                }}
                placeholderTextColor={Colors.textSecondary}
                onFocus={() => setFocusedInput('search')}
                onBlur={() => setFocusedInput(null)}
                underlineColorAndroid="transparent"
                selectTextOnFocus={false}
                blurOnSubmit={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setSearchQuery('')}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: Colors.surfaceSubtle,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: spacing.sm
                  }}
                >
                  <Ionicons name="close" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* Современные категории */}
          <Animated.View entering={FadeInDown.delay(400).duration(800)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
              <ThemedText
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: Colors.textPrimary,
                  flex: 1,
                }}
              >
                Категории
              </ThemedText>
              <TouchableOpacity style={{
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: 8,
                backgroundColor: Colors.brandPrimary + '10',
              }}>
                <ThemedText style={{ fontSize: 14, color: Colors.brandPrimary, fontWeight: '600' }}>
                  Все
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: spacing.md,
            }}>
              {categories.map((category, index) => (
                <Animated.View
                  key={category.title}
                  entering={FadeInUp.delay(500 + index * 100).duration(600).springify()}
                >
                  <TouchableOpacity
                    style={{
                      width: (Dimensions.get('window').width - 48 - spacing.md) / 2,
                      backgroundColor: Colors.surface,
                      borderRadius: 16,
                      padding: spacing.lg,
                      marginBottom: spacing.md,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.06,
                      shadowRadius: 10,
                      elevation: 3,
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,0,0.04)',
                    }}
                    onPress={() => console.log(`${category.title} pressed`)}
                  >
                    <View style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      backgroundColor: category.bgColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: spacing.sm,
                    }}>
                      <Ionicons 
                        name={category.icon} 
                        size={24} 
                        color={category.color}
                      />
                    </View>
                    <ThemedText
                      style={{
                        fontSize: 14,
                        fontWeight: '700',
                        color: Colors.textPrimary,
                        marginBottom: 4,
                        letterSpacing: -0.2,
                      }}
                    >
                      {category.title}
                    </ThemedText>
                    <ThemedText
                      style={{
                        fontSize: 12,
                        fontWeight: '400',
                        color: Colors.textSecondary,
                        lineHeight: 16,
                      }}
                    >
                      {category.description}
                    </ThemedText>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Быстрые действия */}
          <Animated.View 
            entering={FadeInDown.delay(800).duration(800)}
            style={{ marginTop: spacing.xl }}
          >
            <ThemedText
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: Colors.textPrimary,
                marginBottom: spacing.lg,
              }}
            >
              Быстрые действия
            </ThemedText>

            <View style={{ gap: spacing.sm }}>
              {[
                { title: 'Расписание экзаменов', icon: 'calendar', color: '#EF4444' },
                { title: 'Электронная библиотека', icon: 'book', color: '#6366F1' },
                { title: 'Подать заявление', icon: 'document-text', color: '#10B981' },
                { title: 'Справки и документы', icon: 'folder', color: '#F59E0B' },
              ].map((item, index) => (
                <Animated.View
                  key={item.title}
                  entering={FadeInDown.delay(900 + index * 100).duration(600)}
                >
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: Colors.surface,
                      borderRadius: 16,
                      padding: spacing.lg,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,0,0.04)',
                    }}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: item.color + '15',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: spacing.md,
                    }}>
                      <Ionicons 
                        name={item.icon as any} 
                        size={20} 
                        color={item.color}
                      />
                    </View>
                    <ThemedText
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: Colors.textPrimary,
                        flex: 1,
                      }}
                    >
                      {item.title}
                    </ThemedText>
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
