import { ThemedText } from '@/components/ThemedText';
import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [focusedInput, setFocusedInput] = React.useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const { horizontalPadding, isSmallScreen, fontSize, spacing, isVerySmallScreen } = useResponsive();

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
      
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : horizontalPadding,
            paddingBottom: Platform.OS === 'android'
              ? (isVerySmallScreen ? 80 : isSmallScreen ? 85 : 90) + Math.max(insets.bottom, 0) // Компактные + insets для Android
              : (isVerySmallScreen ? 160 : isSmallScreen ? 140 : 120), // Обычные для iOS
          }}
        >
          {/* Современный заголовок в стиле главной страницы */}
          <Animated.View 
            entering={FadeInUp.duration(600).springify()}
            style={{ 
              paddingTop: insets.top + 10, // Контент заголовка под Dynamic Island + 10px
              marginBottom: spacing.sm,
            }}
          >
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginBottom: spacing.md,
              paddingBottom: spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
            }}>
              <LinearGradient
                colors={[`${colors.primary}20`, `${colors.primary}10`]}
                style={{
                  width: isVerySmallScreen ? 48 : 56,
                  height: isVerySmallScreen ? 48 : 56,
                  borderRadius: isVerySmallScreen ? 24 : 28,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                  borderWidth: 1,
                  borderColor: `${colors.primary}30`,
                  shadowColor: Platform.OS === 'android' ? 'transparent' : colors.primary,
                  shadowOffset: { width: 0, height: Platform.OS === 'android' ? 0 : 4 },
                  shadowOpacity: Platform.OS === 'android' ? 0 : 0.2,
                  shadowRadius: Platform.OS === 'android' ? 0 : 8,
                  elevation: Platform.OS === 'android' ? 1 : 6,
                }}
              >
                <Ionicons 
                  name="compass" 
                  size={isVerySmallScreen ? 24 : 28} 
                  color={colors.primary} 
                />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <ThemedText
                  style={{
                    fontSize: isVerySmallScreen ? fontSize.title + 2 : fontSize.title + 6,
                    lineHeight: isVerySmallScreen ? 24 : 32, // Добавляем lineHeight чтобы текст не обрезался
                    fontWeight: '800',
                    color: colors.text,
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  Исследования
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: fontSize.small,
                    color: colors.textSecondary,
                    lineHeight: 20,
                  }}
                >
                  Откройте для себя возможности университета
                </ThemedText>
              </View>
            </View>
          </Animated.View>

          {/* Поле поиска в стиле главной страницы */}
          <Animated.View 
            entering={SlideInDown.delay(200).duration(800).springify()}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 20,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              marginBottom: spacing.md,
              shadowColor: Platform.OS === 'android' ? 'transparent' : colors.primary,
              shadowOffset: { width: 0, height: Platform.OS === 'android' ? 2 : 6 },
              shadowOpacity: Platform.OS === 'android' ? 0 : (isDarkMode ? 0.2 : 0.1),
              shadowRadius: Platform.OS === 'android' ? 0 : 16,
              elevation: Platform.OS === 'android' ? 2 : 8,
              borderWidth: 1,
              borderColor: focusedInput === 'search' 
                ? `${colors.primary}40` 
                : isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <LinearGradient
                colors={focusedInput === 'search' 
                  ? [colors.primary, `${colors.primary}80`] 
                  : [`${colors.primary}20`, `${colors.primary}10`]
                }
                style={{
                  width: isVerySmallScreen ? 40 : 44,
                  height: isVerySmallScreen ? 40 : 44,
                  borderRadius: isVerySmallScreen ? 20 : 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md,
                  borderWidth: 1,
                  borderColor: focusedInput === 'search' 
                    ? `${colors.primary}40` 
                    : `${colors.primary}30`,
                }}
              >
                <Ionicons 
                  name="search" 
                  size={isVerySmallScreen ? 20 : 22} 
                  color={focusedInput === 'search' ? '#FFFFFF' : colors.primary}
                />
              </LinearGradient>
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

          {/* Секция категорий в стиле главной страницы */}
          <Animated.View entering={FadeInDown.delay(400).duration(800)}>

            <View style={{
              flexDirection: isVerySmallScreen ? 'column' : 'row',
              flexWrap: 'wrap',
              justifyContent: isVerySmallScreen ? 'flex-start' : 'space-between',
              gap: spacing.sm,
            }}>
              {categories.map((category, index) => (
                <Animated.View
                  key={category.title}
                  entering={FadeInUp.delay(500 + index * 100).duration(600).springify()}
                  style={{
                    width: isVerySmallScreen 
                      ? '100%' 
                      : (Dimensions.get('window').width - (isSmallScreen ? 40 : 48) - (isSmallScreen ? spacing.md : spacing.md)) / 2,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      width: '100%',
                      minHeight: isVerySmallScreen ? 90 : 120,
                      borderRadius: 16,
                      marginBottom: spacing.sm,
                      overflow: 'hidden',
                      shadowColor: Platform.OS === 'android' ? 'transparent' : category.color,
                      shadowOffset: { width: 0, height: Platform.OS === 'android' ? 2 : 6 },
                      shadowOpacity: Platform.OS === 'android' ? 0 : 0.25,
                      shadowRadius: Platform.OS === 'android' ? 0 : 12,
                      elevation: Platform.OS === 'android' ? 2 : 8,
                    }}
                  >
                    {/* Градиентный фон карточки в стиле главной страницы */}
                    <LinearGradient
                      colors={[category.color + '15', category.color + '25']}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: 20,
                      }}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    <View style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: colors.surface,
                      opacity: isDarkMode ? 0.9 : 0.95,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
                    }} />
                    
                    {/* Контейнер содержимого в стиле главной страницы */}
                    <View style={{ 
                      flex: 1, 
                      padding: isVerySmallScreen ? spacing.sm : spacing.md,
                      flexDirection: isVerySmallScreen ? 'row' : 'column',
                      justifyContent: isVerySmallScreen ? 'flex-start' : 'space-between',
                      alignItems: isVerySmallScreen ? 'center' : 'flex-start'
                    }}>
                      {/* Иконка с красивым градиентом */}
                      <LinearGradient
                        colors={[category.color, category.color + '80']}
                        style={{
                          width: isVerySmallScreen ? 32 : 48,
                          height: isVerySmallScreen ? 32 : 48,
                          borderRadius: isVerySmallScreen ? 16 : 24,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: isVerySmallScreen ? 0 : spacing.sm,
                          marginRight: isVerySmallScreen ? spacing.sm : 0,
                          shadowColor: Platform.OS === 'android' ? 'transparent' : category.color,
                          shadowOffset: { width: 0, height: Platform.OS === 'android' ? 0 : 4 },
                          shadowOpacity: Platform.OS === 'android' ? 0 : 0.3,
                          shadowRadius: Platform.OS === 'android' ? 0 : 8,
                          elevation: Platform.OS === 'android' ? 1 : 6,
                        }}
                      >
                        <Ionicons 
                          name={category.icon} 
                          size={isVerySmallScreen ? 18 : 28} 
                          color="#FFFFFF"
                        />
                      </LinearGradient>
                      
                      {/* Текстовый контент */}
                      <View style={{ flex: 1 }}>
                        <ThemedText
                          style={{
                            fontSize: isVerySmallScreen ? 12 : fontSize.body,
                            fontWeight: '700',
                            color: colors.text,
                            marginBottom: isVerySmallScreen ? 2 : 6,
                            letterSpacing: 0.3,
                          }}
                        >
                          {category.title}
                        </ThemedText>
                        <ThemedText
                          style={{
                            fontSize: isVerySmallScreen ? 10 : fontSize.small,
                            color: colors.textSecondary,
                            lineHeight: 18,
                            fontWeight: '500',
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

          {/* Быстрые действия в стиле главной страницы */}
          <Animated.View 
            entering={FadeInDown.delay(800).duration(800)}
            style={{ 
              marginTop: isVerySmallScreen ? spacing.md : spacing.lg,
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: isVerySmallScreen ? spacing.sm : spacing.md,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDarkMode ? 0.2 : 0.1,
              shadowRadius: 16,
              elevation: 8,
              borderWidth: 1,
              borderColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
            }}
          >
            {/* Заголовок секции */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginBottom: spacing.md,
              paddingBottom: spacing.xs,
              borderBottomWidth: 1,
              borderBottomColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
            }}>
              <LinearGradient
                colors={[`${colors.primary}20`, `${colors.primary}10`]}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                  borderWidth: 1,
                  borderColor: `${colors.primary}30`,
                }}
              >
                <Ionicons name="flash" size={16} color={colors.primary} />
              </LinearGradient>
              <ThemedText
                style={{
                  fontSize: fontSize.title,
                  fontWeight: '700',
                  color: colors.text,
                  letterSpacing: 0.5,
                }}
              >
                Быстрые действия
              </ThemedText>
            </View>

            <View style={{ gap: spacing.xs }}>
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
                      backgroundColor: isDarkMode ? `${colors.primary}05` : 'rgba(99, 102, 241, 0.03)',
                      borderRadius: 16,
                      padding: isVerySmallScreen ? spacing.sm : spacing.md,
                      borderWidth: 1,
                      borderColor: isDarkMode ? `${colors.primary}15` : 'rgba(99, 102, 241, 0.08)',
                      shadowColor: Platform.OS === 'android' ? 'transparent' : item.color,
                      shadowOffset: { width: 0, height: Platform.OS === 'android' ? 0 : 2 },
                      shadowOpacity: Platform.OS === 'android' ? 0 : 0.1,
                      shadowRadius: Platform.OS === 'android' ? 0 : 4,
                      elevation: Platform.OS === 'android' ? 1 : 2,
                    }}
                  >
                    <LinearGradient
                      colors={[item.color, item.color + '80']}
                      style={{
                        width: isVerySmallScreen ? 44 : 48,
                        height: isVerySmallScreen ? 44 : 48,
                        borderRadius: isVerySmallScreen ? 22 : 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: spacing.md,
                        shadowColor: Platform.OS === 'android' ? 'transparent' : item.color,
                        shadowOffset: { width: 0, height: Platform.OS === 'android' ? 0 : 3 },
                        shadowOpacity: Platform.OS === 'android' ? 0 : 0.3,
                        shadowRadius: Platform.OS === 'android' ? 0 : 6,
                        elevation: Platform.OS === 'android' ? 1 : 4,
                      }}
                    >
                      <Ionicons 
                        name={item.icon as any} 
                        size={isVerySmallScreen ? 20 : 22} 
                        color="#FFFFFF"
                      />
                    </LinearGradient>
                    <ThemedText
                      style={{
                        fontSize: fontSize.body,
                        color: colors.text,
                        flex: 1,
                        fontWeight: '600',
                      }}
                    >
                      {item.title}
                    </ThemedText>
                    <LinearGradient
                      colors={[`${colors.primary}20`, `${colors.primary}10`]}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons 
                        name="chevron-forward" 
                        size={16} 
                        color={colors.primary}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </View>
  );
}
