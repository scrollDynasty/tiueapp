import { ThemedText } from '@/components/ThemedText';
import { getThemeColors } from '@/constants/Colors';
import { Colors, Spacing } from '@/constants/DesignTokens';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSelector } from '@/hooks/redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScheduleItem {
  time: string;
  subject: string;
  teacher: string;
  room: string;
  type: 'lecture' | 'lab' | 'seminar';
}

interface ScheduleCardProps {
  item: ScheduleItem;
  index: number;
}

function ScheduleCard({ item, index }: ScheduleCardProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return '#6366F1';
      case 'lab':
        return '#10B981';
      case 'seminar':
        return '#EC4899';
      default:
        return Colors.brandPrimary;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'Лекция';
      case 'lab':
        return 'Практика';
      case 'seminar':
        return 'Семинар';
      default:
        return 'Занятие';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'book-outline';
      case 'lab':
        return 'flask-outline';
      case 'seminar':
        return 'people-outline';
      default:
        return 'school-outline';
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(600).delay(index * 100).springify()}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: Spacing.l,
        marginBottom: Spacing.m,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Время и тип */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.m }}>
        <View style={{
          backgroundColor: getTypeColor(item.type) + '15',
          paddingHorizontal: Spacing.s,
          paddingVertical: Spacing.xs,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Ionicons 
            name={getTypeIcon(item.type) as any} 
            size={16} 
            color={getTypeColor(item.type)}
            style={{ marginRight: 6 }}
          />
          <ThemedText
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: getTypeColor(item.type),
              letterSpacing: 0.5,
            }}
          >
            {getTypeLabel(item.type)}
          </ThemedText>
        </View>
        
        <View style={{
          backgroundColor: colors.primary + '15',
          paddingHorizontal: Spacing.s,
          paddingVertical: Spacing.xs,
          borderRadius: 10,
        }}>
          <ThemedText
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: colors.primary,
              letterSpacing: -0.2,
            }}
          >
            {item.time}
          </ThemedText>
        </View>
      </View>

      {/* Предмет */}
      <ThemedText
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: Colors.textPrimary,
          marginBottom: Spacing.s,
          lineHeight: 24,
          letterSpacing: -0.3,
        }}
      >
        {item.subject}
      </ThemedText>

      {/* Преподаватель и аудитория */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: Colors.surfaceSubtle,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: Spacing.s,
          }}>
            <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
          </View>
          <ThemedText
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: Colors.textSecondary,
              flex: 1,
            }}
          >
            {item.teacher}
          </ThemedText>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: Colors.surfaceSubtle,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: Spacing.s,
          }}>
            <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
          </View>
          <ThemedText
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: Colors.textPrimary,
            }}
          >
            {item.room}
          </ThemedText>
        </View>
      </View>
    </Animated.View>
  );
}

export default function ScheduleScreen() {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const [selectedDay, setSelectedDay] = React.useState<string>('Понедельник');
  const { user } = useAppSelector((state) => state.auth);

  const days: string[] = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  
  // Тестовые данные для демонстрации дизайна
  const scheduleData: Record<string, ScheduleItem[]> = {
    'Понедельник': [
      {
        time: '9:00-10:30',
        subject: 'Математический анализ',
        teacher: 'Иванов И.И.',
        room: 'Ауд. 205',
        type: 'lecture'
      },
      {
        time: '10:45-12:15',
        subject: 'Программирование',
        teacher: 'Петров П.П.',
        room: 'Комп. класс 1',
        type: 'lab'
      },
      {
        time: '13:00-14:30',
        subject: 'Физика',
        teacher: 'Сидоров С.С.',
        room: 'Ауд. 312',
        type: 'seminar'
      }
    ],
    'Вторник': [
      {
        time: '9:00-10:30',
        subject: 'Алгебра',
        teacher: 'Козлов К.К.',
        room: 'Ауд. 201',
        type: 'lecture'
      }
    ],
    'Среда': [],
    'Четверг': [
      {
        time: '10:45-12:15',
        subject: 'База данных',
        teacher: 'Морозов М.М.',
        room: 'Комп. класс 2',
        type: 'lab'
      }
    ],
    'Пятница': [],
    'Суббота': [],
  };

  const currentSchedule = scheduleData[selectedDay] || [];

  // Получаем информацию о группе пользователя
  const getUserGroupInfo = () => {
    if (!user) return 'Расписание занятий';
    
    if (user.role === 'admin') {
      return 'Управление расписанием';
    } else if (user.role === 'professor') {
      return `Расписание преподавателя ${user.first_name} ${user.last_name}`.trim();
    } else if (user.student?.group?.name) {
      return `Группа ${user.student.group.name}`;
    }
    
    return 'Ваше расписание занятий';
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Градиентный фон */}
      <LinearGradient
        colors={isDarkMode ? [colors.background, colors.backgroundSecondary] : ['#FAFAFA', '#F8FAFC', '#EEF2F7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        {/* Современный заголовок */}
        <Animated.View 
          entering={FadeInUp.duration(600).springify()}
          style={{ 
            paddingHorizontal: Spacing.l, 
            paddingVertical: Spacing.l,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.s }}>
            <View style={{
              width: 4,
              height: 32,
              backgroundColor: colors.primary,
              borderRadius: 2,
              marginRight: Spacing.s
            }} />
            <ThemedText
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: Colors.textPrimary,
                letterSpacing: -0.5,
              }}
            >
              Расписание
            </ThemedText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: Spacing.l }}>
            <Ionicons 
              name={user?.role === 'admin' ? 'settings-outline' : user?.role === 'professor' ? 'person-outline' : 'school-outline'} 
              size={16} 
              color={Colors.textSecondary} 
              style={{ marginRight: 8 }}
            />
            <ThemedText
              style={{
                fontSize: 16,
                fontWeight: '400',
                color: Colors.textSecondary,
                lineHeight: 24,
              }}
            >
              {getUserGroupInfo()}
            </ThemedText>
          </View>
        </Animated.View>

        {/* Современный селектор дней */}
        <Animated.View 
          entering={SlideInDown.delay(200).duration(800).springify()}
          style={{ paddingHorizontal: Spacing.l, marginBottom: Spacing.l }}
        >
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: Spacing.l }}
          >
            {days.map((day, index) => (
              <Animated.View
                key={day}
                entering={FadeInUp.delay(300 + index * 50).duration(500)}
              >
                <TouchableOpacity
                  onPress={() => setSelectedDay(day)}
                  style={{
                    backgroundColor: selectedDay === day ? Colors.brandPrimary : Colors.surface,
                    paddingHorizontal: Spacing.l,
                    paddingVertical: Spacing.s,
                    borderRadius: 16,
                    marginRight: Spacing.s,
                    shadowColor: selectedDay === day ? Colors.brandPrimary : '#000',
                    shadowOffset: { width: 0, height: selectedDay === day ? 4 : 2 },
                    shadowOpacity: selectedDay === day ? 0.15 : 0.05,
                    shadowRadius: selectedDay === day ? 12 : 8,
                    elevation: selectedDay === day ? 6 : 2,
                    borderWidth: 1,
                    borderColor: selectedDay === day ? Colors.brandPrimary : 'rgba(0,0,0,0.04)',
                  }}
                >
                  <ThemedText
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: selectedDay === day ? Colors.surface : Colors.textPrimary,
                      letterSpacing: -0.1,
                    }}
                  >
                    {day}
                  </ThemedText>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Расписание */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: Spacing.l,
            paddingBottom: 120,
          }}
        >
          {currentSchedule.length > 0 ? (
            currentSchedule.map((item, index) => (
              <ScheduleCard key={index} item={item} index={index} />
            ))
          ) : (
            <Animated.View 
              entering={FadeInDown.duration(800).delay(600)}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 20,
                padding: Spacing.xl,
                alignItems: 'center',
                marginTop: Spacing.l,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 16,
                elevation: 4,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.04)',
              }}
            >
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 20,
                backgroundColor: Colors.surfaceSubtle,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Spacing.l,
              }}>
                <Ionicons name="calendar-outline" size={32} color={Colors.textSecondary} />
              </View>
              <ThemedText
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: Colors.textPrimary,
                  textAlign: 'center',
                  marginBottom: Spacing.s,
                  letterSpacing: -0.3,
                }}
              >
                {user?.role === 'admin' ? 'Расписание не настроено' : 'Нет занятий'}
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 16,
                  fontWeight: '400',
                  color: Colors.textSecondary,
                  textAlign: 'center',
                  lineHeight: 24,
                  maxWidth: 280,
                }}
              >
                {user?.role === 'admin' 
                  ? 'Используйте панель администратора для создания расписания'
                  : 'В этот день у вас нет запланированных занятий'
                }
              </ThemedText>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
