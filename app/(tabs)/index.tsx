import { ThemedText } from '@/components/ThemedText';
import { CircularChart } from '@/components/dashboard/CircularChart';
import { CourseProgressCard } from '@/components/dashboard/CourseProgressCard';
import { EventsCard } from '@/components/dashboard/EventsCard';
import { NewsCard } from '@/components/dashboard/NewsCard';
import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSelector } from '@/hooks/redux';
import { authApi } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface DashboardData {
  news: Array<{ id: number; title: string; description: string; image: string | null; date: string }>;
  events: Array<{ id: number; title: string; date: string; image: string | null }>;
  courses: Array<{ id: number; name: string; progress: number }>;
  gpa: number;
  attendance: number;
}

export default function HomeScreen() {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const { user } = useAppSelector(state => state.auth);
  
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    news: [],
    events: [],
    courses: [],
    gpa: 0,
    attendance: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Используем ref для предотвращения дублированных запросов
  const loadingRef = React.useRef(false);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadDashboardData = React.useCallback(async () => {
    if (loadingRef.current) {
      return; // Предотвращаем дублированные запросы
    }

    try {
      loadingRef.current = true;
      if (isMountedRef.current) {
        setLoading(true);
      }
      
      const response = await authApi.getDashboard();
      
      if (isMountedRef.current && response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Error loading dashboard data:', error);
      }
    } finally {
      loadingRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Стабилизируем user ID для предотвращения лишних перерендеров
  const userId = React.useMemo(() => user?.id, [user?.id]);

  useEffect(() => {
    if (userId && dashboardData.news.length === 0) { // Загружаем только если данные еще не загружены
      loadDashboardData();
    }
  }, [userId, loadDashboardData, dashboardData.news.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleNewsPress = (newsId: number) => {
    router.push(`/news/${newsId}`);
  };

  const handleEventPress = (eventId: number) => {
    router.push(`/events/${eventId}`);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    background: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: 'transparent',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFFFFF' : '#1E3A8A',
      letterSpacing: 1,
    },
    profileButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDarkMode ? '#2563EB' : '#3B82F6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContainer: {
      paddingBottom: 20,
    },
    chartsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    chartContainer: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDarkMode 
          ? ['#1E3A8A', '#2563EB', '#3B82F6']
          : ['#EFF6FF', '#DBEAFE', '#BFDBFE']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>UNIVERSITY</ThemedText>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons 
              name="person" 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={isDarkMode ? '#FFFFFF' : '#1E3A8A'}
            />
          }
          contentContainerStyle={styles.scrollContainer}
        >
          {/* News Section */}
          <NewsCard 
            news={dashboardData.news} 
            onNewsPress={handleNewsPress}
          />

          {/* Events Section */}
          <EventsCard 
            events={dashboardData.events}
            onEventPress={handleEventPress}
          />

          {/* Courses Section */}
          <CourseProgressCard courses={dashboardData.courses} />

          {/* Charts Row */}
          <View style={styles.chartsRow}>
            <View style={styles.chartContainer}>
              <CircularChart
                value={dashboardData.gpa}
                maxValue={5}
                title="Средний балл (GPA)"
                color="#10B981"
                suffix=""
              />
            </View>
            <View style={styles.chartContainer}>
              <CircularChart
                value={dashboardData.attendance}
                maxValue={100}
                title="Посещаемость"
                color="#F59E0B"
                suffix="%"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}