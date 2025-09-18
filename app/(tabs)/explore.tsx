import { ThemedText } from '@/components/ThemedText';
import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSelector } from '@/hooks/redux';
import { useResponsive } from '@/hooks/useResponsive';
import { authApi } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Course {
  course_id: string;
  course_name: string;
  final_grade?: number;
  status: 'current' | 'past' | 'future';
  instructor?: string;
  course_url?: string;
}

export default function CoursesScreen() {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const insets = useSafeAreaInsets();
  const { horizontalPadding, isSmallScreen, fontSize, spacing, isVerySmallScreen } = useResponsive();
  const { user } = useAppSelector((state) => state.auth);
  
  const [coursesData, setCoursesData] = React.useState<Course[]>([]);
  const [gradesData, setGradesData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Загружаем данные курсов и оценок
  React.useEffect(() => {
    const fetchData = async () => {
      if (user?.role !== 'student') return;
      
      try {
        setLoading(true);
        const [coursesResponse, gradesResponse] = await Promise.all([
          authApi.getCourses(),
          authApi.getGrades()
        ]);

        if (coursesResponse.success && coursesResponse.data) {
          const responseData = coursesResponse.data as any || {};
          const coursesArray = Array.isArray(responseData.data) ? responseData.data : [];
          
          // Применяем ту же фильтрацию что и на главном экране
          let filteredCourses = coursesArray;
          if (coursesArray.length === 10) {
            filteredCourses = coursesArray.slice(0, 9);
          }
          
          setCoursesData(filteredCourses);
        }

        if (gradesResponse.success && gradesResponse.data) {
          const responseData = gradesResponse.data as any || {};
          const gradesArray = Array.isArray(responseData.data) ? responseData.data : [];
          setGradesData(gradesArray);
        }
      } catch (error) {
        console.error('Error fetching courses data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Функция для получения оценки за курс
  const getCourseGrade = (courseId: string) => {
    const grade = gradesData.find(g => g.course_id === courseId);
    return grade ? parseFloat(grade.final_grade || grade.grade || grade.score || 0) : null;
  };

  // Функция для определения статуса прохождения курса
  const getCourseStatus = (courseId: string) => {
    const grade = getCourseGrade(courseId);
    if (grade === null) return 'not_graded';
    if (grade < 40) return 'failed';
    if (grade >= 40 && grade < 60) return 'passed';
    if (grade >= 60 && grade < 80) return 'good';
    return 'excellent';
  };

  // Функция для получения цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#10B981';
      case 'good': return '#3B82F6';
      case 'passed': return '#F59E0B';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // Функция для получения текста статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return 'Отлично';
      case 'good': return 'Хорошо';
      case 'passed': return 'Сдано';
      case 'failed': return 'Не сдано';
      default: return 'Не оценено';
    }
  };

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
              ? (isVerySmallScreen ? 80 : isSmallScreen ? 85 : 90) + Math.max(insets.bottom, 0)
              : (isVerySmallScreen ? 160 : isSmallScreen ? 140 : 120),
          }}
        >
          {/* Заголовок курсов */}
          <Animated.View 
            entering={FadeInUp.duration(600).springify()}
            style={{ 
              paddingTop: insets.top + 10,
              marginBottom: spacing.lg,
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
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Ionicons 
                  name="book" 
                  size={isVerySmallScreen ? 24 : 28} 
                  color={colors.primary} 
                />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <ThemedText
                  style={{
                    fontSize: isVerySmallScreen ? fontSize.title + 2 : fontSize.title + 6,
                    lineHeight: isVerySmallScreen ? 24 : 32,
                    fontWeight: '800',
                    color: colors.text,
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  Мои курсы
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: fontSize.small,
                    color: colors.textSecondary,
                    lineHeight: 20,
                  }}
                >
                  {coursesData.length} предметов • Академический прогресс
                </ThemedText>
              </View>
              
              {/* Кнопка перехода к оценкам */}
              <TouchableOpacity
                onPress={() => router.push('/grades')}
                style={{
                  backgroundColor: colors.primary + '20',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="analytics-outline" size={16} color={colors.primary} />
                <ThemedText style={{
                  fontSize: 12,
                  color: colors.primary,
                  marginLeft: 6,
                  fontWeight: '600',
                }}>
                  Оценки
                </ThemedText>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Список курсов */}
          {loading ? (
            <Animated.View 
              entering={FadeInDown.delay(200).duration(600)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: spacing.xl,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons name="book-outline" size={48} color={colors.textSecondary} />
              <ThemedText style={{
                fontSize: 16,
                color: colors.text,
                marginTop: 16,
                fontWeight: '600',
              }}>
                Загружаем курсы...
              </ThemedText>
            </Animated.View>
          ) : coursesData.length > 0 ? (
            coursesData.map((course, index) => {
              const grade = getCourseGrade(course.course_id);
              const status = getCourseStatus(course.course_id);
              const statusColor = getStatusColor(status);
              const statusText = getStatusText(status);

              return (
                <Animated.View
                  key={course.course_id}
                  entering={FadeInDown.delay(200 + index * 100).duration(600)}
                  style={{ marginBottom: spacing.md }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      if (course.course_url) {
                        // Можно открыть URL курса
                        console.log('Opening course:', course.course_url);
                      }
                    }}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 20,
                      padding: spacing.lg,
                      borderWidth: 1,
                      borderColor: colors.border,
                      shadowColor: statusColor,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 12,
                      elevation: 6,
                    }}
                  >
                    {/* Заголовок курса */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md }}>
                      <View style={{ flex: 1, marginRight: spacing.md }}>
                        <ThemedText style={{
                          fontSize: isVerySmallScreen ? 16 : 18,
                          fontWeight: '700',
                          color: colors.text,
                          marginBottom: 4,
                        }}>
                          {course.course_name}
                        </ThemedText>
                        {course.instructor && (
                          <ThemedText style={{
                            fontSize: 14,
                            color: colors.textSecondary,
                          }}>
                            {course.instructor}
                          </ThemedText>
                        )}
                      </View>
                      
                      {/* Статус курса */}
                      <View style={{
                        backgroundColor: statusColor,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 12,
                      }}>
                        <ThemedText style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: 'white',
                        }}>
                          {statusText}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Оценка и прогресс */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="trophy-outline" size={20} color={colors.primary} />
                        <ThemedText style={{
                          fontSize: 16,
                          color: colors.text,
                          marginLeft: 8,
                          fontWeight: '600',
                        }}>
                          Оценка:
                        </ThemedText>
                      </View>
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ThemedText style={{
                          fontSize: 18,
                          fontWeight: '700',
                          color: grade !== null ? statusColor : colors.textSecondary,
                          marginRight: 8,
                        }}>
                          {grade !== null ? Math.round(grade) : 'Нет'}
                        </ThemedText>
                        <ThemedText style={{
                          fontSize: 14,
                          color: colors.textSecondary,
                        }}>
                          / 100
                        </ThemedText>
                      </View>
                    </View>

                    {/* Прогресс бар */}
                    {grade !== null && (
                      <View style={{ marginTop: spacing.md }}>
                        <View style={{
                          height: 8,
                          backgroundColor: colors.border,
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}>
                          <View style={{
                            height: '100%',
                            width: `${Math.min(grade, 100)}%`,
                            backgroundColor: statusColor,
                            borderRadius: 4,
                          }} />
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })
          ) : (
            <Animated.View 
              entering={FadeInDown.delay(200).duration(600)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: spacing.xl,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons name="book-outline" size={48} color={colors.textSecondary} />
              <ThemedText style={{
                fontSize: 16,
                color: colors.text,
                marginTop: 16,
                fontWeight: '600',
              }}>
                Нет курсов
              </ThemedText>
              <ThemedText style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: 8,
              }}>
                Курсы появятся после их назначения
              </ThemedText>
            </Animated.View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
