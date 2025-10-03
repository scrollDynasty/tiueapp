import { ThemedText } from '@/components/ThemedText';
import { getApiBaseUrl } from '@/config/environment';
import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSelector } from '@/hooks/redux';
import { useResponsive } from '@/hooks/useResponsive';
import { authApi } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = getApiBaseUrl();

interface Student {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  student?: {
    group?: {
      name: string;
    };
    department?: string;
  };
}

interface StudentsResponse {
  success: boolean;
  data?: Student[];
  error?: string;
}

export default function StudentsScreen() {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector((state) => state.auth);
  const { horizontalPadding, isSmallScreen, fontSize, spacing, isVerySmallScreen } = useResponsive();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Получаем уникальные группы для фильтрации
  const groups = [...new Set(students.map(s => s.student?.group?.name).filter(Boolean))].sort();

  const searchStudents = async () => {
    if (!searchQuery.trim() && !selectedGroup) {
      setFilteredStudents([]);
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.searchStudents({
        query: searchQuery.trim() || undefined,
        group: selectedGroup || undefined,
        limit: 50
      });

      if (response.success && response.data) {
        const studentsData = response.data.map((student: any) => {
          // Backend возвращает null для avatar - покажем заглушки с инициалами
          const avatarUrl = student.avatar || null;

          // Заменяем @tiue.local на @tiue.uz
          let email = student.email;
          if (email && email.includes('@tiue.local')) {
            email = email.replace('@tiue.local', '@tiue.uz');
          } else if (!email || !email.includes('@tiue.uz')) {
            email = `${student.username}@tiue.uz`;
          }

          return {
            id: student.id || student.username,
            username: student.username,
            email: email,
            first_name: student.first_name || '',
            last_name: student.last_name || '',
            avatar: avatarUrl,
            student: student.student || {
              group: student.group ? { name: student.group } : undefined,
              department: student.department
            }
          };
        });
        
        setStudents(studentsData);
        setFilteredStudents(studentsData);
      } else {
        // Если API не вернул данных
        setStudents([]);
        setFilteredStudents([]);
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось найти студентов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchStudents();
  }, [searchQuery, selectedGroup]);

  const renderStudentCard = (student: Student, index: number) => (
    <TouchableOpacity
      key={student.id}
      activeOpacity={0.7}
      onPress={() => {
        // Переход к профилю студента
        router.push({
          pathname: '/student-profile/[id]',
          params: {
            id: student.id,
            username: student.username,
            email: student.email,
            first_name: student.first_name,
            last_name: student.last_name,
            avatar: student.avatar || '',
            student: JSON.stringify(student.student || {})
          }
        });
      }}
    >
      <Animated.View
        entering={FadeInDown.delay(index * 100).duration(600)}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: spacing.md,
          marginBottom: spacing.sm,
          shadowColor: Platform.OS === 'android' ? 'transparent' : colors.primary,
          shadowOffset: { width: 0, height: Platform.OS === 'android' ? 2 : 4 },
          shadowOpacity: Platform.OS === 'android' ? 0 : 0.1,
          shadowRadius: Platform.OS === 'android' ? 0 : 8,
          elevation: Platform.OS === 'android' ? 2 : 4,
          borderWidth: 1,
          borderColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Аватар */}
        <View style={{
          width: isVerySmallScreen ? 50 : 60,
          height: isVerySmallScreen ? 50 : 60,
          borderRadius: isVerySmallScreen ? 25 : 30,
          marginRight: spacing.md,
          overflow: 'hidden',
          borderWidth: 2,
          borderColor: `${colors.primary}30`,
        }}>
          {student.avatar ? (
            <Image
              source={{ 
                uri: student.avatar,
                cache: 'force-cache' // Кэширование изображений
              }}
              style={{ width: '100%', height: '100%' }}
              defaultSource={require('@/assets/images/icon.png')} // Fallback
              onError={(error) => {
                console.log(`Failed to load avatar for ${student.username}`);
              }}
            />
          ) : (
            <LinearGradient
              colors={['#6366F1', '#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ThemedText style={{
                fontSize: isVerySmallScreen ? 18 : 22,
                fontWeight: '500',
                color: 'white',
              }}>
                {student.first_name[0] || student.username[0] || '?'}
              </ThemedText>
            </LinearGradient>
          )}
        </View>

        {/* Информация о студенте */}
        <View style={{ flex: 1 }}>
          <ThemedText style={{
            fontSize: fontSize.body,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
          }}>
            {student.first_name} {student.last_name}
          </ThemedText>
          
          {student.student?.group && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <LinearGradient
                colors={[`${colors.primary}20`, `${colors.primary}10`]}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <ThemedText style={{
                  fontSize: fontSize.small - 2,
                  color: colors.primary,
                  fontWeight: '500',
                }}>
                  {student.student.group.name}
                </ThemedText>
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Иконка перехода */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: `${colors.primary}15`,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: `${colors.primary}30`,
          }}
        >
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );

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
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : horizontalPadding,
          paddingBottom: Platform.OS === 'android'
            ? (isVerySmallScreen ? 80 : isSmallScreen ? 85 : 90) + Math.max(insets.bottom, 0)
            : (isVerySmallScreen ? 160 : isSmallScreen ? 140 : 120),
        }}
      >
        {/* Заголовок с кнопкой назад */}
        <Animated.View 
          entering={FadeInUp.duration(600).springify()}
          style={{ 
            paddingTop: insets.top + 10,
            marginBottom: spacing.md,
          }}
        >
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: spacing.md,
          }}>
            <TouchableOpacity
              onPress={() => {
                // Проверяем можем ли вернуться назад
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push('/(tabs)/explore');
                }
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.md,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
            </TouchableOpacity>
            
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
              }}
            >
              <Ionicons 
                name="people" 
                size={isVerySmallScreen ? 24 : 28} 
                color={colors.primary} 
              />
            </LinearGradient>
            
            <View style={{ flex: 1 }}>
              <ThemedText style={{
                fontSize: isVerySmallScreen ? fontSize.title + 2 : fontSize.title + 6,
                fontWeight: '800',
                color: colors.text,
                letterSpacing: 0.5,
                marginBottom: 4,
              }}>
                Поиск студентов
              </ThemedText>
              <ThemedText style={{
                fontSize: fontSize.small,
                color: colors.textSecondary,
                lineHeight: 20,
              }}>
                Найдите однокурсников и новых друзей
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Поле поиска */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(800).springify()}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            marginBottom: spacing.md,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: isDarkMode ? 0.2 : 0.1,
            shadowRadius: 16,
            elevation: 8,
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
              placeholder="Поиск по имени или фамилии..."
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

        {/* Фильтры */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(800)}
          style={{ marginBottom: spacing.md }}
        >
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4 }}
          >
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {/* Фильтр "Все" */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedGroup(null);
                }}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: 20,
                  backgroundColor: !selectedGroup 
                    ? colors.primary 
                    : `${colors.primary}15`,
                  borderWidth: 1,
                  borderColor: !selectedGroup 
                    ? colors.primary 
                    : `${colors.primary}30`,
                }}
              >
                <ThemedText style={{
                  fontSize: fontSize.small,
                  color: !selectedGroup 
                    ? '#FFFFFF' 
                    : colors.primary,
                  fontWeight: '500',
                }}>
                  Все
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>

        {/* Результаты поиска */}
        {loading ? (
          <Animated.View 
            entering={FadeInDown.duration(600)}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: spacing.xl,
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <ThemedText style={{
              fontSize: fontSize.body,
              color: colors.textSecondary,
              marginTop: spacing.md,
            }}>
              Поиск студентов...
            </ThemedText>
          </Animated.View>
        ) : filteredStudents.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(600).duration(800)}>
            <ThemedText style={{
              fontSize: fontSize.body,
              color: colors.textSecondary,
              marginBottom: spacing.md,
            }}>
              Найдено студентов: {filteredStudents.length}
            </ThemedText>
            
            {filteredStudents.map((student, index) => renderStudentCard(student, index))}
          </Animated.View>
        ) : searchQuery.trim() || selectedGroup ? (
          <Animated.View 
            entering={FadeInDown.duration(600)}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: spacing.xl,
            }}
          >
            <LinearGradient
              colors={[`${colors.primary}20`, `${colors.primary}10`]}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: spacing.md,
              }}
            >
              <Ionicons name="person-outline" size={40} color={colors.primary} />
            </LinearGradient>
            
            <ThemedText style={{
              fontSize: fontSize.title,
              fontWeight: '600',
              color: colors.text,
              marginBottom: spacing.sm,
              textAlign: 'center',
            }}>
              Студенты не найдены
            </ThemedText>
            
            <ThemedText style={{
              fontSize: fontSize.body,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 24,
            }}>
              Попробуйте изменить параметры поиска{'\n'}или фильтрации
            </ThemedText>
          </Animated.View>
        ) : (
          <Animated.View 
            entering={FadeInDown.duration(600)}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: spacing.xl,
            }}
          >
            <LinearGradient
              colors={[`${colors.primary}20`, `${colors.primary}10`]}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: spacing.md,
              }}
            >
              <Ionicons name="search" size={40} color={colors.primary} />
            </LinearGradient>
            
            <ThemedText style={{
              fontSize: fontSize.title,
              fontWeight: '600',
              color: colors.text,
              marginBottom: spacing.sm,
              textAlign: 'center',
            }}>
              Начните поиск
            </ThemedText>
            
            <ThemedText style={{
              fontSize: fontSize.body,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 24,
            }}>
              Введите имя или фамилию{('\n')}студента для поиска
            </ThemedText>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
