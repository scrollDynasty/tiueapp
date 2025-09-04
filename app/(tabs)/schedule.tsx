import { ThemedText } from '@/components/ThemedText';
import { Colors, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, {
    FadeInDown,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScheduleItemProps {
  time: string;
  subject: string;
  teacher: string;
  room: string;
  type: 'lecture' | 'seminar' | 'lab';
  index: number;
}

function ScheduleItem({ time, subject, teacher, room, type, index }: ScheduleItemProps) {
  const typeColors = {
    lecture: Colors.brandPrimary,
    seminar: '#10B981',
    lab: '#F59E0B',
  };

  const typeIcons = {
    lecture: 'book-outline' as const,
    seminar: 'people-outline' as const,
    lab: 'flask-outline' as const,
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: Colors.surface,
          borderRadius: 16,
          padding: Spacing.m,
          marginBottom: Spacing.s,
          ...Shadows.card,
        }}
      >
        {/* Время */}
        <View
          style={{
            alignItems: 'center',
            marginRight: Spacing.m,
            minWidth: 60,
          }}
        >
          <ThemedText
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: Colors.textPrimary,
            }}
          >
            {time.split('-')[0]}
          </ThemedText>
          <ThemedText
            style={{
              fontSize: 12,
              color: Colors.textSecondary,
            }}
          >
            {time.split('-')[1]}
          </ThemedText>
        </View>

        {/* Индикатор типа */}
        <View
          style={{
            width: 4,
            backgroundColor: typeColors[type],
            borderRadius: 2,
            marginRight: Spacing.m,
          }}
        />

        {/* Контент */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xxs }}>
            <Ionicons 
              name={typeIcons[type]} 
              size={16} 
              color={typeColors[type]} 
              style={{ marginRight: Spacing.xs }}
            />
            <ThemedText
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: Colors.textPrimary,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {subject}
            </ThemedText>
          </View>
          
          <ThemedText
            style={{
              fontSize: 14,
              color: Colors.textSecondary,
              marginBottom: Spacing.xxs,
            }}
          >
            {teacher}
          </ThemedText>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons 
              name="location-outline" 
              size={14} 
              color={Colors.textSecondary} 
              style={{ marginRight: Spacing.xxs }}
            />
            <ThemedText
              style={{
                fontSize: 13,
                color: Colors.textSecondary,
              }}
            >
              {room}
            </ThemedText>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function ScheduleScreen() {
  const [selectedDay, setSelectedDay] = React.useState<keyof typeof scheduleData>('Понедельник');
  
  const days: (keyof typeof scheduleData)[] = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  
  const scheduleData = {
    'Понедельник': [
      {
        time: '09:00-10:30',
        subject: 'Математический анализ',
        teacher: 'Проф. Иванов А.И.',
        room: 'Ауд. 205',
        type: 'lecture' as const,
      },
      {
        time: '10:45-12:15',
        subject: 'Программирование',
        teacher: 'Доц. Петрова М.В.',
        room: 'Комп. класс 1',
        type: 'lab' as const,
      },
      {
        time: '13:00-14:30',
        subject: 'Физика',
        teacher: 'Проф. Сидоров П.П.',
        room: 'Ауд. 301',
        type: 'seminar' as const,
      },
    ],
    'Вторник': [
      {
        time: '09:00-10:30',
        subject: 'Алгоритмы и структуры данных',
        teacher: 'Доц. Козлов В.А.',
        room: 'Ауд. 105',
        type: 'lecture' as const,
      },
      {
        time: '10:45-12:15',
        subject: 'Базы данных',
        teacher: 'Проф. Новикова Е.С.',
        room: 'Комп. класс 2',
        type: 'lab' as const,
      },
    ],
    'Среда': [] as const,
    'Четверг': [] as const,
    'Пятница': [] as const,
    'Суббота': [] as const,
  };

  const currentSchedule = scheduleData[selectedDay];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      {/* Заголовок */}
      <Animated.View 
        entering={SlideInRight.duration(400)}
        style={{ 
          paddingHorizontal: Spacing.l, 
          paddingVertical: Spacing.l,
        }}
      >
        <ThemedText
          style={{
            ...Typography.displayH1,
            color: Colors.textPrimary,
            marginBottom: Spacing.s,
          }}
        >
          Расписание
        </ThemedText>
        <ThemedText
          style={{
            ...Typography.body,
            color: Colors.textSecondary,
          }}
        >
          Занятия на эту неделю
        </ThemedText>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.l,
          paddingBottom: 100,
        }}
      >
        {/* Селектор дней */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingVertical: Spacing.s,
              gap: Spacing.s,
            }}
            style={{ marginBottom: Spacing.l }}
          >
            {days.map((day) => {
              const isSelected = day === selectedDay;
              const animatedScale = useSharedValue(isSelected ? 1 : 0.95);
              
              React.useEffect(() => {
                animatedScale.value = withSpring(isSelected ? 1 : 0.95);
              }, [isSelected, animatedScale]);

              const animatedStyle = useAnimatedStyle(() => ({
                transform: [{ scale: animatedScale.value }],
              }));

              return (
                <Animated.View key={day} style={animatedStyle}>
                  <Pressable
                    onPress={() => setSelectedDay(day)}
                    style={{
                      backgroundColor: isSelected ? Colors.brandPrimary : Colors.surfaceSubtle,
                      borderRadius: 12,
                      paddingHorizontal: Spacing.m,
                      paddingVertical: Spacing.s,
                      marginRight: Spacing.xs,
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: isSelected ? Colors.surface : Colors.textSecondary,
                      }}
                    >
                      {day.slice(0, 3).toUpperCase()}
                    </ThemedText>
                  </Pressable>
                </Animated.View>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Расписание на день */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <ThemedText
            style={{
              ...Typography.titleH2,
              color: Colors.textPrimary,
              marginBottom: Spacing.m,
            }}
          >
            {selectedDay}
          </ThemedText>

          {currentSchedule.length > 0 ? (
            <View>
              {currentSchedule.map((item, index) => (
                <ScheduleItem
                  key={`${item.time}-${item.subject}`}
                  time={item.time}
                  subject={item.subject}
                  teacher={item.teacher}
                  room={item.room}
                  type={item.type}
                  index={index}
                />
              ))}
            </View>
          ) : (
            <Animated.View 
              entering={FadeInDown.delay(600)}
              style={{
                alignItems: 'center',
                padding: Spacing.xl,
                marginTop: Spacing.l,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: Colors.surfaceSubtle,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: Spacing.m,
                }}
              >
                <Ionicons name="calendar-outline" size={40} color={Colors.textSecondary} />
              </View>
              
              <ThemedText
                style={{
                  ...Typography.body,
                  color: Colors.textSecondary,
                  textAlign: 'center',
                }}
              >
                На {selectedDay.toLowerCase()} занятий нет
              </ThemedText>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
