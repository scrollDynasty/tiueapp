import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Colors, Gradients } from '@/constants/Colors';
import { useAppSelector } from '@/hooks/redux';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Event, Grade, Task } from '@/types';
import { selectEventsItems, selectGradesItems, selectStudent, selectTasksItems } from '@/types/redux';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MENU_ITEMS = [
  { icon: 'school-outline', title: 'Оценки и успеваемость', subtitle: 'Просмотр всех оценок' },
  { icon: 'calendar-outline', title: 'Расписание занятий', subtitle: 'Управление расписанием' },
  { icon: 'star-outline', title: 'Достижения', subtitle: 'Мои награды и сертификаты' },
  { icon: 'map-outline', title: 'Карта кампуса', subtitle: 'Навигация по университету' },
  { icon: 'notifications-outline', title: 'Уведомления', subtitle: 'Настройки push-уведомлений' },
  { icon: 'lock-closed-outline', title: 'Приватность', subtitle: 'Настройки конфиденциальности' },
  { icon: 'help-circle-outline', title: 'Справка', subtitle: 'Часто задаваемые вопросы' },
  { icon: 'settings-outline', title: 'Настройки', subtitle: 'Общие настройки приложения' },
];

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const studentState = useAppSelector(selectStudent);
  const student = studentState.profile;
  const tasks = useAppSelector(selectTasksItems);
  const grades = useAppSelector(selectGradesItems);
  const events = useAppSelector(selectEventsItems);

  const completedTasks = tasks?.filter((task: Task) => task.completed).length || 0;
  const registeredEvents = events?.filter((event: Event) => event.isRegistered).length || 0;
  const averageGrade = grades?.length ? 
    (grades.reduce((sum: number, grade: Grade) => sum + (grade.grade / grade.maxGrade) * 5, 0) / grades.length).toFixed(1) 
    : '0.0';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {student?.name?.split(' ').map((n: string) => n[0]).join('') || 'АИ'}
            </Text>
          </View>
          
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>
              {student?.name || 'Анна Иванова'}
            </ThemedText>
            <ThemedText style={[styles.profileDetails, { color: colors.textSecondary }]}>
              {student?.studentId || 'ST2021001'} • {student?.group || 'ИТ-301'}
            </ThemedText>
            <ThemedText style={[styles.profileFaculty, { color: colors.textSecondary }]}>
              {student?.faculty || 'Факультет информационных технологий'}
            </ThemedText>
            <ThemedText style={[styles.profileCourse, { color: colors.primary }]}>
              {student?.course || 3} курс
            </ThemedText>
          </View>
          
          <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="create-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <ThemedText style={styles.sectionTitle}>Статистика</ThemedText>
          <View style={styles.statsGrid}>
            <StatCard
              title="Средний балл"
              value={averageGrade}
              icon="school-outline"
              gradient={Gradients.primary}
            />
            <StatCard
              title="Выполнено задач"
              value={completedTasks}
              icon="checkmark-circle-outline"
              gradient={Gradients.success}
            />
            <StatCard
              title="Зарегистрирован в событиях"
              value={registeredEvents}
              icon="star-outline"
              gradient={Gradients.accent}
            />
            <StatCard
              title="Курс обучения"
              value={`${student?.course || 3} курс`}
              icon="trophy-outline"
              gradient={Gradients.warning}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Быстрые действия</ThemedText>
          <View style={styles.quickActions}>
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.primary }]}>
              <Ionicons name="download-outline" size={24} color="#fff" />
              <ThemedText style={styles.quickActionText}>Экспорт расписания</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.secondary }]}>
              <Ionicons name="share-outline" size={24} color="#fff" />
              <ThemedText style={styles.quickActionText}>Поделиться профилем</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Настройки и функции</ThemedText>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity key={index}>
              <Card style={styles.menuCard}>
                <View style={styles.menuItem}>
                  <View style={[styles.menuIcon, { backgroundColor: `${colors.primary}15` }]}>
                    <Ionicons 
                      name={item.icon as keyof typeof Ionicons.glyphMap} 
                      size={24} 
                      color={colors.primary} 
                    />
                  </View>
                  <View style={styles.menuContent}>
                    <ThemedText style={[styles.menuTitle, { color: colors.text }]}>
                      {item.title}
                    </ThemedText>
                    <ThemedText style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
                      {item.subtitle}
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Academic Info */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Академическая информация</ThemedText>
          <Card>
            <View style={styles.academicInfo}>
              <View style={styles.infoRow}>
                <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Email:
                </ThemedText>
                <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                  {student?.email || 'anna.ivanova@student.university.ru'}
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Студенческий билет:
                </ThemedText>
                <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                  {student?.studentId || 'ST2021001'}
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Группа:
                </ThemedText>
                <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                  {student?.group || 'ИТ-301'}
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Факультет:
                </ThemedText>
                <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                  {student?.faculty || 'Факультет информационных технологий'}
                </ThemedText>
              </View>
            </View>
          </Card>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <ThemedText style={styles.logoutText}>Выйти из аккаунта</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 16,
    marginBottom: 2,
  },
  profileFaculty: {
    fontSize: 14,
    marginBottom: 4,
  },
  profileCourse: {
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  menuCard: {
    marginBottom: 8,
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
  },
  academicInfo: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});
