import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Colors, Gradients } from '@/constants/Colors';
import { useAppSelector } from '@/hooks/redux';
import { useColorScheme } from '@/hooks/useColorScheme';
import { dashboardStyles } from '@/styles/screens/dashboard';
import { Event, Schedule, Task } from '@/types';
import { selectEvents, selectSchedule, selectStudent, selectTasks } from '@/types/redux';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = dashboardStyles;
  
  const studentState = useAppSelector(selectStudent);
  const tasksState = useAppSelector(selectTasks);
  const scheduleState = useAppSelector(selectSchedule);
  const eventsState = useAppSelector(selectEvents);

  const student = studentState.profile;
  const tasks = tasksState.items;
  const schedule = scheduleState.items;
  const events = eventsState.items;

  const pendingTasks = tasks.filter((task: Task) => !task.completed);
  const todaySchedule = schedule.filter((item: Schedule) => item.day === 'Понедельник'); // В реальном приложении будет текущий день
  const upcomingEvents = events.filter((event: Event) => new Date(event.date) > new Date());

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.greeting}>
              {getGreeting()}, {student?.name?.split(' ')[0]}! 👋
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
              Сегодня отличный день для учёбы
            </ThemedText>
          </View>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {student?.name?.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              title="Средний балл"
              value={student?.gpa?.toFixed(1) || '0.0'}
              icon="school-outline"
              gradient={Gradients.primary}
            />
            <StatCard
              title="Активные задачи"
              value={pendingTasks.length}
              icon="checkmark-circle-outline"
              gradient={Gradients.accent}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Сегодня пар"
              value={todaySchedule.length}
              icon="calendar-outline"
              color={colors.success}
            />
            <StatCard
              title="События"
              value={upcomingEvents.length}
              icon="star-outline"
              color={colors.warning}
            />
          </View>
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Расписание на сегодня</ThemedText>
          {todaySchedule.length > 0 ? (
            todaySchedule.slice(0, 3).map((item) => (
              <Card key={item.id} style={styles.scheduleCard}>
                <View style={styles.scheduleHeader}>
                  <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                  <View style={styles.scheduleInfo}>
                    <ThemedText style={styles.scheduleSubject}>{item.subject}</ThemedText>
                    <ThemedText style={[styles.scheduleDetails, { color: colors.textSecondary }]}>
                      {item.time} • {item.room}, {item.building}
                    </ThemedText>
                    <ThemedText style={[styles.scheduleTeacher, { color: colors.textSecondary }]}>
                      {item.teacher}
                    </ThemedText>
                  </View>
                  <View style={[styles.typeBadge, { backgroundColor: colors.backgroundSecondary }]}>
                    <ThemedText style={[styles.typeBadgeText, { color: colors.primary }]}>
                      {item.type === 'lecture' ? 'Лекция' : 
                       item.type === 'practice' ? 'Практика' : 
                       item.type === 'lab' ? 'Лаб' : 'Семинар'}
                    </ThemedText>
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <Card>
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Пар на сегодня нет
                </ThemedText>
              </View>
            </Card>
          )}
        </View>

        {/* Urgent Tasks */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Срочные задачи</ThemedText>
          {pendingTasks.length > 0 ? (
            pendingTasks.slice(0, 3).map((task) => (
              <Card key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <View style={styles.taskInfo}>
                    <ThemedText style={styles.taskTitle}>{task.title}</ThemedText>
                    <ThemedText style={[styles.taskSubject, { color: colors.textSecondary }]}>
                      {task.subject}
                    </ThemedText>
                    <ThemedText style={[styles.taskDue, { color: 
                      task.priority === 'high' ? colors.error : 
                      task.priority === 'medium' ? colors.warning : colors.success
                    }]}>
                      До {new Date(task.dueDate).toLocaleDateString('ru')}
                    </ThemedText>
                  </View>
                  <View style={[styles.priorityIndicator, { 
                    backgroundColor: 
                      task.priority === 'high' ? colors.error : 
                      task.priority === 'medium' ? colors.warning : colors.success
                  }]} />
                </View>
              </Card>
            ))
          ) : (
            <Card>
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color={colors.success} />
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Все задачи выполнены! 🎉
                </ThemedText>
              </View>
            </Card>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Быстрые действия</ThemedText>
          <View style={styles.actionsGrid}>
            <Card style={styles.actionCard}>
              <View style={styles.actionContent}>
                <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
                <ThemedText style={styles.actionText}>Добавить задачу</ThemedText>
              </View>
            </Card>
            <Card style={styles.actionCard}>
              <View style={styles.actionContent}>
                <Ionicons name="calendar-outline" size={32} color={colors.secondary} />
                <ThemedText style={styles.actionText}>Расписание</ThemedText>
              </View>
            </Card>
            <Card style={styles.actionCard}>
              <View style={styles.actionContent}>
                <Ionicons name="star-outline" size={32} color={colors.accent} />
                <ThemedText style={styles.actionText}>События</ThemedText>
              </View>
            </Card>
            <Card style={styles.actionCard}>
              <View style={styles.actionContent}>
                <Ionicons name="school-outline" size={32} color={colors.success} />
                <ThemedText style={styles.actionText}>Оценки</ThemedText>
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
