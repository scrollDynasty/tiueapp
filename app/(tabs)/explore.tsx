import { ThemedText } from '@/components/ThemedText';
import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [focusedInput, setFocusedInput] = React.useState<string | null>(null);
  const { horizontalPadding, cardGap, cardWidth, cardHeight, isSmallScreen, fontSize, spacing, isVerySmallScreen } = useResponsive();

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
        colors={isDarkMode 
          ? ['#0F172A', '#1E293B', '#334155']
          : ['#FAFAFA', '#F8FAFC', '#EEF2F7']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : horizontalPadding,
            paddingBottom: isVerySmallScreen ? spacing.lg : isSmallScreen ? spacing.xl : 120,
          }}
        >
          {/* Современный заголовок */}
          <Animated.View 
            entering={FadeInUp.duration(600).springify()}
            style={{ paddingVertical: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : spacing.lg }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : spacing.sm }}>
              <View style={{
                width: 4,
                height: isVerySmallScreen ? 24 : isSmallScreen ? 28 : 32,
                backgroundColor: colors.primary,
                borderRadius: 2,
                marginRight: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : spacing.sm
              }} />
              <ThemedText
                style={{
                  fontSize: isVerySmallScreen ? fontSize.title : isSmallScreen ? 24 : 28,
                  color: colors.text,
                  letterSpacing: -0.5,
                }}
              >
                Исследуйте
              </ThemedText>
            </View>
            <ThemedText
              style={{
                fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? fontSize.body : 16,
                color: colors.textSecondary,
                lineHeight: isVerySmallScreen ? 18 : isSmallScreen ? 20 : 24,
                marginLeft: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : spacing.lg,
              }}
            >
              Откройте для себя возможности университета
            </ThemedText>
          </Animated.View>

          {/* Улучшенное поле поиска */}
          <Animated.View 
            entering={SlideInDown.delay(200).duration(800).springify()}
            style={{
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : colors.surface,
              borderRadius: isVerySmallScreen ? 16 : isSmallScreen ? 18 : 20,
              paddingHorizontal: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : spacing.lg,
              paddingVertical: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : spacing.md,
              marginBottom: isVerySmallScreen ? spacing.lg : isSmallScreen ? spacing.xl : spacing.xl,
              shadowColor: isDarkMode ? '#000' : '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDarkMode ? 0.3 : 0.08,
              shadowRadius: 20,
              elevation: 8,
              borderWidth: 1,
              borderColor: focusedInput === 'search' 
                ? colors.primary + '40' 
                : isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: isVerySmallScreen ? 36 : isSmallScreen ? 38 : 40,
                height: isVerySmallScreen ? 36 : isSmallScreen ? 38 : 40,
                borderRadius: isVerySmallScreen ? 10 : isSmallScreen ? 11 : 12,
                backgroundColor: focusedInput === 'search' 
                  ? colors.primary + '15' 
                  : isDarkMode ? 'rgba(255,255,255,0.08)' : colors.surfaceSecondary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : spacing.sm
              }}>
                <Ionicons 
                  name="search-outline" 
                  size={isVerySmallScreen ? 18 : isSmallScreen ? 19 : 20} 
                  color={focusedInput === 'search' ? colors.primary : colors.textSecondary}
                />
              </View>
              <TextInput
                placeholder="Что вы ищете?"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                  flex: 1,
                  fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? fontSize.body : 16,
                  color: colors.text,
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
                placeholderTextColor={colors.textSecondary}
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
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : colors.surfaceSecondary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: spacing.sm
                  }}
                >
                  <Ionicons name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* Современные категории */}
          <Animated.View entering={FadeInDown.delay(400).duration(800)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : spacing.lg }}>
              <ThemedText
                style={{
                  fontSize: isVerySmallScreen ? fontSize.body : isSmallScreen ? fontSize.title : 20,
                  color: colors.text,
                  flex: 1,
                }}
              >
                Категории
              </ThemedText>
              <TouchableOpacity style={{
                paddingHorizontal: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : spacing.sm,
                paddingVertical: isVerySmallScreen ? 4 : isSmallScreen ? spacing.xs : spacing.xs,
                borderRadius: 8,
                backgroundColor: colors.primary + '10',
              }}>
                <ThemedText style={{ fontSize: 14, color: colors.primary }}>
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
                      width: (Dimensions.get('window').width - (isVerySmallScreen ? 32 : isSmallScreen ? 40 : 48) - (isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : spacing.md)) / 2,
                      minHeight: isVerySmallScreen ? 140 : isSmallScreen ? 150 : 160,
                      backgroundColor: 'transparent',
                      borderRadius: isVerySmallScreen ? 16 : isSmallScreen ? 18 : 20,
                      padding: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : spacing.lg,
                      marginBottom: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : spacing.md,
                      overflow: 'hidden',
                      justifyContent: 'flex-start',
                      ...Platform.select({
                        ios: {
                          shadowColor: isDarkMode ? '#000' : '#000',
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: isDarkMode ? 0.4 : 0.12,
                          shadowRadius: 16,
                        },
                        android: {
                          elevation: isDarkMode ? 12 : 8,
                        },
                      }),
                    }}
                  >
                    {/* Градиентный фон карточки */}
                    <LinearGradient
                      colors={isDarkMode 
                        ? ['rgba(30,41,59,0.8)', 'rgba(51,65,85,0.6)']
                        : ['rgba(255,255,255,0.9)', 'rgba(248,250,252,0.8)']
                      }
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: isVerySmallScreen ? 16 : isSmallScreen ? 18 : 20,
                        borderWidth: 1,
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      }}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    
                    {/* Контейнер содержимого */}
                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                      {/* Иконка с градиентным фоном */}
                      <LinearGradient
                        colors={[category.color + '20', category.color + '10']}
                        style={{
                          width: isVerySmallScreen ? 48 : isSmallScreen ? 52 : 56,
                          height: isVerySmallScreen ? 48 : isSmallScreen ? 52 : 56,
                          borderRadius: isVerySmallScreen ? 16 : isSmallScreen ? 17 : 18,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : spacing.md,
                          borderWidth: 1,
                          borderColor: category.color + '30',
                        }}
                      >
                        <Ionicons 
                          name={category.icon} 
                          size={isVerySmallScreen ? 24 : isSmallScreen ? 26 : 28} 
                          color={category.color}
                        />
                      </LinearGradient>
                      
                      {/* Текстовый контент */}
                      <View style={{ flex: 1 }}>
                        <ThemedText
                          style={{
                            fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? 13 : 14,
                            color: colors.text,
                            marginBottom: 4,
                            letterSpacing: -0.2,
                          }}
                        >
                          {category.title}
                        </ThemedText>
                        <ThemedText
                          style={{
                            fontSize: isVerySmallScreen ? 10 : isSmallScreen ? 11 : 12,
                            color: colors.textSecondary,
                            lineHeight: isVerySmallScreen ? 14 : isSmallScreen ? 15 : 16,
                          }}
                        >
                          {category.description}
                        </ThemedText>
                      </View>
                    </View>
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
                fontSize: isVerySmallScreen ? fontSize.body : isSmallScreen ? fontSize.title : 20,
                color: colors.text,
                marginBottom: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : spacing.lg,
              }}
            >
              Быстрые действия
            </ThemedText>

            <View style={{ gap: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : spacing.sm }}>
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
                      backgroundColor: 'transparent',
                      borderRadius: isVerySmallScreen ? 12 : isSmallScreen ? 14 : 16,
                      padding: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : spacing.lg,
                      overflow: 'hidden',
                      ...Platform.select({
                        ios: {
                          shadowColor: isDarkMode ? '#000' : '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: isDarkMode ? 0.3 : 0.08,
                          shadowRadius: 12,
                        },
                        android: {
                          elevation: isDarkMode ? 8 : 4,
                        },
                      }),
                    }}
                  >
                    {/* Градиентный фон для быстрых действий */}
                    <LinearGradient
                      colors={isDarkMode 
                        ? ['rgba(30,41,59,0.6)', 'rgba(51,65,85,0.4)']
                        : ['rgba(255,255,255,0.8)', 'rgba(248,250,252,0.6)']
                      }
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: isVerySmallScreen ? 12 : isSmallScreen ? 14 : 16,
                        borderWidth: 1,
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                      }}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    
                    <View style={{
                      width: isVerySmallScreen ? 36 : isSmallScreen ? 38 : 40,
                      height: isVerySmallScreen ? 36 : isSmallScreen ? 38 : 40,
                      borderRadius: isVerySmallScreen ? 10 : isSmallScreen ? 11 : 12,
                      backgroundColor: item.color + '15',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : spacing.md,
                    }}>
                      <Ionicons 
                        name={item.icon as any} 
                        size={isVerySmallScreen ? 18 : isSmallScreen ? 19 : 20} 
                        color={item.color}
                      />
                    </View>
                    <ThemedText
                      style={{
                        fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? fontSize.body : 16,
                        color: colors.text,
                        flex: 1,
                      }}
                    >
                      {item.title}
                    </ThemedText>
                    <Ionicons 
                      name="chevron-forward" 
                      size={isVerySmallScreen ? 18 : isSmallScreen ? 19 : 20} 
                      color={colors.textSecondary}
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
