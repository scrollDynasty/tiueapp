import { ThemedText } from '@/components/ThemedText';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { clearCredentials, logoutUser } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Компонент админ-профиля - современная панель управления
function AdminProfile({ user, onLogout }: { user: any, onLogout: () => void }) {
  // Получаем данные из Redux для статистики
  const { items: newsItems } = useAppSelector((state) => state.news);
  const { items: eventsItems } = useAppSelector((state) => state.events);
  
  const displayInfo = {
    name: `${user.first_name} ${user.last_name}`.trim() || user.username,
    subtitle: 'Системный администратор',
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Современный заголовок админ панели */}
      <Animated.View 
        entering={SlideInRight.duration(400)}
        style={{
          backgroundColor: Colors.brandPrimary,
          paddingHorizontal: Spacing.l,
          paddingVertical: Spacing.xl,
          marginTop: -Spacing.l,
          marginHorizontal: -Spacing.l,
          marginBottom: Spacing.l,
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
              backgroundColor: '#FEF3C7',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: Spacing.m,
            }}>
              <Ionicons name="calendar-outline" size={24} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ 
                ...Typography.titleH2, 
                color: Colors.textPrimary, 
                marginBottom: 4,
              }}>
                Управление событиями
              </ThemedText>
              <ThemedText style={{ 
                ...Typography.body, 
                color: Colors.textSecondary,
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
              borderColor: Colors.strokeSoft,
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#D1FAE5',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: Spacing.m,
            }}>
              <Ionicons name="time-outline" size={24} color="#10B981" />
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
                color: Colors.textSecondary,
                fontSize: 14,
              }}>
                Составление и редактирование
              </ThemedText>
            </View>
            <View style={{
              backgroundColor: '#D1FAE5',
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
  
  const displayInfo = {
    name: `${user.first_name} ${user.last_name}`.trim() || user.username,
    subtitle: user.student?.group?.name ? `Группа ${user.student.group.name} • ${user.student.course || 1} курс` : 'Студент',
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
      </Animated.View>

      {/* Успеваемость */}
      <Animated.View entering={FadeInDown.duration(500).delay(200)}>
        <ThemedText style={{ ...Typography.titleH2, color: Colors.textPrimary, marginBottom: Spacing.m }}>
          Успеваемость
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
      </Animated.View>

      {/* Настройки */}
      <Animated.View entering={FadeInDown.duration(500).delay(300)} style={{ marginTop: Spacing.l }}>
        <ThemedText style={{ ...Typography.titleH2, color: Colors.textPrimary, marginBottom: Spacing.m }}>
          Настройки
        </ThemedText>
        
        <SettingsItem
          title="Уведомления"
          subtitle="Настройка push-уведомлений"
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
          title="О приложении"
          subtitle="Версия 1.0.0"
          icon="information-circle-outline"
          onPress={() => Alert.alert('О приложении', 'TIUE App v1.0.0\nПриложение для студентов университета')}
        />
      </Animated.View>

      {/* Выход */}
      <Animated.View entering={FadeInDown.duration(500).delay(400)} style={{ marginTop: Spacing.l, zIndex: 999 }}>
        <Pressable
          onPress={() => {
            console.log('Student logout button pressed!');
            onLogout();
          }}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#dc2626' : '#ef4444',
            borderRadius: 12,
            padding: Spacing.m,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Spacing.l,
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

    const handleLogout = async () => {
    if (isLoggingOut) return; // Предотвращаем множественные вызовы
    
    console.log('handleLogout function called!');
    setIsLoggingOut(true);
    
    try {
      console.log('Starting logout process...');
      
      // Выполняем logout через Redux (он сам очистит все данные)
      await dispatch(logoutUser());
      console.log('Logout completed successfully');
      
      // Перенаправляем на логин
      console.log('Redirecting to login...');
      router.replace('/login');
      
    } catch (error) {
      console.error('Logout error:', error);
      
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
