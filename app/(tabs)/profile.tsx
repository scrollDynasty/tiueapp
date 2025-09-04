import { ThemedText } from '@/components/ThemedText';
import { Colors, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';
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
            fontSize: 16,
            fontWeight: '500',
            color: Colors.textPrimary,
          }}
        >
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText
            style={{
              fontSize: 13,
              color: Colors.textSecondary,
              marginTop: 2,
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

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.l,
          paddingBottom: 100,
        }}
      >
        {/* Профиль пользователя */}
        <Animated.View 
          entering={SlideInRight.duration(400)}
          style={{
            alignItems: 'center',
            paddingVertical: Spacing.xl,
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
            Emily Иванова
          </ThemedText>
          
          <ThemedText
            style={{
              ...Typography.body,
              color: Colors.textSecondary,
              marginBottom: Spacing.s,
            }}
          >
            Группа ИТ-21 • 3 курс
          </ThemedText>

          <View
            style={{
              backgroundColor: Colors.chipBg,
              borderRadius: 12,
              paddingHorizontal: Spacing.m,
              paddingVertical: Spacing.xs,
            }}
          >
            <ThemedText
              style={{
                fontSize: 14,
                color: Colors.brandPrimary,
                fontWeight: '600',
              }}
            >
              Средний балл: 4.2
            </ThemedText>
          </View>
        </Animated.View>

        {/* Академическая информация */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <ThemedText
            style={{
              ...Typography.titleH2,
              color: Colors.textPrimary,
              marginBottom: Spacing.m,
            }}
          >
            Академическая информация
          </ThemedText>

          <SettingsItem
            title="Мои курсы"
            subtitle="6 активных курсов"
            icon="book-outline"
            onPress={() => console.log('Courses pressed')}
          />
          
          <SettingsItem
            title="Оценки и зачёты"
            subtitle="Просмотр успеваемости"
            icon="analytics-outline"
            onPress={() => console.log('Grades pressed')}
          />
          
          <SettingsItem
            title="Расписание"
            subtitle="Занятия и экзамены"
            icon="calendar-outline"
            onPress={() => console.log('Schedule pressed')}
          />
        </Animated.View>

        {/* Настройки */}
        <Animated.View 
          entering={FadeInDown.delay(400)}
          style={{ marginTop: Spacing.l }}
        >
          <ThemedText
            style={{
              ...Typography.titleH2,
              color: Colors.textPrimary,
              marginBottom: Spacing.m,
            }}
          >
            Настройки
          </ThemedText>

          <SettingsItem
            title="Уведомления"
            subtitle="Получать push-уведомления"
            icon="notifications-outline"
            showArrow={false}
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: Colors.strokeSoft,
                  true: Colors.brandPrimary,
                }}
              />
            }
          />
          
          <SettingsItem
            title="Тёмная тема"
            subtitle="Переключить на тёмное оформление"
            icon="moon-outline"
            showArrow={false}
            rightComponent={
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{
                  false: Colors.strokeSoft,
                  true: Colors.brandPrimary,
                }}
              />
            }
          />
          
          <SettingsItem
            title="Язык"
            subtitle="Русский"
            icon="language-outline"
            onPress={() => console.log('Language pressed')}
          />
          
          <SettingsItem
            title="Конфиденциальность"
            subtitle="Управление данными"
            icon="shield-checkmark-outline"
            onPress={() => console.log('Privacy pressed')}
          />
        </Animated.View>

        {/* Поддержка */}
        <Animated.View 
          entering={FadeInDown.delay(600)}
          style={{ marginTop: Spacing.l }}
        >
          <ThemedText
            style={{
              ...Typography.titleH2,
              color: Colors.textPrimary,
              marginBottom: Spacing.m,
            }}
          >
            Поддержка
          </ThemedText>

          <SettingsItem
            title="Справка"
            subtitle="Часто задаваемые вопросы"
            icon="help-circle-outline"
            onPress={() => console.log('Help pressed')}
          />
          
          <SettingsItem
            title="Обратная связь"
            subtitle="Сообщить о проблеме"
            icon="chatbubble-outline"
            onPress={() => console.log('Feedback pressed')}
          />
          
          <SettingsItem
            title="О приложении"
            subtitle="Версия 1.0.0"
            icon="information-circle-outline"
            onPress={() => console.log('About pressed')}
          />
        </Animated.View>

        {/* Выход */}
        <Animated.View 
          entering={FadeInDown.delay(800)}
          style={{ marginTop: Spacing.l }}
        >
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: Spacing.m,
              backgroundColor: '#FEF2F2',
              borderRadius: 16,
              marginBottom: Spacing.s,
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: Spacing.s }} />
            <ThemedText
              style={{
                fontSize: 16,
                fontWeight: '500',
                color: '#EF4444',
              }}
            >
              Выйти из аккаунта
            </ThemedText>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
