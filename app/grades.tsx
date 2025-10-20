// import { AnimatedHeader } from '@/components/AnimatedHeader';
import { CustomRefreshControl } from '@/components/CustomRefreshControl';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { ThemedText } from '@/components/ThemedText';
import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { authApi } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedScrollHandler,
  useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const { width: screenWidth } = Dimensions.get('window');

interface Grade {
  id: string;
  subject: string;
  grade: number;
  maxGrade: number;
  date: string;
  type: string;
  teacher?: string;
  assignment_name?: string;
}

interface Course {
  course_id: string;
  course_name: string;
  status: 'current' | 'past' | 'future';
}

export default function GradesScreen() {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  // Убираем фильтрацию по предметам
  const insets = useSafeAreaInsets();
  const { 
    horizontalPadding, 
    cardGap, 
    isVerySmallScreen, 
    isSmallScreen,
    fontSize, 
    spacing 
  } = useResponsive();

  // Расчет среднего балла (GPA)
  const calculateGPA = useCallback((gradesData: Grade[]) => {
    if (gradesData.length === 0) return 0;
    
    // Считаем средний балл как среднее арифметическое всех оценок
    const total = gradesData.reduce((sum, grade) => {
      return sum + parseFloat(grade.grade?.toString() || '0');
    }, 0);
    
    return Math.round((total / gradesData.length) * 100) / 100; // Округляем до 2 знаков
  }, []);

  // Используем все оценки без фильтрации
  const gpa = calculateGPA(grades);

  // Получение данных
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [gradesResponse, coursesResponse] = await Promise.all([
        authApi.getGrades(),
        authApi.getCourses()
      ]);

      if (gradesResponse.success) {
        // API возвращает объект с полем data, которое содержит массив
        const responseData = gradesResponse.data as any || {};
        const gradesArray = Array.isArray(responseData.data) ? responseData.data : [];
        
        // Преобразуем данные LDAP в нужный формат
        const formattedGrades = gradesArray.map((item: any, index: number) => ({
          id: item.course_id || item.id || index.toString(),
          subject: item.course_name || item.subject || 'Неизвестный предмет',
          grade: parseFloat(item.final_grade || item.grade || item.score || 0),
          maxGrade: 100, // Обычно максимальный балл 100
          date: item.date || item.created_at || new Date().toISOString(),
          type: 'final',
          teacher: item.teacher || item.instructor || '',
          assignment_name: 'Итоговая оценка'
        }));
        
        setGrades(formattedGrades);
      }

      if (coursesResponse.success) {
        // API возвращает объект с полем data, которое содержит массив
        const coursesResponseData = coursesResponse.data as any || {};
        const coursesArray = Array.isArray(coursesResponseData.data) ? coursesResponseData.data : [];
        setCourses(coursesArray);
      }
    } catch (error) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.error('🎓 [Grades Screen] Error fetching grades data:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Убираем фильтрацию по предметам

  const renderGradeCard = useCallback((grade: Grade, index: number) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(600)}
      style={[
        styles.gradeCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          marginBottom: cardGap,
        }
      ]}
    >
      <View style={styles.gradeHeader}>
        <View style={styles.gradeInfo}>
          <ThemedText style={[styles.subjectName, { color: colors.text }]}>
            {grade.subject}
          </ThemedText>
          <ThemedText style={[styles.assignmentName, { color: colors.textSecondary }]}>
            {grade.assignment_name || grade.type}
          </ThemedText>
        </View>
        <View style={styles.gradeScore}>
          <LinearGradient
            colors={[
              grade.grade >= grade.maxGrade * 0.8 ? '#10B981' : 
              grade.grade >= grade.maxGrade * 0.6 ? '#F59E0B' : '#EF4444',
              grade.grade >= grade.maxGrade * 0.8 ? '#059669' : 
              grade.grade >= grade.maxGrade * 0.6 ? '#D97706' : '#DC2626'
            ]}
            style={styles.scoreContainer}
          >
            <ThemedText style={styles.scoreText}>
              {grade.grade}/{grade.maxGrade}
            </ThemedText>
          </LinearGradient>
        </View>
      </View>
      
      <View style={styles.gradeDetails}>
        <View style={styles.gradeDetailItem}>
          <Ionicons 
            name="calendar-outline" 
            size={16} 
            color={colors.textSecondary} 
          />
          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
            {grade.date ? (() => {
              try {
                return new Date(grade.date).toLocaleDateString('ru-RU');
              } catch {
                return grade.date;
              }
            })() : 'Дата не указана'}
          </ThemedText>
        </View>
        
        {grade.teacher && (
          <View style={styles.gradeDetailItem}>
            <Ionicons 
              name="person-outline" 
              size={16} 
              color={colors.textSecondary} 
            />
            <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
              {grade.teacher}
            </ThemedText>
          </View>
        )}
        
        <View style={styles.gradeDetailItem}>
          <View style={[
            styles.percentageBadge,
            { 
              backgroundColor: grade.grade >= grade.maxGrade * 0.8 ? '#10B981' : 
                             grade.grade >= grade.maxGrade * 0.6 ? '#F59E0B' : '#EF4444'
            }
          ]}>
            <ThemedText style={styles.percentageText}>
              {Math.round((grade.grade / grade.maxGrade) * 100)}%
            </ThemedText>
          </View>
        </View>
      </View>
    </Animated.View>
  ), [colors, cardGap]);

  // Убираем фильтрацию по предметам

  const renderGPACard = useCallback(() => (
    <Animated.View
      entering={FadeInDown.delay(100).duration(600)}
      style={[
        styles.gpaCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          marginBottom: spacing.lg,
        }
      ]}
    >
      <LinearGradient
        colors={[colors.primary + '20', colors.primary + '10']}
        style={styles.gpaGradient}
      >
        <View style={styles.gpaContent}>
          <View style={styles.gpaInfo}>
            <ThemedText style={[styles.gpaLabel, { color: colors.textSecondary }]}>
              Общий средний балл
            </ThemedText>
            <ThemedText style={[styles.gpaValue, { color: colors.primary }]}>
              {gpa.toFixed(2)}
            </ThemedText>
          </View>
          
          <View style={[styles.gpaCircle, { borderColor: colors.primary }]}>
            <LinearGradient
              colors={[colors.primary, colors.primary + '80']}
              style={styles.gpaCircleInner}
            >
              <Ionicons name="school" size={32} color="#FFFFFF" />
            </LinearGradient>
          </View>
        </View>
        
        <View style={styles.gpaStats}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: colors.text }]}>
              {grades.length}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Оценок
            </ThemedText>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: colors.text }]}>
              {Array.from(new Set(grades.map(grade => grade.subject))).length}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Предметов
            </ThemedText>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: colors.text }]}>
              {grades.filter(g => g.grade >= 85).length}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Отличных
            </ThemedText>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  ), [colors, spacing, grades, gpa]);

  const renderHeader = useCallback(() => (
    <View style={[
      styles.header,
      {
        backgroundColor: colors.background,
        paddingTop: insets.top + 20,
        paddingHorizontal: horizontalPadding,
        paddingBottom: 20,
      }
    ]}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
            Оценки
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {`${grades.length} оценок • Средний балл: ${calculateGPA(grades).toFixed(2)}`}
          </ThemedText>
        </View>
      </View>
    </View>
  ), [colors, insets, horizontalPadding, grades, gpa, calculateGPA]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <LoadingAnimation size={60} color={colors.primary} />
        <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
          Загружаем оценки...
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      
      <AnimatedScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingHorizontal: horizontalPadding,
            paddingTop: spacing.xl + insets.top,
            paddingBottom: spacing.xl + insets.bottom,
          }
        ]}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <CustomRefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderGPACard()}
        
        {grades.length > 0 ? (
          <View style={styles.gradesContainer}>
            {grades.map((grade, index) => (
              <React.Fragment key={grade.id || index}>
                {renderGradeCard(grade, index)}
              </React.Fragment>
            ))}
          </View>
        ) : (
          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            style={styles.emptyContainer}
          >
            <Ionicons name="school-outline" size={64} color={colors.textSecondary} />
            <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
              Нет оценок
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Оценки появятся после их выставления преподавателями
            </ThemedText>
          </Animated.View>
        )}
      </AnimatedScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  gpaCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gpaGradient: {
    padding: 20,
  },
  gpaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gpaInfo: {
    flex: 1,
  },
  gpaLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  gpaValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  gpaCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    padding: 2,
  },
  gpaCircleInner: {
    flex: 1,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpaStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    opacity: 0.3,
  },
  // Убираем стили фильтрации
  gradesContainer: {
    flex: 1,
  },
  gradeCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  gradeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gradeInfo: {
    flex: 1,
    marginRight: 12,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  assignmentName: {
    fontSize: 14,
  },
  gradeScore: {
    alignItems: 'flex-end',
  },
  scoreContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  gradeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  gradeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
