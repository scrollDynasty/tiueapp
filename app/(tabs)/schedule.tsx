import { ThemedText } from '@/components/ThemedText';
import { getThemeColors } from '@/constants/Colors';
import { Colors, Spacing } from '@/constants/DesignTokens';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSelector } from '@/hooks/redux';
import { useResponsive } from '@/hooks/useResponsive';
import { authApi } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { isSmallScreen, spacing, fontSize, isVerySmallScreen } = useResponsive();
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
        borderRadius: isVerySmallScreen ? 16 : isSmallScreen ? 20 : 24,
        padding: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : Spacing.l,
        marginBottom: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {/* Современный фон карточки */}
      <LinearGradient
        colors={isDarkMode 
          ? [colors.surface, colors.surface]
          : [colors.surface, colors.surface]
        }
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: isVerySmallScreen ? 16 : isSmallScreen ? 20 : 24,
          borderWidth: 1,
          borderColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Время и тип */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m }}>
        <LinearGradient
          colors={[getTypeColor(item.type) + '20', getTypeColor(item.type) + '10']}
          style={{
            paddingHorizontal: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
            paddingVertical: isVerySmallScreen ? 4 : isSmallScreen ? spacing.xs : Spacing.xs,
            borderRadius: isVerySmallScreen ? 12 : isSmallScreen ? 14 : 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: getTypeColor(item.type) + '30',
          }}
        >
          <Ionicons 
            name={getTypeIcon(item.type) as any} 
            size={isVerySmallScreen ? 14 : isSmallScreen ? 15 : 16} 
            color={getTypeColor(item.type)}
            style={{ marginRight: isVerySmallScreen ? 4 : isSmallScreen ? 5 : 6 }}
          />
          <ThemedText
            style={{
              fontSize: isVerySmallScreen ? 10 : isSmallScreen ? 11 : 12,
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
            paddingHorizontal: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
            paddingVertical: isVerySmallScreen ? 4 : isSmallScreen ? spacing.xs : Spacing.xs,
            borderRadius: isVerySmallScreen ? 10 : isSmallScreen ? 11 : 12,
            borderWidth: 1,
            borderColor: colors.primary + '40',
          }}
        >
          <ThemedText
            style={{
              fontSize: isVerySmallScreen ? 12 : isSmallScreen ? 13 : 14,
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
          fontSize: isVerySmallScreen ? 14 : isSmallScreen ? 15 : 16,
          color: colors.text,
          marginBottom: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
          lineHeight: isVerySmallScreen ? 18 : isSmallScreen ? 20 : 22,
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
              width: isVerySmallScreen ? 30 : isSmallScreen ? 33 : 36,
              height: isVerySmallScreen ? 28 : isSmallScreen ? 30 : 32,
              borderRadius: isVerySmallScreen ? 8 : isSmallScreen ? 9 : 10,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
            }}
          >
            <Ionicons name="person-outline" size={isVerySmallScreen ? 14 : isSmallScreen ? 15 : 16} color={isDarkMode ? '#A5B4FC' : '#6366F1'} />
          </LinearGradient>
          <ThemedText
            style={{
              fontSize: isVerySmallScreen ? 12 : isSmallScreen ? 13 : 14,
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
              width: isVerySmallScreen ? 28 : isSmallScreen ? 30 : 32,
              height: isVerySmallScreen ? 28 : isSmallScreen ? 30 : 32,
              borderRadius: isVerySmallScreen ? 8 : isSmallScreen ? 9 : 10,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
            }}
          >
            <Ionicons name="location-outline" size={isVerySmallScreen ? 14 : isSmallScreen ? 15 : 16} color={isDarkMode ? '#10B981' : '#059669'} />
          </LinearGradient>
          <ThemedText
            style={{
              fontSize: isVerySmallScreen ? 12 : isSmallScreen ? 13 : 14,
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
  const insets = useSafeAreaInsets();
  const { isSmallScreen, spacing, isVerySmallScreen, fontSize } = useResponsive();
  const [selectedDay, setSelectedDay] = React.useState<string>('Понедельник');
  const { user } = useAppSelector((state) => state.auth);

  const days: string[] = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  
  // Состояние для расписания
  const [scheduleData, setScheduleData] = React.useState<Record<string, ScheduleItem[]>>({
    'Понедельник': [],
    'Вторник': [],
    'Среда': [],
    'Четверг': [],
    'Пятница': [],
    'Суббота': [],
  });
  const [scheduleLoading, setScheduleLoading] = React.useState(false);

  // Функция для загрузки расписания
  const fetchSchedule = React.useCallback(async () => {
    if (user?.role !== 'student') {
      return;
    }
    
    try {
      if (__DEV__) {
        console.log('📅 Starting to fetch schedule...');
      }
      setScheduleLoading(true);
      
      const response = await authApi.getSchedule();
      
      if (response.success && response.data) {
        const responseData = response.data as any || {};
        const scheduleArray = Array.isArray(responseData.data) ? responseData.data : [];
        
        // Группируем расписание по дням недели
        const groupedSchedule: Record<string, ScheduleItem[]> = {
          'Понедельник': [],
          'Вторник': [],
          'Среда': [],
          'Четверг': [],
          'Пятница': [],
          'Суббота': [],
        };
        
        scheduleArray.forEach((item: any) => {
          const dayName = item.day_name || item.day || 'Понедельник';
          const scheduleItem: ScheduleItem = {
            time: item.time || '00:00-00:00',
            subject: item.subject || item.course_name || 'Неизвестный предмет',
            teacher: item.teacher || item.instructor || 'Преподаватель не указан',
            room: item.room || item.location || 'Аудитория не указана',
            type: (item.type as 'lecture' | 'lab' | 'seminar') || 'lecture'
          };
          
          if (groupedSchedule[dayName]) {
            groupedSchedule[dayName].push(scheduleItem);
          }
        });
        
        setScheduleData(groupedSchedule);
      } else {
        // Если нет данных, оставляем пустое расписание
        setScheduleData({
          'Понедельник': [],
          'Вторник': [],
          'Среда': [],
          'Четверг': [],
          'Пятница': [],
          'Суббота': [],
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error('📅 Error fetching schedule:', error);
      }
      // В случае ошибки устанавливаем пустое расписание
      setScheduleData({
        'Понедельник': [],
        'Вторник': [],
        'Среда': [],
        'Четверг': [],
        'Пятница': [],
        'Суббота': [],
      });
    } finally {
      setScheduleLoading(false);
    }
  }, [user?.role]);

  // Загружаем расписание при монтировании компонента
  React.useEffect(() => {
    if (user) {
      fetchSchedule();
    }
  }, [user, fetchSchedule]);

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
      
      <View style={{ flex: 1 }}>
        {/* Современный заголовок в стиле главной страницы */}
        <Animated.View 
          entering={FadeInUp.duration(600).springify()}
          style={{ 
            paddingTop: insets.top + 10, // Контент заголовка под Dynamic Island + 10px
            marginBottom: spacing.sm,
            paddingHorizontal: Spacing.l,
          }}
        >
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: spacing.md,
            paddingBottom: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
          }}>
            <LinearGradient
              colors={[`${colors.primary}20`, `${colors.primary}10`]}
              style={{
                width: isVerySmallScreen ? 48 : 56,
                height: isVerySmallScreen ? 48 : 56,
                borderRadius: isVerySmallScreen ? 24 : 28,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.md,
                borderWidth: 1,
                borderColor: `${colors.primary}30`,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Ionicons 
                name="calendar" 
                size={isVerySmallScreen ? 24 : 28} 
                color={colors.primary} 
              />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <ThemedText
                style={{
                  fontSize: isVerySmallScreen ? fontSize.title + 2 : fontSize.title + 6,
                  lineHeight: isVerySmallScreen ? 24 : 32,
                  fontWeight: '800',
                  color: colors.text,
                  letterSpacing: 0.5,
                  marginBottom: 4,
                }}
              >
                Расписание
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: fontSize.small,
                  color: colors.textSecondary,
                  fontWeight: '500',
                }}
              >
                {getUserGroupInfo()}
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Современный селектор дней */}
        <Animated.View 
          entering={SlideInDown.delay(200).duration(800).springify()}
          style={{ 
            paddingHorizontal: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : Spacing.l, 
            marginBottom: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : spacing.sm,
            marginTop: 0 
          }}
        >
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: isVerySmallScreen ? spacing.lg : isSmallScreen ? spacing.xl : Spacing.xl }}
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
                    borderRadius: isVerySmallScreen ? 14 : isSmallScreen ? 16 : 18,
                    marginRight: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
                    overflow: 'hidden',
                    shadowColor: selectedDay === day ? colors.primary : colors.primary,
                    shadowOffset: { width: 0, height: selectedDay === day ? 6 : 2 },
                    shadowOpacity: selectedDay === day ? 0.25 : 0.08,
                    shadowRadius: selectedDay === day ? 12 : 6,
                    elevation: selectedDay === day ? 8 : 4,
                  }}
                >
                  <LinearGradient
                    colors={selectedDay === day 
                      ? [colors.primary, colors.primary + 'E6']
                      : [colors.surface, colors.surface]
                    }
                    style={{
                      paddingHorizontal: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : Spacing.l + 2,
                      paddingVertical: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
                      borderRadius: isVerySmallScreen ? 14 : isSmallScreen ? 16 : 18,
                      borderWidth: 1,
                      borderColor: selectedDay === day 
                        ? colors.primary + '40'
                        : isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <ThemedText
                      style={{
                        fontSize: isVerySmallScreen ? 12 : isSmallScreen ? 13 : 14,
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
            paddingHorizontal: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : Spacing.l,
            paddingBottom: isVerySmallScreen ? 130 : isSmallScreen ? 120 : 120, // Увеличиваем отступ для новой высоты табов
            paddingTop: 0, // Убираем лишний отступ
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
      </View>
    </View>
  );
}
