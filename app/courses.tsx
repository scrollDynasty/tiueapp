import { ThemedText } from '@/components/ThemedText';
import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSelector } from '@/hooks/redux';
import { useResponsive } from '@/hooks/useResponsive';
import { authApi } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Course {
  course_id: string;
  course_name: string;
  final_grade?: number;
  status: 'current' | 'past' | 'future';
  instructor?: string;
  credits?: number;
  semester?: string;
}

export default function CoursesScreen() {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [grades, setGrades] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const insets = useSafeAreaInsets();
  const { horizontalPadding, isSmallScreen, fontSize, spacing, isVerySmallScreen } = useResponsive();
  const { user } = useAppSelector((state) => state.auth);

  const fetchGrades = React.useCallback(async () => {
    try {
      const response = await authApi.getGrades();
      
      if (response.success && response.data) {
        const responseData = response.data as any || {};
        const gradesArray = Array.isArray(responseData.data) ? responseData.data : [];
        setGrades(gradesArray);
      } else {
        setGrades([]);
      }
    } catch (error) {
      setGrades([]);
    }
  }, []);

  const fetchCourses = React.useCallback(async () => {
    try {
      const response = await authApi.getCourses();
      
      if (response.success && response.data) {
        const responseData = response.data as any || {};
        const coursesArray = Array.isArray(responseData.data) ? responseData.data : [];
        setCourses(coursesArray);
      } else {
        setCourses([]);
      }
    } catch (error) {
      setCourses([]);
    }
  }, []);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchCourses(), fetchGrades()]);
    setLoading(false);
  }, [fetchCourses, fetchGrades]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const getStatusColor = (grade?: number) => {
    if (!grade) return '#6B7280'; // Серый для неизвестной оценки
    if (grade >= 40) return '#10B981'; // Зеленый для сдавших
    return '#EF4444'; // Красный для не сдавших
  };

  const getStatusText = (grade?: number) => {
    if (!grade) return 'Нет оценки';
    if (grade >= 40) return 'Сдал';
    return 'Не сдал';
  };

  const getGradeColor = (grade?: number) => {
    if (!grade) return colors.textSecondary;
    if (grade >= 90) return '#10B981';
    if (grade >= 80) return '#F59E0B';
    if (grade >= 70) return '#EF4444';
    return colors.textSecondary;
  };

  // Функция для получения оценки курса из массива оценок
  const getCourseGrade = React.useCallback((courseName: string): number | undefined => {
    const grade = grades.find((g: any) => 
      g.course_name === courseName || 
      g.name === courseName ||
      g.subject === courseName
    );
    return grade ? parseFloat(grade.final_grade || grade.grade || grade.score || 0) : undefined;
  }, [grades]);

  const calculateProgress = (course: Course) => {
    const grade = getCourseGrade(course.course_name);
    if (grade) {
      // Прогресс = балл (максимум 100%)
      return Math.min(grade, 100);
    }
    return 0; // Если нет оценки, прогресс = 0
  };

  const renderCourseCard = (course: Course, index: number) => {
    const courseGrade = getCourseGrade(course.course_name);
    
    return (
    <Animated.View
      key={course.course_id}
      entering={FadeInDown.duration(500).delay(index * 100)}
      style={{
        backgroundColor: colors.surface,
        borderRadius: isVerySmallScreen ? 16 : 20,
        padding: isVerySmallScreen ? spacing.sm : spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          android: {
            elevation: 4,
          },
        }),
      }}
    >
      {/* Заголовок курса */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: spacing.sm 
      }}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <ThemedText 
            numberOfLines={2}
            style={{
              fontSize: isVerySmallScreen ? 16 : 18,
              fontWeight: '600',
              color: colors.text,
              lineHeight: isVerySmallScreen ? 20 : 24,
            }}
          >
            {course.course_name}
          </ThemedText>
          {course.instructor && (
            <ThemedText 
              numberOfLines={1}
              style={{
                fontSize: isVerySmallScreen ? 12 : 14,
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              {course.instructor}
            </ThemedText>
          )}
        </View>
        
        {/* Статус сдачи */}
        <View style={{
          backgroundColor: getStatusColor(courseGrade) + '20',
          paddingHorizontal: isVerySmallScreen ? 8 : 12,
          paddingVertical: isVerySmallScreen ? 4 : 6,
          borderRadius: 12,
        }}>
          <ThemedText style={{
            fontSize: isVerySmallScreen ? 10 : 12,
            fontWeight: '600',
            color: getStatusColor(courseGrade),
          }}>
            {getStatusText(courseGrade)}
          </ThemedText>
        </View>
      </View>

      {/* Информация о курсе */}
      <View style={{ 
        flexDirection: isVerySmallScreen ? 'column' : 'row', 
        justifyContent: 'space-between', 
        alignItems: isVerySmallScreen ? 'flex-start' : 'center',
        marginBottom: spacing.sm 
      }}>
        {/* Кредиты/семестр */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          marginBottom: isVerySmallScreen ? 8 : 0
        }}>
          <Ionicons 
            name="school-outline" 
            size={isVerySmallScreen ? 14 : 16} 
            color={colors.primary} 
          />
          <ThemedText style={{
            fontSize: isVerySmallScreen ? 12 : 14,
            color: colors.textSecondary,
            marginLeft: 6,
          }}>
            {course.credits ? `${course.credits} кредитов` : 'Курс'}
            {course.semester && ` • ${course.semester}`}
          </ThemedText>
        </View>

        {/* Оценка */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons 
            name="trophy-outline" 
            size={isVerySmallScreen ? 14 : 16} 
            color={getGradeColor(courseGrade)} 
          />
          <ThemedText style={{
            fontSize: isVerySmallScreen ? 14 : 16,
            fontWeight: '700',
            color: getGradeColor(courseGrade),
            marginLeft: 6,
          }}>
            {courseGrade ? courseGrade.toFixed(1) : 'Нет оценки'}
          </ThemedText>
        </View>
      </View>

      {/* Прогресс бар */}
      <View style={{
        backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
        height: isVerySmallScreen ? 6 : 8,
        borderRadius: isVerySmallScreen ? 3 : 4,
        overflow: 'hidden',
      }}>
        <View style={{
          height: '100%',
          width: `${calculateProgress(course)}%`,
          backgroundColor: getStatusColor(courseGrade),
        }} />
      </View>

      {/* Прогресс текст */}
      <ThemedText style={{
        fontSize: isVerySmallScreen ? 10 : 12,
        color: colors.textSecondary,
        textAlign: 'right',
        marginTop: 4,
      }}>
        {calculateProgress(course).toFixed(0)}% завершено
      </ThemedText>
    </Animated.View>
    );
  };

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.background,
      paddingTop: insets.top 
    }}>
      {/* Заголовок с кнопкой назад */}
      <Animated.View 
        entering={FadeInUp.duration(500)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: horizontalPadding,
          paddingVertical: spacing.md,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: spacing.md,
            }}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>
          
          <View style={{ flex: 1 }}>
            <ThemedText style={{
              fontSize: isVerySmallScreen ? 20 : 24,
              fontWeight: '600',
              color: colors.text,
            }}>
              Мои курсы
            </ThemedText>
            <ThemedText style={{
              fontSize: isVerySmallScreen ? 12 : 14,
              color: colors.textSecondary,
              marginTop: 2,
            }}>
              {courses.length} {courses.length === 1 ? 'курс' : courses.length < 5 ? 'курса' : 'курсов'}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* Список курсов */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          // Загрузка
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            paddingVertical: spacing.xl * 2
          }}>
            <Animated.View
              entering={FadeInDown.duration(500)}
              style={{
                padding: spacing.lg,
                backgroundColor: colors.surface,
                borderRadius: 20,
                alignItems: 'center',
              }}
            >
              <Ionicons 
                name="school-outline" 
                size={48} 
                color={colors.primary} 
                style={{ marginBottom: spacing.md }}
              />
              <ThemedText style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8,
              }}>
                Загружаем курсы...
              </ThemedText>
              <ThemedText style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
              }}>
                Получаем актуальную информацию о ваших курсах
              </ThemedText>
            </Animated.View>
          </View>
        ) : courses.length === 0 ? (
          // Пустое состояние
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            paddingVertical: spacing.xl * 2
          }}>
            <Animated.View
              entering={FadeInDown.duration(500)}
              style={{
                padding: spacing.lg,
                backgroundColor: colors.surface,
                borderRadius: 20,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons 
                name="school-outline" 
                size={64} 
                color={colors.textSecondary} 
                style={{ marginBottom: spacing.md }}
              />
              <ThemedText style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8,
                textAlign: 'center',
              }}>
                Курсы не найдены
              </ThemedText>
              <ThemedText style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: 20,
              }}>
                В данный момент у вас нет активных курсов.{'\n'}
                Обратитесь в деканат для получения информации.
              </ThemedText>
              
              <TouchableOpacity
                onPress={onRefresh}
                style={{
                  marginTop: spacing.lg,
                  backgroundColor: colors.primary,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  borderRadius: 12,
                }}
              >
                <ThemedText style={{
                  color: 'white',
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  Обновить
                </ThemedText>
              </TouchableOpacity>
            </Animated.View>
          </View>
        ) : (
          // Список курсов
          <>
            {/* Статистика */}
            <Animated.View
              entering={FadeInDown.duration(500)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: isVerySmallScreen ? 16 : 20,
                padding: isVerySmallScreen ? spacing.sm : spacing.md,
                marginBottom: spacing.lg,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-around',
                alignItems: 'center'
              }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <ThemedText style={{
                    fontSize: isVerySmallScreen ? 20 : 24,
                    fontWeight: '600',
                    color: '#10B981',
                  }}>
                    {courses.filter(c => {
                      const grade = getCourseGrade(c.course_name);
                      return grade && grade >= 40;
                    }).length}
                  </ThemedText>
                  <ThemedText style={{
                    fontSize: isVerySmallScreen ? 11 : 12,
                    color: colors.textSecondary,
                    textAlign: 'center',
                  }}>
                    Сдано
                  </ThemedText>
                </View>
                
                <View style={{ 
                  width: 1, 
                  height: 40, 
                  backgroundColor: colors.border 
                }} />
                
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <ThemedText style={{
                    fontSize: isVerySmallScreen ? 20 : 24,
                    fontWeight: '600',
                    color: '#EF4444',
                  }}>
                    {courses.filter(c => {
                      const grade = getCourseGrade(c.course_name);
                      return grade && grade < 40;
                    }).length}
                  </ThemedText>
                  <ThemedText style={{
                    fontSize: isVerySmallScreen ? 11 : 12,
                    color: colors.textSecondary,
                    textAlign: 'center',
                  }}>
                    Не сдано
                  </ThemedText>
                </View>
                
                <View style={{ 
                  width: 1, 
                  height: 40, 
                  backgroundColor: colors.border 
                }} />
                
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <ThemedText style={{
                    fontSize: isVerySmallScreen ? 20 : 24,
                    fontWeight: '600',
                    color: '#F59E0B',
                  }}>
                    {courses.reduce((sum, c) => sum + (c.credits || 3), 0)}
                  </ThemedText>
                  <ThemedText style={{
                    fontSize: isVerySmallScreen ? 11 : 12,
                    color: colors.textSecondary,
                    textAlign: 'center',
                  }}>
                    Кредитов
                  </ThemedText>
                </View>
              </View>
            </Animated.View>

            {/* Курсы */}
            {courses.map((course, index) => renderCourseCard(course, index))}
          </>
        )}
      </ScrollView>
    </View>
  );
}