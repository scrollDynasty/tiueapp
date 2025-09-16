import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ThemedText } from '../ThemedText';

interface Course {
  id: number;
  name: string;
  progress: number;
  instructor?: string;
  nextClass?: string;
}

interface CourseProgressCardProps {
  courses: Course[];
  onCoursePress?: (courseId: number) => void;
}

export const CourseProgressCard: React.FC<CourseProgressCardProps> = ({ 
  courses, 
  onCoursePress 
}) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  const getProgressColor = (progress: number) => {
    if (progress >= 0.8) return '#10B981'; // Green
    if (progress >= 0.6) return '#F59E0B'; // Yellow
    if (progress >= 0.4) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  const styles = StyleSheet.create({
    container: {
      margin: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#8B5CF6',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    viewAllButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: '#8B5CF6' + '15',
    },
    viewAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#8B5CF6',
    },
    coursesContainer: {
      gap: 12,
    },
    courseCard: {
      borderRadius: 16,
      backgroundColor: colors.surface,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#8B5CF6' + '10',
    },
    courseContent: {
      padding: 16,
    },
    courseHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    courseTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginRight: 8,
    },
    progressPercentage: {
      fontSize: 14,
      fontWeight: '700',
      minWidth: 40,
      textAlign: 'right',
    },
    instructor: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    progressContainer: {
      marginBottom: 8,
    },
    progressBackground: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
    nextClass: {
      fontSize: 12,
      color: '#8B5CF6',
      fontWeight: '500',
    },
    emptyState: {
      padding: 40,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#8B5CF6' + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  if (!courses || courses.length === 0) {
    return (
      <Animated.View entering={FadeInDown.delay(600)} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="book" size={20} color="#FFFFFF" />
          </View>
          <ThemedText style={styles.headerTitle}>📚 Курсы</ThemedText>
        </View>
        
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="book-outline" size={28} color="#8B5CF6" />
          </View>
          <ThemedText style={styles.emptyTitle}>Курсов пока нет</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Здесь будет отображаться прогресс по вашим курсам
          </ThemedText>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.delay(600)} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="book" size={20} color="#FFFFFF" />
        </View>
        <ThemedText style={styles.headerTitle}>📚 Курсы</ThemedText>
        <TouchableOpacity style={styles.viewAllButton}>
          <ThemedText style={styles.viewAllText}>Все</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.coursesContainer}>
        {courses.slice(0, 4).map((course, index) => {
          const progressColor = getProgressColor(course.progress);
          const progressPercentage = Math.round(course.progress * 100);
          
          return (
            <Animated.View 
              key={course.id} 
              entering={FadeInDown.delay(700 + index * 100)}
            >
              <TouchableOpacity
                style={styles.courseCard}
                onPress={() => onCoursePress?.(course.id)}
                activeOpacity={0.7}
              >
                <View style={styles.courseContent}>
                  <View style={styles.courseHeader}>
                    <ThemedText style={styles.courseTitle} numberOfLines={1}>
                      {course.name}
                    </ThemedText>
                    <ThemedText style={[styles.progressPercentage, { color: progressColor }]}>
                      {progressPercentage}%
                    </ThemedText>
                  </View>

                  {course.instructor && (
                    <ThemedText style={styles.instructor} numberOfLines={1}>
                      👨‍🏫 {course.instructor}
                    </ThemedText>
                  )}

                  <View style={styles.progressContainer}>
                    <View style={styles.progressBackground}>
                      <Animated.View
                        style={[
                          styles.progressFill,
                          {
                            width: `${progressPercentage}%`,
                            backgroundColor: progressColor,
                          },
                        ]}
                        entering={FadeInDown.delay(800 + index * 100)}
                      />
                    </View>
                  </View>

                  {course.nextClass && (
                    <ThemedText style={styles.nextClass}>
                      📅 Следующая лекция: {course.nextClass}
                    </ThemedText>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
};
