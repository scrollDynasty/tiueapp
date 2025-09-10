import { ThemedText } from '@/components/ThemedText';
import { getThemeColors } from '@/constants/Colors';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { clearCredentials, logoutUser } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Modal, Pressable, ScrollView, Switch, View } from 'react-native';
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
  const { isDarkMode } = useTheme();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };
  
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        backgroundColor: pressed 
          ? isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
          : isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
        borderRadius: 12,
        padding: Spacing.m,
        marginBottom: Spacing.s,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      })}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: isDarkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: Spacing.m,
        }}
      >
        <Ionicons 
          name={icon} 
          size={20} 
          color={isDarkMode ? '#8B5CF6' : '#6366F1'} 
        />
      </View>

      <View style={{ flex: 1 }}>
        <ThemedText
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: isDarkMode ? '#F1F5F9' : '#000000', // Черный текст в светлой теме
            marginBottom: subtitle ? 2 : 0,
          }}
        >
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText
            style={{
              fontSize: 13,
              color: isDarkMode ? '#94A3B8' : '#4A5568', // Темно-серый текст для subtitle
            }}
          >
            {subtitle}
          </ThemedText>
        )}
      </View>

      {rightComponent || (showArrow && (
        <Ionicons 
          name="chevron-forward" 
          size={18} 
          color={isDarkMode ? '#64748B' : '#94A3B8'} 
        />
      ))}
    </Pressable>
  );
}

// Компонент админ-профиля - современная панель управления
function AdminProfile({ user, onLogout }: { user: any, onLogout: () => void }) {
  // Получаем данные из Redux для статистики
  const { items: newsItems } = useAppSelector((state) => state.news);
  const { items: eventsItems } = useAppSelector((state) => state.events);
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  
  const displayInfo = {
    name: `${user.first_name} ${user.last_name}`.trim() || user.username,
    subtitle: 'Системный администратор',
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Современный заголовок админ панели с градиентом */}
      <Animated.View entering={SlideInRight.duration(400)} style={{ marginTop: -Spacing.l, marginHorizontal: -Spacing.l, marginBottom: Spacing.l }}>
        <LinearGradient
          colors={[colors.primary, '#5B8DF7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: Spacing.l,
            paddingVertical: Spacing.xl,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            ...Shadows.card,
          }}
        >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.m }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'rgba(255,255,255,0.15)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: Spacing.m,
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Ionicons name="settings" size={28} color="white" />
          </View>
          
          <View style={{ flex: 1 }}>
            <ThemedText
              style={{
                ...Typography.displayH1,
                color: 'white',
                marginBottom: 4,
                fontSize: 22,
              }}
            >
              {displayInfo.name}
            </ThemedText>
            <ThemedText
              style={{
                ...Typography.body,
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              {displayInfo.subtitle}
            </ThemedText>
          </View>

          <View style={{
            backgroundColor: isDarkMode ? `${colors.primary}25` : colors.surface,
            paddingHorizontal: Spacing.m,
            paddingVertical: Spacing.xs,
            borderRadius: 16,
          }}>
            <ThemedText style={{
              ...Typography.caption,
              color: colors.primary,
              fontWeight: '700',
              fontSize: 11,
            }}>
              ADMIN
            </ThemedText>
          </View>
        </View>

        {/* Статистика в заголовке */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          paddingHorizontal: Spacing.m,
          paddingVertical: Spacing.m,
          borderRadius: 16,
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={{
              ...Typography.displayH1,
              color: 'white',
              fontSize: 20,
              fontWeight: '700',
            }}>
              {newsItems.length}
            </ThemedText>
            <ThemedText style={{
              ...Typography.caption,
              color: 'rgba(255,255,255,0.8)',
            }}>
              Новостей
            </ThemedText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={{
              ...Typography.displayH1,
              color: 'white',
              fontSize: 20,
              fontWeight: '700',
            }}>
              {eventsItems.length}
            </ThemedText>
            <ThemedText style={{
              ...Typography.caption,
              color: 'rgba(255,255,255,0.8)',
            }}>
              Событий
            </ThemedText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={{
              ...Typography.displayH1,
              color: 'white',
              fontSize: 20,
              fontWeight: '700',
            }}>
              1
            </ThemedText>
            <ThemedText style={{
              ...Typography.caption,
              color: 'rgba(255,255,255,0.8)',
            }}>
              Админов
            </ThemedText>
          </View>
        </View>
        </LinearGradient>
      </Animated.View>

      {/* Современные карточки управления */}
      <Animated.View entering={FadeInDown.duration(500).delay(200)}>
        <ThemedText style={{ 
          ...Typography.titleH2, 
          color: colors.text, 
          marginBottom: Spacing.m,
          fontSize: 18,
        }}>
          Управление контентом
        </ThemedText>
        
        <View style={{
          gap: Spacing.m,
          marginBottom: Spacing.l,
        }}>
          {/* Карточка управления новостями */}
          <Pressable
            onPress={() => router.push('../../admin/news' as any)}
            style={{
              backgroundColor: colors.surface,
              borderRadius: Radius.card,
              padding: Spacing.l,
              flexDirection: 'row',
              alignItems: 'center',
              ...Shadows.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: isDarkMode ? `${colors.primary}25` : `${colors.primary}15`,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: Spacing.m,
            }}>
              <Ionicons name="newspaper-outline" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ 
                ...Typography.titleH2, 
                color: colors.text, 
                marginBottom: 4,
              }}>
                Управление новостями
              </ThemedText>
              <ThemedText style={{ 
                ...Typography.body, 
                color: colors.textSecondary,
                fontSize: 14,
              }}>
                {newsItems.length} активных новостей
              </ThemedText>
            </View>
            <View style={{
              backgroundColor: colors.surfaceSecondary,
              paddingHorizontal: Spacing.s,
              paddingVertical: Spacing.xs,
              borderRadius: Radius.icon,
              marginRight: Spacing.s,
            }}>
              <ThemedText style={{
                ...Typography.caption,
                color: colors.textSecondary,
                fontWeight: '600',
              }}>
                {newsItems.length}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>

          {/* Карточка управления событиями */}
          <Pressable
            onPress={() => router.push('../../admin/events' as any)}
            style={{
              backgroundColor: colors.surface,
              borderRadius: Radius.card,
              padding: Spacing.l,
              flexDirection: 'row',
              alignItems: 'center',
              ...Shadows.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: isDarkMode ? `${colors.warning}25` : `${colors.warning}15`,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: Spacing.m,
            }}>
              <Ionicons name="calendar-outline" size={24} color={colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ 
                ...Typography.titleH2, 
                color: colors.text, 
                marginBottom: 4,
              }}>
                Управление событиями
              </ThemedText>
              <ThemedText style={{ 
                ...Typography.body, 
                color: colors.textSecondary,
                fontSize: 14,
              }}>
                {eventsItems.length} запланированных событий
              </ThemedText>
            </View>
            <View style={{
              backgroundColor: '#FEF3C7',
              paddingHorizontal: Spacing.s,
              paddingVertical: Spacing.xs,
              borderRadius: Radius.icon,
              marginRight: Spacing.s,
            }}>
              <ThemedText style={{
                ...Typography.caption,
                color: '#F59E0B',
                fontWeight: '600',
              }}>
                {eventsItems.length}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </Pressable>

          {/* Карточка управления расписанием */}
          <Pressable
            onPress={() => Alert.alert('Расписание', 'Управление расписанием будет доступно в следующих версиях')}
            style={{
              backgroundColor: colors.surface,
              borderRadius: Radius.card,
              padding: Spacing.l,
              flexDirection: 'row',
              alignItems: 'center',
              ...Shadows.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: isDarkMode ? `${colors.success}25` : `${colors.success}15`,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: Spacing.m,
            }}>
              <Ionicons name="time-outline" size={24} color={colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ 
                ...Typography.titleH2, 
                color: colors.text, 
                marginBottom: 4,
              }}>
                Управление расписанием
              </ThemedText>
              <ThemedText style={{ 
                ...Typography.body, 
                color: colors.textSecondary,
                fontSize: 14,
              }}>
                Составление и редактирование
              </ThemedText>
            </View>
            <View style={{
              backgroundColor: isDarkMode ? `${colors.success}25` : `${colors.success}15`,
              paddingHorizontal: Spacing.s,
              paddingVertical: Spacing.xs,
              borderRadius: Radius.icon,
              marginRight: Spacing.s,
            }}>
              <ThemedText style={{
                ...Typography.caption,
                color: '#10B981',
                fontWeight: '600',
              }}>
                ∞
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </Animated.View>

      {/* Системная информация и настройки */}
      <Animated.View entering={FadeInDown.duration(500).delay(300)}>
        <ThemedText style={{ 
          ...Typography.titleH2, 
          color: colors.text, 
          marginBottom: Spacing.m,
          fontSize: 18,
        }}>
          Системная информация
        </ThemedText>
        
        <View style={{ gap: Spacing.s, marginBottom: Spacing.l }}>
          <Pressable
            style={{
              backgroundColor: colors.surface,
              borderRadius: Radius.card,
              padding: Spacing.m,
              flexDirection: 'row',
              alignItems: 'center',
              ...Shadows.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={() => Alert.alert('Настройки', 'Системные настройки будут доступны в следующих версиях')}
          >
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: isDarkMode ? `${colors.primary}25` : `${colors.primary}15`,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: Spacing.m,
            }}>
              <Ionicons name="settings-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ ...Typography.body, color: colors.text }}>
                Системные настройки
              </ThemedText>
              <ThemedText style={{ ...Typography.caption, color: colors.textSecondary }}>
                Конфигурация приложения
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>

          <Pressable
            style={{
              backgroundColor: colors.surface,
              borderRadius: Radius.card,
              padding: Spacing.m,
              flexDirection: 'row',
              alignItems: 'center',
              ...Shadows.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={() => Alert.alert('Логи', 'Просмотр логов будет доступен в следующих версиях')}
          >
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: Spacing.m,
            }}>
              <Ionicons name="document-text-outline" size={18} color={isDarkMode ? '#666' : '#999'} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ ...Typography.body, color: colors.text }}>
                Логи системы
              </ThemedText>
              <ThemedText style={{ ...Typography.caption, color: colors.textSecondary }}>
                Просмотр и анализ
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>
      </Animated.View>

      {/* Выход из системы */}
      <Animated.View entering={FadeInDown.duration(500).delay(400)} style={{ marginTop: Spacing.l }}>
        <Pressable
          onPress={() => {
            onLogout();
          }}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#DC2626' : '#EF4444',
            borderRadius: 12,
            padding: Spacing.l,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: pressed ? '#B91C1C' : '#DC2626',
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Ionicons name="log-out-outline" size={20} color="white" style={{ marginRight: Spacing.s }} />
          <ThemedText style={{ 
            fontSize: 16,
            color: 'white',
            fontWeight: '600',
          }}>
            Выйти из системы
          </ThemedText>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// Компонент студент-профиля
function StudentProfile({ user, onLogout }: { user: any, onLogout: () => void }) {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [notificationsModalVisible, setNotificationsModalVisible] = React.useState(false);
  const [notificationSettings, setNotificationSettings] = React.useState({
    push: true,
    email: true,
    sms: false,
    schedule: true,
    grades: true,
    news: true,
    events: true,
    assignments: false,
    sound: true,
    vibration: true,
  });
  const { theme, isDarkMode, setTheme } = useTheme();
  const colors = getThemeColors(isDarkMode);
  
  const displayInfo = {
    name: `${user.first_name} ${user.last_name}`.trim() || user.username,
    subtitle: user.student?.group?.name ? `Группа ${user.student.group.name} • ${user.student.course || 1} курс` : 'Студент',
    roleColor: '#2563eb',
    initials: getInitials(user.first_name, user.last_name, user.username)
  };

  // Функция для получения инициалов
  function getInitials(firstName?: string, lastName?: string, username?: string): string {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (username) return username.slice(0, 2).toUpperCase();
    return 'СТ';
  }

  // Получить название текущей темы для отображения
  const getThemeDisplayName = () => {
    switch (theme) {
      case 'light': return 'Светлая';
      case 'dark': return 'Темная';
      default: return 'Светлая';
    }
  };

  // Показать диалог выбора темы
  const showThemeSelector = () => {
    Alert.alert(
      '🎨 Выберите тему',
      'Какую тему вы хотите использовать?',
      [
        { 
          text: '☀️ Светлая', 
          onPress: () => {
            setTheme('light');
          }
        },
        { 
          text: '🌙 Темная', 
          onPress: () => {
            setTheme('dark');
          }
        },
        { text: 'Отмена', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // Обновить конкретную настройку уведомлений
  const updateNotificationSetting = (key: keyof typeof notificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Показать модальное окно настроек уведомлений
  const showNotificationsModal = () => {
    setNotificationsModalVisible(true);
  };

  return (
    <>
      {/* Красивый профиль студента */}
      <Animated.View entering={SlideInRight.duration(400)} style={{ marginTop: Spacing.m, marginBottom: Spacing.m }}>
        <View
          style={{
            borderRadius: 20,
            padding: Spacing.l,
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.95)',
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.m }}>
            {/* Красивый аватар */}
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                marginRight: Spacing.m,
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={isDarkMode 
                  ? ['#4F46E5', '#7C3AED', '#1E293B'] 
                  : ['#6366F1', '#8B5CF6', '#EC4899']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 70,
                  height: 70,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <ThemedText style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: 'white',
                }}>
                  {displayInfo.initials}
                </ThemedText>
              </LinearGradient>
            </View>
            
            <View style={{ flex: 1 }}>
              <ThemedText
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: isDarkMode ? '#FFFFFF' : '#1E293B',
                  marginBottom: 4,
                }}
              >
                {displayInfo.name}
              </ThemedText>
              
              <ThemedText
                style={{
                  fontSize: 14,
                  color: isDarkMode ? '#94A3B8' : '#64748B',
                  marginBottom: 8,
                }}
              >
                {displayInfo.subtitle}
              </ThemedText>

              {/* Красивые чипы */}
              {!!user?.student && (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {!!user.student?.group?.name && (
                    <View style={{ 
                      backgroundColor: isDarkMode ? '#6366F1' : '#6366F1',
                      paddingHorizontal: 10, 
                      paddingVertical: 4, 
                      borderRadius: 14,
                    }}>
                      <ThemedText style={{ fontSize: 12, color: 'white', fontWeight: '600' }}>
                        {user.student.group.name}
                      </ThemedText>
                    </View>
                  )}
                  {!!user.student?.course && (
                    <View style={{ 
                      backgroundColor: isDarkMode ? '#8B5CF6' : '#8B5CF6',
                      paddingHorizontal: 10, 
                      paddingVertical: 4, 
                      borderRadius: 14,
                    }}>
                      <ThemedText style={{ fontSize: 12, color: 'white', fontWeight: '600' }}>
                        {user.student.course} курс
                      </ThemedText>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Красивая статистика */}
          <View style={{ 
            flexDirection: 'row', 
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.05)',
            borderRadius: 16,
            padding: Spacing.m,
            gap: 12,
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.1)',
          }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isDarkMode ? '#6366F1' : '#8B5CF6',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 4,
              }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '700', color: 'white' }}>
                  4.2
                </ThemedText>
              </View>
              <ThemedText style={{ fontSize: 11, color: isDarkMode ? '#94A3B8' : '#64748B', textAlign: 'center' }}>
                Средний балл
              </ThemedText>
            </View>
            
            <View style={{ alignItems: 'center', flex: 1 }}>
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isDarkMode ? '#8B5CF6' : '#EC4899',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 4,
              }}>
                <ThemedText style={{ fontSize: 16, fontWeight: '700', color: 'white' }}>
                  12
                </ThemedText>
              </View>
              <ThemedText style={{ fontSize: 11, color: isDarkMode ? '#94A3B8' : '#64748B', textAlign: 'center' }}>
                Предметов
              </ThemedText>
            </View>
            
            <View style={{ alignItems: 'center', flex: 1 }}>
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isDarkMode ? '#EC4899' : '#6366F1',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 4,
              }}>
                <ThemedText style={{ fontSize: 14, fontWeight: '700', color: 'white' }}>
                  87%
                </ThemedText>
              </View>
              <ThemedText style={{ fontSize: 11, color: isDarkMode ? '#94A3B8' : '#64748B', textAlign: 'center' }}>
                Посещаемость
              </ThemedText>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Успеваемость */}
      <Animated.View entering={FadeInDown.duration(500).delay(200)}>
        <ThemedText style={{ 
          fontSize: 18, 
          fontWeight: '700', 
          color: isDarkMode ? '#FFFFFF' : '#FFFFFF', 
          marginBottom: Spacing.m,
          marginLeft: 4,
        }}>
          📊 Успеваемость
        </ThemedText>
        
        <SettingsItem
          title="Оценки"
          subtitle="Текущие оценки по предметам"
          icon="school-outline"
          onPress={() => router.push('/(tabs)')}
        />
        
        <SettingsItem
          title="Расписание"
          subtitle="Расписание занятий"
          icon="calendar-outline"
          onPress={() => router.push('/(tabs)/schedule')}
        />
        
        <SettingsItem
          title="Задания"
          subtitle="Домашние задания и проекты"
          icon="clipboard-outline"
          onPress={() => Alert.alert('Задания', 'Раздел с заданиями будет доступен в следующих версиях')}
        />

        <SettingsItem
          title="Библиотека"
          subtitle="Учебные материалы и ресурсы"
          icon="library-outline"
          onPress={() => Alert.alert('Библиотека', 'Электронная библиотека будет доступна в следующих версиях')}
        />
      </Animated.View>

      {/* Настройки */}
      <Animated.View entering={FadeInDown.duration(500).delay(300)} style={{ marginTop: Spacing.l }}>
        <ThemedText style={{ 
          fontSize: 18, 
          fontWeight: '700', 
          color: isDarkMode ? '#FFFFFF' : '#FFFFFF', 
          marginBottom: Spacing.m,
          marginLeft: 4,
        }}>
          ⚙️ Настройки
        </ThemedText>
        
        <SettingsItem
          title="Уведомления"
          subtitle="Push-уведомления и звуки"
          icon="notifications-outline"
          onPress={showNotificationsModal}
          rightComponent={
            <Switch 
              value={notificationsEnabled} 
              onValueChange={setNotificationsEnabled}
              trackColor={{ 
                false: isDarkMode ? '#374151' : '#E5E7EB', 
                true: isDarkMode ? '#6366F1' : '#8B5CF6' 
              }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#ffffff'}
              style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
            />
          }
        />
        
        <SettingsItem
          title="Тема приложения"
          subtitle={getThemeDisplayName()}
          icon="moon-outline"
          onPress={showThemeSelector}
          rightComponent={
            <Switch
              value={isDarkMode}
              onValueChange={(value) => {
                setTheme(value ? 'dark' : 'light');
              }}
              trackColor={{ 
                false: isDarkMode ? '#374151' : '#E5E7EB', 
                true: isDarkMode ? '#6366F1' : '#8B5CF6' 
              }}
              thumbColor={isDarkMode ? '#ffffff' : '#ffffff'}
              style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
            />
          }
        />

        <SettingsItem
          title="Язык приложения"
          subtitle="Русский"
          icon="language-outline"
          onPress={() => Alert.alert('Язык', 'Смена языка будет доступна в следующих версиях')}
        />

        <SettingsItem
          title="Конфиденциальность"
          subtitle="Управление данными"
          icon="shield-checkmark-outline"
          onPress={() => Alert.alert('Конфиденциальность', 'Настройки конфиденциальности будут доступны в следующих версиях')}
        />
        
        <SettingsItem
          title="О приложении"
          subtitle="Версия 1.0.0"
          icon="information-circle-outline"
          onPress={() => Alert.alert('О приложении', 'TIUE App v1.0.0\nПриложение для студентов университета')}
        />
      </Animated.View>

      {/* Компактная кнопка выхода */}
      <Animated.View entering={FadeInDown.duration(500).delay(400)} style={{ marginTop: Spacing.l }}>
        <Pressable
          onPress={onLogout}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#DC2626' : '#EF4444',
            borderRadius: 12,
            padding: Spacing.m,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Spacing.l,
            borderWidth: 1,
            borderColor: pressed ? '#B91C1C' : '#DC2626',
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Ionicons name="log-out-outline" size={18} color="white" style={{ marginRight: Spacing.s }} />
          <ThemedText style={{ 
            fontSize: 15,
            color: 'white',
            fontWeight: '600',
          }}>
            Выйти из аккаунта
          </ThemedText>
        </Pressable>
      </Animated.View>

      {/* Модальное окно настроек уведомлений */}
      <Modal
        visible={notificationsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setNotificationsModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Заголовок модального окна */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: Spacing.l,
            paddingVertical: Spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          }}>
            <ThemedText style={{
              fontSize: 20,
              fontWeight: '700',
              color: isDarkMode ? '#FFFFFF' : '#1E293B',
            }}>
              🔔 Настройки уведомлений
            </ThemedText>
            <Pressable
              onPress={() => setNotificationsModalVisible(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="close" size={18} color={isDarkMode ? '#FFFFFF' : '#1E293B'} />
            </Pressable>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.l }}>
            {/* Общие настройки */}
            <View style={{ marginBottom: Spacing.l }}>
              <ThemedText style={{
                fontSize: 16,
                fontWeight: '600',
                color: isDarkMode ? '#F1F5F9' : '#374151',
                marginBottom: Spacing.m,
              }}>
                📱 Общие настройки
              </ThemedText>

              <SettingsItem
                title="Push-уведомления"
                subtitle="Уведомления в системе"
                icon="phone-portrait-outline"
                rightComponent={
                  <Switch
                    value={notificationSettings.push}
                    onValueChange={(value) => updateNotificationSetting('push', value)}
                    trackColor={{ 
                      false: isDarkMode ? '#374151' : '#E5E7EB', 
                      true: isDarkMode ? '#6366F1' : '#8B5CF6' 
                    }}
                    thumbColor={'#ffffff'}
                    style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                  />
                }
                showArrow={false}
              />

              <SettingsItem
                title="Email уведомления"
                subtitle="Уведомления на почту"
                icon="mail-outline"
                rightComponent={
                  <Switch
                    value={notificationSettings.email}
                    onValueChange={(value) => updateNotificationSetting('email', value)}
                    trackColor={{ 
                      false: isDarkMode ? '#374151' : '#E5E7EB', 
                      true: isDarkMode ? '#6366F1' : '#8B5CF6' 
                    }}
                    thumbColor={'#ffffff'}
                    style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                  />
                }
                showArrow={false}
              />

              <SettingsItem
                title="SMS уведомления"
                subtitle="Текстовые сообщения"
                icon="chatbubble-outline"
                rightComponent={
                  <Switch
                    value={notificationSettings.sms}
                    onValueChange={(value) => updateNotificationSetting('sms', value)}
                    trackColor={{ 
                      false: isDarkMode ? '#374151' : '#E5E7EB', 
                      true: isDarkMode ? '#6366F1' : '#8B5CF6' 
                    }}
                    thumbColor={'#ffffff'}
                    style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                  />
                }
                showArrow={false}
              />
            </View>

            {/* Типы уведомлений */}
            <View style={{ marginBottom: Spacing.l }}>
              <ThemedText style={{
                fontSize: 16,
                fontWeight: '600',
                color: isDarkMode ? '#F1F5F9' : '#374151',
                marginBottom: Spacing.m,
              }}>
                📝 Типы уведомлений
              </ThemedText>

              <SettingsItem
                title="Расписание"
                subtitle="Напоминания о занятиях"
                icon="calendar-outline"
                rightComponent={
                  <Switch
                    value={notificationSettings.schedule}
                    onValueChange={(value) => updateNotificationSetting('schedule', value)}
                    trackColor={{ 
                      false: isDarkMode ? '#374151' : '#E5E7EB', 
                      true: isDarkMode ? '#6366F1' : '#8B5CF6' 
                    }}
                    thumbColor={'#ffffff'}
                    style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                  />
                }
                showArrow={false}
              />

              <SettingsItem
                title="Оценки"
                subtitle="Новые оценки и результаты"
                icon="school-outline"
                rightComponent={
                  <Switch
                    value={notificationSettings.grades}
                    onValueChange={(value) => updateNotificationSetting('grades', value)}
                    trackColor={{ 
                      false: isDarkMode ? '#374151' : '#E5E7EB', 
                      true: isDarkMode ? '#6366F1' : '#8B5CF6' 
                    }}
                    thumbColor={'#ffffff'}
                    style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                  />
                }
                showArrow={false}
              />

              <SettingsItem
                title="Новости"
                subtitle="Университетские новости"
                icon="newspaper-outline"
                rightComponent={
                  <Switch
                    value={notificationSettings.news}
                    onValueChange={(value) => updateNotificationSetting('news', value)}
                    trackColor={{ 
                      false: isDarkMode ? '#374151' : '#E5E7EB', 
                      true: isDarkMode ? '#6366F1' : '#8B5CF6' 
                    }}
                    thumbColor={'#ffffff'}
                    style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                  />
                }
                showArrow={false}
              />

              <SettingsItem
                title="События"
                subtitle="Мероприятия и события"
                icon="flag-outline"
                rightComponent={
                  <Switch
                    value={notificationSettings.events}
                    onValueChange={(value) => updateNotificationSetting('events', value)}
                    trackColor={{ 
                      false: isDarkMode ? '#374151' : '#E5E7EB', 
                      true: isDarkMode ? '#6366F1' : '#8B5CF6' 
                    }}
                    thumbColor={'#ffffff'}
                    style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                  />
                }
                showArrow={false}
              />

              <SettingsItem
                title="Задания"
                subtitle="Домашние задания"
                icon="clipboard-outline"
                rightComponent={
                  <Switch
                    value={notificationSettings.assignments}
                    onValueChange={(value) => updateNotificationSetting('assignments', value)}
                    trackColor={{ 
                      false: isDarkMode ? '#374151' : '#E5E7EB', 
                      true: isDarkMode ? '#6366F1' : '#8B5CF6' 
                    }}
                    thumbColor={'#ffffff'}
                    style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                  />
                }
                showArrow={false}
              />
            </View>

            {/* Звуки и вибрация */}
            <View style={{ marginBottom: Spacing.l }}>
              <ThemedText style={{
                fontSize: 16,
                fontWeight: '600',
                color: isDarkMode ? '#F1F5F9' : '#374151',
                marginBottom: Spacing.m,
              }}>
                🔊 Звуки и вибрация
              </ThemedText>

              <SettingsItem
                title="Звук уведомлений"
                subtitle="Звуковые сигналы"
                icon="volume-high-outline"
                rightComponent={
                  <Switch
                    value={notificationSettings.sound}
                    onValueChange={(value) => updateNotificationSetting('sound', value)}
                    trackColor={{ 
                      false: isDarkMode ? '#374151' : '#E5E7EB', 
                      true: isDarkMode ? '#6366F1' : '#8B5CF6' 
                    }}
                    thumbColor={'#ffffff'}
                    style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                  />
                }
                showArrow={false}
              />

              <SettingsItem
                title="Вибрация"
                subtitle="Тактильная обратная связь"
                icon="phone-portrait-outline"
                rightComponent={
                  <Switch
                    value={notificationSettings.vibration}
                    onValueChange={(value) => updateNotificationSetting('vibration', value)}
                    trackColor={{ 
                      false: isDarkMode ? '#374151' : '#E5E7EB', 
                      true: isDarkMode ? '#6366F1' : '#8B5CF6' 
                    }}
                    thumbColor={'#ffffff'}
                    style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                  />
                }
                showArrow={false}
              />
            </View>

            {/* Кнопка сохранения настроек */}
            <Pressable
              onPress={() => {
                setNotificationsModalVisible(false);
                Alert.alert('✅ Настройки сохранены', 'Ваши настройки уведомлений обновлены');
              }}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#5B5CF6' : '#6366F1',
                borderRadius: 12,
                padding: Spacing.l,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Spacing.xl,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="white" style={{ marginRight: Spacing.s }} />
              <ThemedText style={{
                fontSize: 16,
                color: 'white',
                fontWeight: '600',
              }}>
                Сохранить настройки
              </ThemedText>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

    const handleLogout = async () => {
    if (isLoggingOut) return; // Предотвращаем множественные вызовы
    
    setIsLoggingOut(true);
    
    try {
      
      // Выполняем logout через Redux (он сам очистит все данные)
      await dispatch(logoutUser());
      
      // Перенаправляем на логин
      router.replace('/login');
      
    } catch (error) {
      // В случае ошибки API, все равно очищаем локальные данные
      dispatch(clearCredentials());
      await AsyncStorage.removeItem('authToken');
      
      // И перенаправляем на логин
      router.replace('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Если пользователь не авторизован
  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.l }}>
          <Ionicons name="person-outline" size={64} color={colors.textSecondary} />
          <ThemedText style={{ ...Typography.titleH2, color: colors.textSecondary, marginTop: Spacing.l }}>
            Не авторизован
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Декоративный градиент фона вверху профиля */}
      <LinearGradient
        colors={['transparent', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 0 }}
        pointerEvents="none"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Spacing.l,
          paddingBottom: 90,
          paddingTop: Spacing.m,
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
