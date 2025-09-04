import { ThemedText } from '@/components/ThemedText';
import { Colors, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logoutUser } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, Switch, View } from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  showArrow?: boolean;
  rightComponent?: React.ReactNode;
}

function SettingsItem({ title, subtitle, icon, onPress, showArrow = true, rightComponent }: SettingsItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.m,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        marginBottom: Spacing.s,
        ...Shadows.card,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: Colors.brandPrimary10,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: Spacing.m,
        }}
      >
        <Ionicons name={icon} size={20} color={Colors.brandPrimary} />
      </View>

      <View style={{ flex: 1 }}>
        <ThemedText
          style={{
            ...Typography.body,
            color: Colors.textPrimary,
            marginBottom: subtitle ? 2 : 0,
          }}
        >
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText
            style={{
              ...Typography.caption,
              color: Colors.textSecondary,
            }}
          >
            {subtitle}
          </ThemedText>
        )}
      </View>

      {rightComponent || (showArrow && (
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      ))}
    </Pressable>
  );
}

// Компонент админ-профиля
function AdminProfile({ user, onLogout }: { user: any, onLogout: () => void }) {
  const displayInfo = {
    name: `${user.first_name} ${user.last_name}`.trim() || user.username,
    subtitle: 'Администратор системы',
    roleColor: '#e11d48'
  };

  const handleAdminAction = (title: string) => {
    Alert.alert(title, 'Функция будет доступна в следующих версиях приложения');
  };

  return (
    <>
      {/* Профиль администратора */}
      <Animated.View 
        entering={SlideInRight.duration(400)}
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 20,
          padding: Spacing.l,
          marginTop: Spacing.l,
          marginBottom: Spacing.l,
          alignItems: 'center',
          ...Shadows.card,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#fef2f2',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: Spacing.m,
            ...Shadows.card,
          }}
        >
          <Ionicons name="shield-checkmark" size={40} color={displayInfo.roleColor} />
        </View>
        
        <ThemedText
          style={{
            ...Typography.displayH1,
            color: Colors.textPrimary,
            marginBottom: Spacing.xxs,
          }}
        >
          {displayInfo.name}
        </ThemedText>
        
        <ThemedText
          style={{
            ...Typography.body,
            color: displayInfo.roleColor,
            marginBottom: Spacing.s,
          }}
        >
          {displayInfo.subtitle}
        </ThemedText>

        <View style={{
          backgroundColor: displayInfo.roleColor + '20',
          paddingHorizontal: Spacing.m,
          paddingVertical: Spacing.xs,
          borderRadius: 20,
        }}>
          <ThemedText style={{
            ...Typography.caption,
            color: displayInfo.roleColor,
            fontWeight: '600',
          }}>
            Полный доступ ко всем функциям
          </ThemedText>
        </View>
      </Animated.View>

      {/* Панель управления */}
      <Animated.View entering={FadeInDown.duration(500).delay(200)}>
        <ThemedText style={{ ...Typography.titleH2, color: Colors.textPrimary, marginBottom: Spacing.m }}>
          Панель управления
        </ThemedText>
        
        <SettingsItem
          title="Управление новостями"
          subtitle="Создание, редактирование и удаление новостей"
          icon="newspaper-outline"
          onPress={() => router.push('../../admin/news' as any)}
        />
        
        <SettingsItem
          title="Управление пользователями"
          subtitle="Создание, редактирование и удаление пользователей"
          icon="people-outline"
          onPress={() => handleAdminAction('Управление пользователями')}
        />
        
        <SettingsItem
          title="Управление группами"
          subtitle="Настройка учебных групп и курсов"
          icon="albums-outline"
          onPress={() => handleAdminAction('Управление группами')}
        />
        
        <SettingsItem
          title="Управление расписанием"
          subtitle="Составление и редактирование расписания"
          icon="calendar-outline"
          onPress={() => handleAdminAction('Управление расписанием')}
        />
        
        <SettingsItem
          title="Управление событиями"
          subtitle="События и мероприятия университета"
          icon="ticket-outline"
          onPress={() => handleAdminAction('Управление событиями')}
        />
      </Animated.View>

      {/* Системные функции */}
      <Animated.View entering={FadeInDown.duration(500).delay(300)} style={{ marginTop: Spacing.l }}>
        <ThemedText style={{ ...Typography.titleH2, color: Colors.textPrimary, marginBottom: Spacing.m }}>
          Система
        </ThemedText>
        
        <SettingsItem
          title="Статистика системы"
          subtitle="Аналитика и отчёты"
          icon="analytics-outline"
          onPress={() => handleAdminAction('Статистика системы')}
        />
        
        <SettingsItem
          title="Настройки системы"
          subtitle="Конфигурация и безопасность"
          icon="settings-outline"
          onPress={() => handleAdminAction('Настройки системы')}
        />
        
        <SettingsItem
          title="Логи и мониторинг"
          subtitle="Просмотр системных логов"
          icon="document-text-outline"
          onPress={() => handleAdminAction('Логи и мониторинг')}
        />

        <SettingsItem
          title="Резервное копирование"
          subtitle="Бэкап и восстановление данных"
          icon="cloud-download-outline"
          onPress={() => handleAdminAction('Резервное копирование')}
        />
      </Animated.View>

      {/* Выход */}
      <Animated.View entering={FadeInDown.duration(500).delay(400)} style={{ marginTop: Spacing.l }}>
        <SettingsItem
          title="Выйти из аккаунта"
          icon="log-out-outline"
          onPress={onLogout}
          showArrow={false}
        />
      </Animated.View>
    </>
  );
}

// Компонент студенческого профиля  
function StudentProfile({ user, onLogout }: { user: any, onLogout: () => void }) {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  
  const displayInfo = {
    name: `${user.first_name} ${user.last_name}`.trim() || user.username,
    subtitle: user.student?.group?.name ? 
      `Группа ${user.student.group.name} • ${user.student.course || 1} курс` : 
      'Студент',
    roleColor: '#2563eb'
  };

  return (
    <>
      {/* Профиль студента */}
      <Animated.View 
        entering={SlideInRight.duration(400)}
        style={{
          backgroundColor: Colors.surface,
          borderRadius: 20,
          padding: Spacing.l,
          marginTop: Spacing.l,
          marginBottom: Spacing.l,
          alignItems: 'center',
          ...Shadows.card,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: Colors.brandPrimary10,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: Spacing.m,
            ...Shadows.card,
          }}
        >
          <Ionicons name="person" size={40} color={Colors.brandPrimary} />
        </View>
        
        <ThemedText
          style={{
            ...Typography.displayH1,
            color: Colors.textPrimary,
            marginBottom: Spacing.xxs,
          }}
        >
          {displayInfo.name}
        </ThemedText>
        
        <ThemedText
          style={{
            ...Typography.body,
            color: Colors.textSecondary,
            marginBottom: Spacing.s,
          }}
        >
          {displayInfo.subtitle}
        </ThemedText>

        {/* Средний балл */}
        <View style={{
          backgroundColor: Colors.brandPrimary10,
          paddingHorizontal: Spacing.m,
          paddingVertical: Spacing.xs,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Ionicons name="school" size={16} color={Colors.brandPrimary} />
          <ThemedText style={{
            ...Typography.caption,
            color: Colors.brandPrimary,
            fontWeight: '600',
            marginLeft: 4,
          }}>
            Средний балл: {user.student?.average_grade || '—'}
          </ThemedText>
        </View>
      </Animated.View>

      {/* Учебная деятельность */}
      <Animated.View entering={FadeInDown.duration(500).delay(200)}>
        <ThemedText style={{ ...Typography.titleH2, color: Colors.textPrimary, marginBottom: Spacing.m }}>
          Учебная деятельность
        </ThemedText>
        
        <SettingsItem
          title="Оценки"
          subtitle="Просмотр текущих оценок по предметам"
          icon="school-outline"
          onPress={() => router.push('/(tabs)')}
        />
        
        <SettingsItem
          title="Расписание занятий"
          subtitle="Расписание лекций и практических занятий"
          icon="calendar-outline"
          onPress={() => router.push('/(tabs)/schedule')}
        />
        
        <SettingsItem
          title="События и новости"
          subtitle="Университетские события и объявления"
          icon="newspaper-outline"
          onPress={() => router.push('/(tabs)/events')}
        />

        <SettingsItem
          title="Домашние задания"
          subtitle="Текущие задания и проекты"
          icon="clipboard-outline"
          onPress={() => Alert.alert('Задания', 'Раздел домашних заданий будет доступен в следующих версиях')}
        />
      </Animated.View>

      {/* Настройки приложения */}
      <Animated.View entering={FadeInDown.duration(500).delay(300)} style={{ marginTop: Spacing.l }}>
        <ThemedText style={{ ...Typography.titleH2, color: Colors.textPrimary, marginBottom: Spacing.m }}>
          Настройки
        </ThemedText>
        
        <SettingsItem
          title="Уведомления"
          subtitle="Настройка push-уведомлений о занятиях и оценках"
          icon="notifications-outline"
          rightComponent={
            <Switch 
              value={notificationsEnabled} 
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.strokeSoft, true: Colors.brandPrimary }}
              thumbColor={notificationsEnabled ? Colors.surface : Colors.textSecondary}
            />
          }
          showArrow={false}
        />
        
        <SettingsItem
          title="Язык приложения"
          subtitle="Русский"
          icon="language-outline"
          onPress={() => Alert.alert('Язык', 'Смена языка будет доступна в следующих версиях')}
        />
        
        <SettingsItem
          title="Поддержка"
          subtitle="Помощь и обратная связь"
          icon="help-circle-outline"
          onPress={() => Alert.alert('Поддержка', 'Свяжитесь с администрацией университета для получения помощи')}
        />
        
        <SettingsItem
          title="О приложении"
          subtitle="Версия 1.0.0"
          icon="information-circle-outline"
          onPress={() => Alert.alert('О приложении', 'TIUE App v1.0.0\nПриложение для студентов университета\n\nРазработано для Технологического института управления и экономики')}
        />
      </Animated.View>

      {/* Выход */}
      <Animated.View entering={FadeInDown.duration(500).delay(400)} style={{ marginTop: Spacing.l }}>
        <SettingsItem
          title="Выйти из аккаунта"
          icon="log-out-outline"
          onPress={onLogout}
          showArrow={false}
        />
      </Animated.View>
    </>
  );
}

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти из системы?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Выйти', 
          style: 'destructive',
          onPress: () => {
            dispatch(logoutUser());
            router.replace('/login');
          }
        }
      ]
    );
  };

  // Если пользователь не авторизован
  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.l }}>
          <Ionicons name="person-outline" size={64} color={Colors.textSecondary} />
          <ThemedText style={{ ...Typography.titleH2, color: Colors.textSecondary, marginTop: Spacing.l, textAlign: 'center' }}>
            Не авторизован
          </ThemedText>
          <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.s, textAlign: 'center' }}>
            Войдите в систему для доступа к профилю
          </ThemedText>
          <Pressable
            onPress={() => router.push('/login')}
            style={{
              backgroundColor: Colors.brandPrimary,
              paddingHorizontal: Spacing.l,
              paddingVertical: Spacing.m,
              borderRadius: 12,
              marginTop: Spacing.l,
            }}
          >
            <ThemedText style={{ ...Typography.body, color: Colors.surface }}>
              Войти в систему
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceSubtle }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.l,
          paddingBottom: 100,
        }}
      >
        {/* Рендерим разные интерфейсы в зависимости от роли */}
        {user.role === 'admin' ? (
          <AdminProfile user={user} onLogout={handleLogout} />
        ) : (
          <StudentProfile user={user} onLogout={handleLogout} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
