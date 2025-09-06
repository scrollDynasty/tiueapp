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
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  
  const handlePress = () => {
    console.log('SettingsItem pressed:', title);
    if (onPress) {
      onPress();
    }
  };
  
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.m,
        backgroundColor: pressed ? (isDarkMode ? colors.background : colors.backgroundSecondary) : (isDarkMode ? colors.surfaceSecondary : colors.surface),
        borderRadius: 12,
        marginBottom: Spacing.s,
        ...Shadows.card,
        shadowOpacity: isDarkMode ? 0.2 : 0.03,
        shadowRadius: 4,
        elevation: isDarkMode ? 6 : 2,
        borderWidth: isDarkMode ? 1 : 0.5,
        borderColor: isDarkMode ? colors.border : colors.borderLight,
      })}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.primary + '15',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: Spacing.m,
        }}
      >
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <ThemedText
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
            marginBottom: subtitle ? 2 : 0,
          }}
        >
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText
            style={{
              fontSize: 12,
              color: colors.textSecondary,
            }}
          >
            {subtitle}
          </ThemedText>
        )}
      </View>

      {rightComponent || (showArrow && (
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
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
          colors={[Colors.brandPrimary, '#5B8DF7']}
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
            backgroundColor: Colors.chipBg,
            paddingHorizontal: Spacing.m,
            paddingVertical: Spacing.xs,
            borderRadius: 16,
          }}>
            <ThemedText style={{
              ...Typography.caption,
              color: Colors.brandPrimary,
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
          color: Colors.textPrimary, 
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
              backgroundColor: Colors.surface,
              borderRadius: Radius.card,
              padding: Spacing.l,
              flexDirection: 'row',
              alignItems: 'center',
              ...Shadows.card,
              borderWidth: 1,
              borderColor: Colors.strokeSoft,
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: Colors.brandPrimary10,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: Spacing.m,
            }}>
              <Ionicons name="newspaper-outline" size={24} color={Colors.brandPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ 
                ...Typography.titleH2, 
                color: Colors.textPrimary, 
                marginBottom: 4,
              }}>
                Управление новостями
              </ThemedText>
              <ThemedText style={{ 
                ...Typography.body, 
                color: Colors.textSecondary,
                fontSize: 14,
              }}>
                {newsItems.length} активных новостей
              </ThemedText>
            </View>
            <View style={{
              backgroundColor: Colors.chipBg,
              paddingHorizontal: Spacing.s,
              paddingVertical: Spacing.xs,
              borderRadius: Radius.icon,
              marginRight: Spacing.s,
            }}>
              <ThemedText style={{
                ...Typography.caption,
                color: Colors.chipIcon,
                fontWeight: '600',
              }}>
                {newsItems.length}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </Pressable>

          {/* Карточка управления событиями */}
          <Pressable
            onPress={() => router.push('../../admin/events' as any)}
            style={{
              backgroundColor: Colors.surface,
              borderRadius: Radius.card,
              padding: Spacing.l,
              flexDirection: 'row',
              alignItems: 'center',
              ...Shadows.card,
              borderWidth: 1,
              borderColor: Colors.strokeSoft,
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
              backgroundColor: Colors.surface,
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
                color: Colors.textPrimary, 
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
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </Animated.View>

      {/* Системная информация и настройки */}
      <Animated.View entering={FadeInDown.duration(500).delay(300)}>
        <ThemedText style={{ 
          ...Typography.titleH2, 
          color: Colors.textPrimary, 
          marginBottom: Spacing.m,
          fontSize: 18,
        }}>
          Системная информация
        </ThemedText>
        
        <View style={{ gap: Spacing.s, marginBottom: Spacing.l }}>
          <Pressable
            style={{
              backgroundColor: Colors.surface,
              borderRadius: Radius.card,
              padding: Spacing.m,
              flexDirection: 'row',
              alignItems: 'center',
              ...Shadows.card,
              borderWidth: 1,
              borderColor: Colors.strokeSoft,
            }}
            onPress={() => Alert.alert('Настройки', 'Системные настройки будут доступны в следующих версиях')}
          >
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: Colors.brandPrimary10,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: Spacing.m,
            }}>
              <Ionicons name="settings-outline" size={18} color={Colors.brandPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ ...Typography.body, color: Colors.textPrimary }}>
                Системные настройки
              </ThemedText>
              <ThemedText style={{ ...Typography.caption, color: Colors.textSecondary }}>
                Конфигурация приложения
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
          </Pressable>

          <Pressable
            style={{
              backgroundColor: Colors.surface,
              borderRadius: Radius.card,
              padding: Spacing.m,
              flexDirection: 'row',
              alignItems: 'center',
              ...Shadows.card,
              borderWidth: 1,
              borderColor: Colors.strokeSoft,
            }}
            onPress={() => Alert.alert('Логи', 'Просмотр логов будет доступен в следующих версиях')}
          >
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: Colors.chipBg,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: Spacing.m,
            }}>
              <Ionicons name="document-text-outline" size={18} color={Colors.chipIcon} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ ...Typography.body, color: Colors.textPrimary }}>
                Логи системы
              </ThemedText>
              <ThemedText style={{ ...Typography.caption, color: Colors.textSecondary }}>
                Просмотр и анализ
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </Animated.View>

      {/* Выход из системы */}
      <Animated.View entering={FadeInDown.duration(500).delay(400)} style={{ marginTop: Spacing.l, zIndex: 999 }}>
        <Pressable
          onPress={() => {
            console.log('Logout button pressed!');
            onLogout();
          }}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#dc2626' : Colors.error,
            borderRadius: Radius.card,
            padding: Spacing.l,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.8 : 1,
            ...Shadows.card,
          })}
        >
          <Ionicons name="log-out-outline" size={20} color="white" style={{ marginRight: Spacing.s }} />
          <ThemedText style={{ 
            ...Typography.body, 
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

  return (
    <>
      {/* Компактный профиль студента */}
      <Animated.View entering={SlideInRight.duration(400)} style={{ marginTop: Spacing.m, marginBottom: Spacing.m }}>
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            padding: Spacing.m,
            ...Shadows.card,
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Компактный аватар */}
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: Colors.brandPrimary,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: Spacing.m,
                ...Shadows.card,
                shadowOpacity: 0.2,
              }}
            >
              <ThemedText style={{
                fontSize: 20,
                fontWeight: '700',
                color: 'white',
              }}>
                {displayInfo.initials}
              </ThemedText>
            </View>
            
            <View style={{ flex: 1 }}>
              <ThemedText
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: Colors.textPrimary,
                  marginBottom: 2,
                }}
              >
                {displayInfo.name}
              </ThemedText>
              
              <ThemedText
                style={{
                  fontSize: 13,
                  color: Colors.textSecondary,
                  marginBottom: 6,
                }}
              >
                {displayInfo.subtitle}
              </ThemedText>

              {/* Компактные чипы */}
              {!!user?.student && (
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {!!user.student?.group?.name && (
                    <View style={{ 
                      backgroundColor: Colors.brandPrimary + '15', 
                      paddingHorizontal: 8, 
                      paddingVertical: 3, 
                      borderRadius: 12,
                    }}>
                      <ThemedText style={{ fontSize: 11, color: Colors.brandPrimary, fontWeight: '600' }}>
                        {user.student.group.name}
                      </ThemedText>
                    </View>
                  )}
                  {!!user.student?.course && (
                    <View style={{ 
                      backgroundColor: isDarkMode ? `${colors.success}25` : `${colors.success}15`, 
                      paddingHorizontal: 8, 
                      paddingVertical: 3, 
                      borderRadius: 12,
                    }}>
                      <ThemedText style={{ fontSize: 11, color: colors.success, fontWeight: '600' }}>
                        {user.student.course} курс
                      </ThemedText>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Компактная статистика */}
          <View style={{ 
            flexDirection: 'row', 
            marginTop: Spacing.m,
            backgroundColor: isDarkMode ? colors.background : colors.backgroundSecondary,
            borderRadius: 12,
            padding: Spacing.s,
            gap: 8,
            borderWidth: isDarkMode ? 1 : 0,
            borderColor: isDarkMode ? colors.border : 'transparent',
          }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <ThemedText style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>
                4.2
              </ThemedText>
              <ThemedText style={{ fontSize: 10, color: colors.textSecondary }}>
                Средний балл
              </ThemedText>
            </View>
            
            <View style={{ alignItems: 'center', flex: 1 }}>
              <ThemedText style={{ fontSize: 16, fontWeight: '700', color: '#059669' }}>
                12
              </ThemedText>
              <ThemedText style={{ fontSize: 10, color: Colors.textSecondary }}>
                Предметов
              </ThemedText>
            </View>
            
            <View style={{ alignItems: 'center', flex: 1 }}>
              <ThemedText style={{ fontSize: 16, fontWeight: '700', color: '#D97706' }}>
                87%
              </ThemedText>
              <ThemedText style={{ fontSize: 10, color: Colors.textSecondary }}>
                Посещаемость
              </ThemedText>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Успеваемость */}
      <Animated.View entering={FadeInDown.duration(500).delay(200)}>
        <ThemedText style={{ 
          fontSize: 18, 
          fontWeight: '700', 
          color: Colors.textPrimary, 
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
          color: Colors.textPrimary, 
          marginBottom: Spacing.m,
          marginLeft: 4,
        }}>
          ⚙️ Настройки
        </ThemedText>
        
        <SettingsItem
          title="Уведомления"
          subtitle="Push-уведомления и звуки"
          icon="notifications-outline"
          rightComponent={
            <Switch 
              value={notificationsEnabled} 
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.strokeSoft, true: Colors.brandPrimary }}
              thumbColor={notificationsEnabled ? Colors.surface : Colors.textSecondary}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          }
          showArrow={false}
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
                console.log('Switch toggled to:', value);
                setTheme(value ? 'dark' : 'light');
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDarkMode ? colors.surface : colors.surface}
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
            backgroundColor: pressed ? '#DC2626' : colors.error,
            borderRadius: 12,
            padding: Spacing.m,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Spacing.l,
            opacity: pressed ? 0.9 : 1,
            ...Shadows.card,
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            elevation: isDarkMode ? 6 : 4,
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
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.l }}>
          <Ionicons name="person-outline" size={64} color={Colors.textSecondary} />
          <ThemedText style={{ ...Typography.titleH2, color: Colors.textSecondary, marginTop: Spacing.l }}>
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
          paddingBottom: 100,
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
