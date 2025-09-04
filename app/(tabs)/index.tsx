import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { UniversityAction } from '@/components/ui/UniversityAction';
import { UniversityCard } from '@/components/ui/UniversityCard';
import { Colors, Gradients } from '@/constants/Colors';
import { useAppSelector } from '@/hooks/redux';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Schedule, Task } from '@/types';
import { selectEvents, selectSchedule, selectStudent, selectTasks } from '@/types/redux';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const studentState = useAppSelector(selectStudent);
  const tasksState = useAppSelector(selectTasks);
  const scheduleState = useAppSelector(selectSchedule);
  const eventsState = useAppSelector(selectEvents);

  const student = studentState.profile;
  const tasks = tasksState.items;
  const schedule = scheduleState.items;
  const events = eventsState.items;

  const pendingTasks = tasks.filter((task: Task) => !task.completed);
  const todaySchedule = schedule.filter((item: Schedule) => item.day === 'Понедельник'); // For demo
  const upcomingEvents = events.slice(0, 3);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with gradient */}
      <LinearGradient
        colors={Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greetingText}>
              {getGreeting()}, {student?.name?.split(' ')[0] || 'Студент'}! 👋
            </Text>
            <Text style={styles.subGreetingText}>Сегодня отличный день для учёбы</Text>
          </View>
          
          <TouchableOpacity style={styles.profileButton}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {student?.name ? student.name.split(' ').map(n => n[0]).join('') : 'СТ'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Обзор</Text>
          
          <View style={styles.statsGrid}>
            <UniversityCard
              title="Средний балл"
              value={student?.gpa?.toFixed(1) || '0.0'}
              subtitle="GPA"
              icon="school"
              gradient="royal"
              size="medium"
              style={styles.statCard}
            />
            
            <UniversityCard
              title="Активные задачи"
              value={pendingTasks.length}
              subtitle="осталось"
              icon="checkmark-circle"
              gradient="emerald"
              size="medium"
              style={styles.statCard}
            />
          </View>

          <View style={styles.statsGrid}>
            <UniversityCard
              title="Пары сегодня"
              value={todaySchedule.length}
              subtitle="занятий"
              icon="calendar"
              gradient="vibrant"
              size="medium"
              style={styles.statCard}
            />
            
            <UniversityCard
              title="События"
              value={upcomingEvents.length}
              subtitle="предстоящих"
              icon="star"
              gradient="purple"
              size="medium"
              style={styles.statCard}
            />
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Расписание на сегодня</Text>
            <TouchableOpacity>
              <Text style={[styles.sectionAction, { color: colors.primary }]}>Смотреть все</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.scheduleList}>
            {todaySchedule.length > 0 ? (
              todaySchedule.slice(0, 3).map((item, index) => (
                <View key={index} style={[styles.scheduleItem, { backgroundColor: colors.surface }]}>
                  <View style={styles.scheduleTime}>
                    <Text style={[styles.timeText, { color: colors.primary }]}>{item.time}</Text>
                  </View>
                  <View style={styles.scheduleContent}>
                    <Text style={[styles.subjectText, { color: colors.text }]}>{item.subject}</Text>
                    <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                      {item.room}, {item.building} • {item.teacher}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyStateText, { color: colors.text }]}>Пар на сегодня нет</Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                  Отличный день для самостоятельной работы
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Urgent Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Срочные задачи</Text>
            <TouchableOpacity>
              <Text style={[styles.sectionAction, { color: colors.primary }]}>Все задачи</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tasksList}>
            {pendingTasks.length > 0 ? (
              pendingTasks.slice(0, 3).map((task, index) => (
                <View key={index} style={[styles.taskItem, { backgroundColor: colors.surface }]}>
                  <View style={[
                    styles.taskPriority,
                    {
                      backgroundColor: 
                        task.priority === 'high' ? colors.error : 
                        task.priority === 'medium' ? colors.warning : colors.success
                    }
                  ]} />
                  <View style={styles.taskContent}>
                    <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
                    <Text style={[styles.taskSubtitle, { color: colors.textSecondary }]}>
                      {task.subject} • До {new Date(task.dueDate).toLocaleDateString('ru')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
                <Ionicons name="trophy-outline" size={48} color={colors.success} />
                <Text style={[styles.emptyStateText, { color: colors.text }]}>Все задачи выполнены!</Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                  Отличная работа! 🎉
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Быстрые действия</Text>
          
          <View style={styles.actionsGrid}>
            <UniversityAction
              title="Расписание"
              icon="calendar-outline"
              gradient="ocean"
            />
            
            <UniversityAction
              title="Задания"
              icon="document-text-outline"
              gradient="emerald"
              badge={pendingTasks.length}
            />
            
            <UniversityAction
              title="Оценки"
              icon="school-outline"
              gradient="purple"
            />
            
            <UniversityAction
              title="Библиотека"
              icon="library-outline"
              gradient="sunset"
            />
          </View>

          <View style={styles.actionsGrid}>
            <UniversityAction
              title="Кампус"
              icon="map-outline"
              gradient="royal"
            />
            
            <UniversityAction
              title="Новости"
              icon="newspaper-outline"
              gradient="vibrant"
            />
            
            <UniversityAction
              title="Профиль"
              icon="person-outline"
              gradient="pink"
            />
            
            <UniversityAction
              title="Помощь"
              icon="help-circle-outline"
              gradient="accent"
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Недавняя активность</Text>
          
          <View style={styles.activityList}>
            <View style={[styles.activityItem, { backgroundColor: colors.surface }]}>
              <LinearGradient
                colors={Gradients.primary}
                style={styles.activityIcon}
              >
                <Ionicons name="checkmark" size={16} color="white" />
              </LinearGradient>
              
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>
                  Сдано задание по математике
                </Text>
                <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                  2 часа назад
                </Text>
              </View>
            </View>

            <View style={[styles.activityItem, { backgroundColor: colors.surface }]}>
              <LinearGradient
                colors={Gradients.accent}
                style={styles.activityIcon}
              >
                <Ionicons name="calendar" size={16} color="white" />
              </LinearGradient>
              
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>
                  Новое расписание на следующую неделю
                </Text>
                <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                  Вчера
                </Text>
              </View>
            </View>

            <View style={[styles.activityItem, { backgroundColor: colors.surface }]}>
              <LinearGradient
                colors={Gradients.secondary}
                style={styles.activityIcon}
              >
                <Ionicons name="star" size={16} color="white" />
              </LinearGradient>
              
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>
                  Получена оценка &ldquo;отлично&rdquo; по физике
                </Text>
                <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                  3 дня назад
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subGreetingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  profileButton: {
    padding: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
  },
  scheduleList: {
    gap: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleTime: {
    marginRight: 16,
    alignItems: 'center',
    minWidth: 60,
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  scheduleContent: {
    flex: 1,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
  },
  tasksList: {
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskPriority: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskSubtitle: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
  },
});