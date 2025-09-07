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
      entering={FadeInUp.duration(700).delay(index * 150).springify()}
      style={{
        backgroundColor: 'transparent',
        borderRadius: 24,
        padding: Spacing.l,
        marginBottom: Spacing.m,
        overflow: 'hidden',
        shadowColor: isDarkMode ? '#000' : '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDarkMode ? 0.4 : 0.12,
        shadowRadius: 20,
        elevation: isDarkMode ? 12 : 8,
      }}
    >
      {/* Градиентный фон карточки */}
      <LinearGradient
        colors={isDarkMode 
          ? ['rgba(30,41,59,0.9)', 'rgba(51,65,85,0.8)', 'rgba(71,85,105,0.7)']
          : ['rgba(255,255,255,0.9)', 'rgba(248,250,252,0.8)', 'rgba(241,245,249,0.7)']
        }
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Время и тип */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.m }}>
        <LinearGradient
          colors={[getTypeColor(item.type) + '20', getTypeColor(item.type) + '10']}
          style={{
            paddingHorizontal: Spacing.s,
            paddingVertical: Spacing.xs,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: getTypeColor(item.type) + '30',
          }}
        >
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
        </LinearGradient>
        
        <LinearGradient
          colors={isDarkMode 
            ? [colors.primary + '30', colors.primary + '20']
            : [colors.primary + '20', colors.primary + '10']
          }
          style={{
            paddingHorizontal: Spacing.s,
            paddingVertical: Spacing.xs,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.primary + '40',
          }}
        >
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
        </LinearGradient>
      </View>

      {/* Предмет */}
      <ThemedText
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
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
          <LinearGradient
            colors={isDarkMode 
              ? ['rgba(99,102,241,0.2)', 'rgba(139,92,246,0.2)']
              : ['rgba(99,102,241,0.1)', 'rgba(139,92,246,0.1)']
            }
            style={{
              width: 36,
              height: 32,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: Spacing.s,
            }}
          >
            <Ionicons name="person-outline" size={16} color={isDarkMode ? '#A5B4FC' : '#6366F1'} />
          </LinearGradient>
          <ThemedText
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: colors.textSecondary,
              flex: 1,
            }}
          >
            {item.teacher}
          </ThemedText>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <LinearGradient
            colors={isDarkMode 
              ? ['rgba(34,197,94,0.2)', 'rgba(16,185,129,0.2)']
              : ['rgba(34,197,94,0.1)', 'rgba(16,185,129,0.1)']
            }
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: Spacing.s,
            }}
          >
            <Ionicons name="location-outline" size={16} color={isDarkMode ? '#10B981' : '#059669'} />
          </LinearGradient>
          <ThemedText
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.text,
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
        colors={isDarkMode 
          ? ['#0F172A', '#1E293B', '#334155']
          : ['#FAFAFA', '#F8FAFC', '#EEF2F7']
        }
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
                color: colors.text,
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
              color={colors.textSecondary} 
              style={{ marginRight: 8 }}
            />
            <ThemedText
              style={{
                fontSize: 16,
                fontWeight: '400',
                color: colors.textSecondary,
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
                    backgroundColor: 'transparent',
                    borderRadius: 18,
                    marginRight: Spacing.s,
                    overflow: 'hidden',
                    shadowColor: selectedDay === day ? colors.primary : (isDarkMode ? '#000' : '#000'),
                    shadowOffset: { width: 0, height: selectedDay === day ? 8 : 4 },
                    shadowOpacity: selectedDay === day ? 0.3 : (isDarkMode ? 0.4 : 0.08),
                    shadowRadius: selectedDay === day ? 16 : 8,
                    elevation: selectedDay === day ? 8 : 4,
                  }}
                >
                  <LinearGradient
                    colors={selectedDay === day 
                      ? [colors.primary, colors.primary + 'DD']
                      : isDarkMode 
                        ? ['rgba(30,41,59,0.8)', 'rgba(51,65,85,0.6)']
                        : ['rgba(255,255,255,0.9)', 'rgba(248,250,252,0.8)']
                    }
                    style={{
                      paddingHorizontal: Spacing.l,
                      paddingVertical: Spacing.s,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: selectedDay === day 
                        ? colors.primary + '40'
                        : isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: selectedDay === day ? colors.surface : colors.text,
                        letterSpacing: -0.1,
                      }}
                    >
                      {day}
                    </ThemedText>
                  </LinearGradient>
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
                backgroundColor: 'transparent',
                borderRadius: 24,
                padding: Spacing.xl,
                alignItems: 'center',
                marginTop: Spacing.l,
                overflow: 'hidden',
                shadowColor: isDarkMode ? '#000' : '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDarkMode ? 0.4 : 0.12,
                shadowRadius: 20,
                elevation: isDarkMode ? 12 : 8,
              }}
            >
              {/* Градиентный фон для пустого состояния */}
              <LinearGradient
                colors={isDarkMode 
                  ? ['rgba(30,41,59,0.8)', 'rgba(51,65,85,0.6)', 'rgba(71,85,105,0.4)']
                  : ['rgba(255,255,255,0.9)', 'rgba(248,250,252,0.8)', 'rgba(241,245,249,0.7)']
                }
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              
              <LinearGradient
                colors={isDarkMode 
                  ? ['rgba(99,102,241,0.2)', 'rgba(139,92,246,0.2)']
                  : ['rgba(99,102,241,0.1)', 'rgba(139,92,246,0.1)']
                }
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: Spacing.l,
                  borderWidth: 1,
                  borderColor: isDarkMode ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)',
                }}
              >
                <Ionicons name="calendar-outline" size={40} color={isDarkMode ? '#A5B4FC' : '#6366F1'} />
              </LinearGradient>
              
              <ThemedText
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: colors.text,
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
                  color: colors.textSecondary,
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
