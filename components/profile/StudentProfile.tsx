import { ThemedText } from '@/components/ThemedText';
import { SettingsItem } from '@/components/profile/SettingsItem';
import { getThemeColors } from '@/constants/Colors';
import { Spacing } from '@/constants/DesignTokens';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Modal, Pressable, ScrollView, Switch, View } from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface StudentProfileProps {
  user: any;
  onLogout: () => void;
}

export const StudentProfile = React.memo(({ user, onLogout }: StudentProfileProps) => {
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
  const { isSmallScreen, spacing, fontSize, isVerySmallScreen } = useResponsive();
  
  // Функция для получения инициалов
  const getInitials = React.useCallback((firstName?: string, lastName?: string, username?: string): string => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (username) return username.slice(0, 2).toUpperCase();
    return 'СТ';
  }, []);
  
  const displayInfo = React.useMemo(() => {
    // Используем данные из LDAP профиля если они есть
    const ldapProfile = user.ldap_profile;
    const name = ldapProfile?.full_name || `${user.first_name} ${user.last_name}`.trim() || user.username;
    const groupName = ldapProfile?.group || user.student?.group?.name;
    const course = user.student?.course || 1;
    
    return {
      name,
      subtitle: groupName ? `Группа ${groupName} • ${course} курс` : 'Студент',
      roleColor: '#2563eb',
      initials: getInitials(user.first_name, user.last_name, user.username)
    };
  }, [user.first_name, user.last_name, user.username, user.student, user.ldap_profile, getInitials]);

  // Получить название текущей темы для отображения
  const getThemeDisplayName = React.useCallback(() => {
    switch (theme) {
      case 'light': return 'Светлая';
      case 'dark': return 'Темная';
      default: return 'Светлая';
    }
  }, [theme]);

  // Показать диалог выбора темы
  const showThemeSelector = React.useCallback(() => {
    Alert.alert(
      'Выберите тему',
      'Какую тему вы хотите использовать?',
      [
        { 
          text: 'Светлая', 
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
  }, [setTheme]);

  // Обновить конкретную настройку уведомлений
  const updateNotificationSetting = React.useCallback((key: keyof typeof notificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Показать модальное окно настроек уведомлений
  const showNotificationsModal = React.useCallback(() => {
    setNotificationsModalVisible(true);
  }, []);

  const handleGradesPress = React.useCallback(() => {
    router.push('/(tabs)');
  }, []);

  const handleSchedulePress = React.useCallback(() => {
    router.push('/(tabs)/schedule');
  }, []);

  const handleAssignmentsPress = React.useCallback(() => {
    Alert.alert('Задания', 'Раздел с заданиями будет доступен в следующих версиях');
  }, []);

  const handleLibraryPress = React.useCallback(() => {
    Alert.alert('Библиотека', 'Электронная библиотека будет доступна в следующих версиях');
  }, []);

  const handleLanguagePress = React.useCallback(() => {
    Alert.alert('Язык', 'Смена языка будет доступна в следующих версиях');
  }, []);

  const handlePrivacyPress = React.useCallback(() => {
    Alert.alert('Конфиденциальность', 'Настройки конфиденциальности будут доступны в следующих версиях');
  }, []);

  const handleAboutPress = React.useCallback(() => {
    Alert.alert('О приложении', 'TIUE App v1.0.0\nПриложение для студентов университета');
  }, []);

  const handleThemeToggle = React.useCallback((value: boolean) => {
    setTheme(value ? 'dark' : 'light');
  }, [setTheme]);

  const handleSaveNotifications = React.useCallback(() => {
    setNotificationsModalVisible(false);
    Alert.alert('✅ Настройки сохранены', 'Ваши настройки уведомлений обновлены');
  }, []);

  const handleCloseModal = React.useCallback(() => {
    setNotificationsModalVisible(false);
  }, []);

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
                lineHeight: 26, // Добавляем lineHeight чтобы текст не обрезался
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
                      <ThemedText style={{ fontSize: 12, color: 'white' }}>
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
                      <ThemedText style={{ fontSize: 12, color: 'white' }}>
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
                <ThemedText style={{ color: 'white', fontSize: 13 }}>
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
                <ThemedText style={{ color: 'white', fontSize: 13 }}>
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
                <ThemedText style={{ color: 'white', fontSize: 13 }}>
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

      {/* Информация из LDAP профиля */}
      {user.ldap_profile && (
        <Animated.View entering={FadeInDown.duration(500).delay(150)} style={{ marginTop: Spacing.l }}>
          <ThemedText style={{ 
            fontSize: 18, 
            color: isDarkMode ? '#FFFFFF' : '#1E293B',
            marginBottom: Spacing.m,
            marginLeft: 4,
          }}>
            Информация о студенте
          </ThemedText>
          
          <View style={{
            borderRadius: 16,
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
            padding: Spacing.m,
          }}>
            {/* Основная информация */}
            {user.ldap_profile.jshr && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <ThemedText style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 14 }}>
                  JSHR:
                </ThemedText>
                <ThemedText style={{ color: isDarkMode ? '#FFFFFF' : '#1E293B', fontSize: 14, fontWeight: '500' }}>
                  {user.ldap_profile.jshr}
                </ThemedText>
              </View>
            )}
            
            {user.ldap_profile.birthday && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <ThemedText style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 14 }}>
                  Дата рождения:
                </ThemedText>
                <ThemedText style={{ color: isDarkMode ? '#FFFFFF' : '#1E293B', fontSize: 14, fontWeight: '500' }}>
                  {user.ldap_profile.birthday}
                </ThemedText>
              </View>
            )}
            
            {user.ldap_profile.phone && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <ThemedText style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 14 }}>
                  Телефон:
                </ThemedText>
                <ThemedText style={{ color: isDarkMode ? '#FFFFFF' : '#1E293B', fontSize: 14, fontWeight: '500' }}>
                  {user.ldap_profile.phone}
                </ThemedText>
              </View>
            )}
            
            {user.ldap_profile.yonalishCon && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <ThemedText style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 14 }}>
                  Специальность:
                </ThemedText>
                <ThemedText style={{ color: isDarkMode ? '#FFFFFF' : '#1E293B', fontSize: 14, fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 8 }}>
                  {user.ldap_profile.yonalishCon}
                </ThemedText>
              </View>
            )}
            
            {user.ldap_profile.degree && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <ThemedText style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 14 }}>
                  Степень:
                </ThemedText>
                <ThemedText style={{ color: isDarkMode ? '#FFFFFF' : '#1E293B', fontSize: 14, fontWeight: '500' }}>
                  {user.ldap_profile.degree}
                </ThemedText>
              </View>
            )}
            
            {user.ldap_profile.talim && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <ThemedText style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 14 }}>
                  Форма обучения:
                </ThemedText>
                <ThemedText style={{ color: isDarkMode ? '#FFFFFF' : '#1E293B', fontSize: 14, fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 8 }}>
                  {user.ldap_profile.talim}
                </ThemedText>
              </View>
            )}
            
            {user.ldap_profile.talimcon && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <ThemedText style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 14 }}>
                  Язык обучения:
                </ThemedText>
                <ThemedText style={{ color: isDarkMode ? '#FFFFFF' : '#1E293B', fontSize: 14, fontWeight: '500' }}>
                  {user.ldap_profile.talimcon}
                </ThemedText>
              </View>
            )}
            
            {user.ldap_profile.length && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <ThemedText style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 14 }}>
                  Длительность:
                </ThemedText>
                <ThemedText style={{ color: isDarkMode ? '#FFFFFF' : '#1E293B', fontSize: 14, fontWeight: '500' }}>
                  {user.ldap_profile.length}
                </ThemedText>
              </View>
            )}
            
            {user.ldap_profile.admdate && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <ThemedText style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 14 }}>
                  Дата поступления:
                </ThemedText>
                <ThemedText style={{ color: isDarkMode ? '#FFFFFF' : '#1E293B', fontSize: 14, fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 8 }}>
                  {user.ldap_profile.admdate}
                </ThemedText>
              </View>
            )}
            
            {user.ldap_profile.yearofgraduation && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 14 }}>
                  Год окончания:
                </ThemedText>
                <ThemedText style={{ color: isDarkMode ? '#FFFFFF' : '#1E293B', fontSize: 14, fontWeight: '500' }}>
                  {user.ldap_profile.yearofgraduation}
                </ThemedText>
              </View>
            )}
          </View>
        </Animated.View>
      )}

      {/* Успеваемость */}
      <Animated.View entering={FadeInDown.duration(500).delay(200)} style={{ marginTop: Spacing.l }}>
        <ThemedText style={{ 
          fontSize: 18, 
          color: isDarkMode ? '#FFFFFF' : '#000000', 
          marginBottom: Spacing.m,
          marginLeft: 4,
        }}>
          Успеваемость
        </ThemedText>
        
        <SettingsItem
          title="Оценки"
          subtitle="Текущие оценки по предметам"
          icon="school-outline"
          onPress={handleGradesPress}
        />
        
        <SettingsItem
          title="Расписание"
          subtitle="Расписание занятий"
          icon="calendar-outline"
          onPress={handleSchedulePress}
        />
        
        <SettingsItem
          title="Задания"
          subtitle="Домашние задания и проекты"
          icon="clipboard-outline"
          onPress={handleAssignmentsPress}
        />

        <SettingsItem
          title="Библиотека"
          subtitle="Учебные материалы и ресурсы"
          icon="library-outline"
          onPress={handleLibraryPress}
        />
      </Animated.View>

      {/* Настройки */}
      <Animated.View entering={FadeInDown.duration(500).delay(300)} style={{ marginTop: Spacing.l }}>
        <ThemedText style={{ 
          fontSize: 18, 
          color: isDarkMode ? '#FFFFFF' : '#000000', 
          marginBottom: Spacing.m,
          marginLeft: 4,
        }}>
          Настройки
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
              onValueChange={handleThemeToggle}
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
          onPress={handleLanguagePress}
        />

        <SettingsItem
          title="Конфиденциальность"
          subtitle="Управление данными"
          icon="shield-checkmark-outline"
          onPress={handlePrivacyPress}
        />
        
        <SettingsItem
          title="О приложении"
          subtitle="Версия 1.0.0"
          icon="information-circle-outline"
          onPress={handleAboutPress}
        />
      </Animated.View>

      {/* Компактная кнопка выхода */}
      <Animated.View entering={FadeInDown.duration(500).delay(400)} style={{ 
        marginTop: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : Spacing.l 
      }}>
        <Pressable
          onPress={onLogout}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#DC2626' : '#EF4444',
            borderRadius: isVerySmallScreen ? 10 : isSmallScreen ? 11 : 12,
            padding: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : Spacing.l,
            borderWidth: 1,
            borderColor: pressed ? '#B91C1C' : '#DC2626',
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Ionicons 
            name="log-out-outline" 
            size={isVerySmallScreen ? 16 : isSmallScreen ? 17 : 18} 
            color="white" 
            style={{ marginRight: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s }} 
          />
          <ThemedText style={{ 
            fontSize: isVerySmallScreen ? fontSize.body : isSmallScreen ? 14 : 15,
            color: 'white',
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
        onRequestClose={handleCloseModal}
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
              color: isDarkMode ? '#FFFFFF' : '#1E293B',
            }}>
              🔔 Настройки уведомлений
            </ThemedText>
            <Pressable
              onPress={handleCloseModal}
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

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ 
            padding: Spacing.l 
          }}>
            {/* Общие настройки */}
            <View style={{ marginBottom: Spacing.l }}>
              <ThemedText style={{
                fontSize: 16,
                color: isDarkMode ? '#F1F5F9' : '#374151',
                marginBottom: Spacing.m,
              }}>
                Общие настройки
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
                color: isDarkMode ? '#F1F5F9' : '#374151',
                marginBottom: Spacing.m,
              }}>
                📝 Типы уведомлений
              </ThemedText>

              {[
                { key: 'schedule', title: 'Расписание', subtitle: 'Напоминания о занятиях', icon: 'calendar-outline' as const },
                { key: 'grades', title: 'Оценки', subtitle: 'Новые оценки и результаты', icon: 'school-outline' as const },
                { key: 'news', title: 'Новости', subtitle: 'Университетские новости', icon: 'newspaper-outline' as const },
                { key: 'events', title: 'События', subtitle: 'Мероприятия и события', icon: 'flag-outline' as const },
                { key: 'assignments', title: 'Задания', subtitle: 'Домашние задания', icon: 'clipboard-outline' as const },
              ].map(({ key, title, subtitle, icon }) => (
                <SettingsItem
                  key={key}
                  title={title}
                  subtitle={subtitle}
                  icon={icon}
                  rightComponent={
                    <Switch
                      value={notificationSettings[key as keyof typeof notificationSettings]}
                      onValueChange={(value) => updateNotificationSetting(key as keyof typeof notificationSettings, value)}
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
              ))}
            </View>

            {/* Звуки и вибрация */}
            <View style={{ marginBottom: Spacing.l }}>
              <ThemedText style={{
                fontSize: 16,
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
              onPress={handleSaveNotifications}
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
              }}>
                Сохранить настройки
              </ThemedText>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
});

StudentProfile.displayName = 'StudentProfile';