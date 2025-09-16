import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, ProgressBar } from 'react-native-paper';
import { ThemedText } from '../ThemedText';

interface Course {
  id: number;
  name: string;
  progress: number;
}

interface CourseProgressCardProps {
  courses: Course[];
}

export const CourseProgressCard: React.FC<CourseProgressCardProps> = ({ courses }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  const styles = StyleSheet.create({
    card: {
      margin: 8,
      backgroundColor: isDarkMode ? '#1E3A8A' : '#FFFFFF',
      borderRadius: 12,
      elevation: 3,
    },
    cardContent: {
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFFFFF' : '#1E3A8A',
      marginBottom: 12,
    },
    courseItem: {
      marginBottom: 16,
    },
    courseName: {
      fontSize: 14,
      fontWeight: '500',
      color: isDarkMode ? '#E2E8F0' : '#475569',
      marginBottom: 8,
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    progressBar: {
      flex: 1,
      height: 6,
      borderRadius: 3,
    },
    progressText: {
      fontSize: 12,
      fontWeight: '600',
      color: isDarkMode ? '#60A5FA' : '#2563EB',
      minWidth: 35,
    },
  });

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <ThemedText style={styles.title}>Предметы</ThemedText>
        {courses.map((course) => (
          <View key={course.id} style={styles.courseItem}>
            <ThemedText style={styles.courseName}>{course.name}</ThemedText>
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={course.progress}
                color={isDarkMode ? '#60A5FA' : '#2563EB'}
                style={styles.progressBar}
              />
              <ThemedText style={styles.progressText}>
                {Math.round(course.progress * 100)}%
              </ThemedText>
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );
};
