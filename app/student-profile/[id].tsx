import { ThemedText } from '@/components/ThemedText';
import { getApiBaseUrl } from '@/config/environment';
import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Linking,
    Platform,
    ScrollView,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = getApiBaseUrl();

interface StudentProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar?: string;
  student?: {
    group?: {
      name: string;
    };
    department?: string;
    status?: string;
    student_id?: number | string;
  };
}

// Кэш для профилей (оптимизация памяти)
const profileCache = new Map<string, { data: StudentProfile; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

export default function StudentProfileScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const insets = useSafeAreaInsets();
  const { horizontalPadding, isSmallScreen, fontSize, spacing, isVerySmallScreen } = useResponsive();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    if (!id) {
      setError('ID студента не указан');
      setLoading(false);
      return;
    }

    // Проверяем кэш
    const cached = profileCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setProfile(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Получаем данные из navigation params
      const studentData = params as any;
      
      if (studentData && (studentData.student || studentData.username)) {
        // Парсим student данные если они в виде строки
        let studentInfo = studentData.student;
        if (typeof studentInfo === 'string') {
          try {
            studentInfo = JSON.parse(studentInfo);
          } catch (e) {
            console.error('Failed to parse student data:', e);
            studentInfo = undefined;
          }
        }

        // Backend возвращает полный URL аватарки - используем как есть
        const avatarUrl = studentData.avatar || null;

        const profileData: StudentProfile = {
          id: studentData.id || studentData.username || id,
          username: studentData.username || id,
          email: studentData.email || `${studentData.username || id}@tiue.uz`,
          first_name: studentData.first_name || '',
          last_name: studentData.last_name || '',
          full_name: studentData.full_name || `${studentData.first_name || ''} ${studentData.last_name || ''}`.trim() || studentData.username || id,
          avatar: avatarUrl,
          student: studentInfo
        };

        setProfile(profileData);
        
        // Сохраняем в кэш
        profileCache.set(id, { data: profileData, timestamp: Date.now() });
      } else {
        setError('Данные студента не найдены');
      }
    } catch (err) {
      setError('Не удалось загрузить профиль');
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Мемоизация для оптимизации
  const initials = useMemo(() => {
    if (!profile) return '?';
    return (profile.first_name[0] || profile.username[0] || '?').toUpperCase();
  }, [profile?.first_name, profile?.username]);

  const handleEmailPress = () => {
    if (profile?.email) {
      Linking.openURL(`mailto:${profile.email}`);
    }
  };

  const handleBack = () => {
    // Проверяем можем ли вернуться назад
    if (router.canGoBack()) {
      router.back();
    } else {
      // Если нет истории (например, после перезагрузки страницы) - переходим на список студентов
      router.push('/(tabs)/students');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <LinearGradient
          colors={isDarkMode 
            ? ['#0F172A', '#1E293B', '#334155']
            : ['#FAFAFA', '#F8FAFC', '#EEF2F7']
          }
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={{ marginTop: spacing.md, color: colors.textSecondary }}>
            Загрузка профиля...
          </ThemedText>
        </View>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <LinearGradient
          colors={isDarkMode 
            ? ['#0F172A', '#1E293B', '#334155']
            : ['#FAFAFA', '#F8FAFC', '#EEF2F7']
          }
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: horizontalPadding }}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <ThemedText style={{ marginTop: spacing.md, fontSize: fontSize.title, fontWeight: '600', textAlign: 'center' }}>
            {error || 'Профиль не найден'}
          </ThemedText>
          <TouchableOpacity
            onPress={handleBack}
            style={{
              marginTop: spacing.lg,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              backgroundColor: colors.primary,
              borderRadius: 12,
            }}
          >
            <ThemedText style={{ color: '#FFFFFF', fontWeight: '600' }}>
              Вернуться назад
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
          paddingBottom: insets.bottom + spacing.xl,
        }}
      >
        {/* Хедер с кнопкой назад */}
        <Animated.View 
          entering={FadeInUp.duration(400)}
          style={{
            paddingTop: insets.top + spacing.sm,
            paddingHorizontal: horizontalPadding,
            marginBottom: spacing.md,
          }}
        >
          <TouchableOpacity
            onPress={handleBack}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Аватар и имя */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(600)}
          style={{
            alignItems: 'center',
            paddingHorizontal: horizontalPadding,
            marginBottom: spacing.xl,
          }}
        >
          {/* Большой аватар */}
          <View style={{
            width: isVerySmallScreen ? 100 : 120,
            height: isVerySmallScreen ? 100 : 120,
            borderRadius: isVerySmallScreen ? 50 : 60,
            overflow: 'hidden',
            marginBottom: spacing.md,
            borderWidth: 4,
            borderColor: colors.primary,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}>
            {profile.avatar ? (
              <Image
                source={{ 
                  uri: profile.avatar,
                  cache: 'force-cache' // Кэширование изображений
                }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                onError={(error) => {
                  console.log(`Failed to load profile avatar for ${profile.username}`);
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
                  fontSize: isVerySmallScreen ? 36 : 42,
                  fontWeight: '700',
                  color: 'white',
                }}>
                  {initials}
                </ThemedText>
              </LinearGradient>
            )}
          </View>

          {/* Имя */}
          <ThemedText style={{
            fontSize: fontSize.title + 4,
            fontWeight: '800',
            color: colors.text,
            marginBottom: spacing.xs,
            textAlign: 'center',
          }}>
            {profile.first_name} {profile.last_name}
          </ThemedText>

          {/* Username */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: `${colors.primary}15`,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: `${colors.primary}30`,
          }}>
            <Ionicons name="person" size={16} color={colors.primary} />
            <ThemedText style={{
              fontSize: fontSize.body,
              color: colors.primary,
              fontWeight: '600',
              marginLeft: spacing.xs,
            }}>
              @{profile.username}
            </ThemedText>
          </View>
        </Animated.View>

        {/* Информационные карточки */}
        <View style={{ paddingHorizontal: horizontalPadding, gap: spacing.md }}>
          
          {/* Группа */}
          {profile.student?.group && (
            <Animated.View 
              entering={FadeInDown.delay(400).duration(600)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: spacing.lg,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
                borderWidth: 1,
                borderColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                <LinearGradient
                  colors={[`${colors.primary}30`, `${colors.primary}15`]}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: spacing.md,
                  }}
                >
                  <Ionicons name="people" size={20} color={colors.primary} />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{
                    fontSize: fontSize.small,
                    color: colors.textSecondary,
                    marginBottom: 2,
                  }}>
                    Группа
                  </ThemedText>
                  <ThemedText style={{
                    fontSize: fontSize.body + 2,
                    fontWeight: '700',
                    color: colors.text,
                  }}>
                    {profile.student.group.name}
                  </ThemedText>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Email */}
          {profile.email && (
            <Animated.View 
              entering={FadeInDown.delay(500).duration(600)}
            >
              <TouchableOpacity
                onPress={handleEmailPress}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: spacing.lg,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <LinearGradient
                    colors={[`${colors.primary}30`, `${colors.primary}15`]}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: spacing.md,
                    }}
                  >
                    <Ionicons name="mail" size={20} color={colors.primary} />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{
                      fontSize: fontSize.small,
                      color: colors.textSecondary,
                      marginBottom: 2,
                    }}>
                      Email
                    </ThemedText>
                    <ThemedText style={{
                      fontSize: fontSize.body,
                      fontWeight: '600',
                      color: colors.primary,
                    }}>
                      {profile.email}
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Department */}
          {profile.student?.department && (
            <Animated.View 
              entering={FadeInDown.delay(600).duration(600)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: spacing.lg,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
                borderWidth: 1,
                borderColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <LinearGradient
                  colors={[`${colors.primary}30`, `${colors.primary}15`]}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: spacing.md,
                  }}
                >
                  <Ionicons name="school" size={20} color={colors.primary} />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{
                    fontSize: fontSize.small,
                    color: colors.textSecondary,
                    marginBottom: 2,
                  }}>
                    Направление
                  </ThemedText>
                  <ThemedText style={{
                    fontSize: fontSize.body,
                    fontWeight: '600',
                    color: colors.text,
                  }}>
                    {profile.student.department}
                  </ThemedText>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Student ID */}
          {profile.student?.student_id && (
            <Animated.View 
              entering={FadeInDown.delay(700).duration(600)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: spacing.lg,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
                borderWidth: 1,
                borderColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <LinearGradient
                  colors={[`${colors.primary}30`, `${colors.primary}15`]}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: spacing.md,
                  }}
                >
                  <Ionicons name="card" size={20} color={colors.primary} />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{
                    fontSize: fontSize.small,
                    color: colors.textSecondary,
                    marginBottom: 2,
                  }}>
                    ID студента
                  </ThemedText>
                  <ThemedText style={{
                    fontSize: fontSize.body + 2,
                    fontWeight: '700',
                    color: colors.text,
                    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                  }}>
                    #{profile.student.student_id}
                  </ThemedText>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Status */}
          {profile.student?.status && (
            <Animated.View 
              entering={FadeInDown.delay(800).duration(600)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: spacing.lg,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
                borderWidth: 1,
                borderColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: spacing.md,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{
                    fontSize: fontSize.small,
                    color: colors.textSecondary,
                    marginBottom: 2,
                  }}>
                    Статус
                  </ThemedText>
                  <ThemedText style={{
                    fontSize: fontSize.body,
                    fontWeight: '600',
                    color: '#10B981',
                  }}>
                    {profile.student.status}
                  </ThemedText>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Username как отдельная карточка */}
          <Animated.View 
            entering={FadeInDown.delay(900).duration(600)}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: spacing.lg,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
              borderWidth: 1,
              borderColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <LinearGradient
                colors={[`${colors.primary}30`, `${colors.primary}15`]}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md,
                }}
              >
                <Ionicons name="at" size={20} color={colors.primary} />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <ThemedText style={{
                  fontSize: fontSize.small,
                  color: colors.textSecondary,
                  marginBottom: 2,
                }}>
                  Логин (Username)
                </ThemedText>
                <ThemedText style={{
                  fontSize: fontSize.body + 2,
                  fontWeight: '700',
                  color: colors.text,
                  fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                }}>
                  {profile.username}
                </ThemedText>
              </View>
            </View>
          </Animated.View>



          {/* Информация о TIUE */}
          <Animated.View 
            entering={FadeInDown.delay(1100).duration(600)}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: spacing.lg,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
              borderWidth: 1,
              borderColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
              marginTop: spacing.md,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <LinearGradient
                colors={[colors.primary, `${colors.primary}CC`]}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.md,
                }}
              >
                <Ionicons name="school-outline" size={28} color="#FFFFFF" />
              </LinearGradient>
              <ThemedText style={{
                fontSize: fontSize.body,
                fontWeight: '600',
                color: colors.text,
                textAlign: 'center',
                marginBottom: spacing.xs,
              }}>
                Tashkent International University of Education
              </ThemedText>
              <ThemedText style={{
                fontSize: fontSize.small,
                color: colors.textSecondary,
                textAlign: 'center',
              }}>
                tiue.uz
              </ThemedText>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}
