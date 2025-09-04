import { ThemedText } from '@/components/ThemedText';
import { Colors, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { useAppSelector } from '@/hooks/redux';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';
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
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return '#3B82F6';
      case 'lab':
        return '#10B981';
      case 'seminar':
        return '#F59E0B';
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

  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(index * 100)}
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: Spacing.m,
        marginBottom: Spacing.s,
        borderLeftWidth: 4,
        borderLeftColor: getTypeColor(item.type),
        ...Shadows.card,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xs }}>
        <View style={{ flex: 1 }}>
          <ThemedText
            style={{
              ...Typography.titleH2,
              color: Colors.textPrimary,
              marginBottom: 4,
            }}
          >
            {item.subject}
          </ThemedText>
          <ThemedText
            style={{
              ...Typography.caption,
              color: getTypeColor(item.type),
              backgroundColor: `${getTypeColor(item.type)}20`,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 8,
              alignSelf: 'flex-start',
            }}
          >
            {getTypeLabel(item.type)}
          </ThemedText>
        </View>
        <ThemedText
          style={{
            ...Typography.body,
            color: Colors.brandPrimary,
            fontWeight: '600',
          }}
        >
          {item.time}
        </ThemedText>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.s }}>
        <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
        <ThemedText
          style={{
            ...Typography.caption,
            color: Colors.textSecondary,
            marginLeft: 6,
            flex: 1,
          }}
        >
          {item.teacher}
        </ThemedText>
        
        <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
        <ThemedText
          style={{
            ...Typography.caption,
            color: Colors.textSecondary,
            marginLeft: 6,
          }}
        >
          {item.room}
        </ThemedText>
      </View>
    </Animated.View>
  );
}

export default function ScheduleScreen() {
  const [selectedDay, setSelectedDay] = React.useState<string>('Понедельник');
  const { user } = useAppSelector((state) => state.auth);

  const days: string[] = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  
  // Пустое расписание - данные будут загружаться с сервера через Redux
  const scheduleData: Record<string, ScheduleItem[]> = {
    'Понедельник': [],
    'Вторник': [],
    'Среда': [],
    'Четверг': [],
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
          {getUserGroupInfo()}
        </ThemedText>
      </Animated.View>

      {/* Селектор дней */}
      <Animated.View 
        entering={FadeInDown.duration(500)}
        style={{ paddingHorizontal: Spacing.l, marginBottom: Spacing.l }}
      >
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: Spacing.l }}
        >
          {days.map((day) => (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDay(day)}
              style={{
                backgroundColor: selectedDay === day ? Colors.brandPrimary : Colors.surfaceSubtle,
                paddingHorizontal: Spacing.m,
                paddingVertical: Spacing.s,
                borderRadius: 20,
                marginRight: Spacing.s,
                ...Shadows.card,
              }}
            >
              <ThemedText
                style={{
                  ...Typography.body,
                  color: selectedDay === day ? Colors.surface : Colors.textSecondary,
                  fontSize: 14,
                }}
              >
                {day}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Расписание */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: Spacing.l,
          paddingBottom: 100,
        }}
      >
        {currentSchedule.length > 0 ? (
          currentSchedule.map((item, index) => (
            <ScheduleCard key={index} item={item} index={index} />
          ))
        ) : (
          <Animated.View 
            entering={FadeInDown.duration(500).delay(300)}
            style={{
              backgroundColor: Colors.surfaceSubtle,
              borderRadius: 16,
              padding: Spacing.xl,
              alignItems: 'center',
              marginTop: Spacing.l,
            }}
          >
            <Ionicons name="calendar-outline" size={48} color={Colors.textSecondary} />
            <ThemedText
              style={{
                ...Typography.titleH2,
                color: Colors.textSecondary,
                textAlign: 'center',
                marginTop: Spacing.m,
              }}
            >
              {user?.role === 'admin' ? 'Расписание не настроено' : 'Нет занятий'}
            </ThemedText>
            <ThemedText
              style={{
                ...Typography.body,
                color: Colors.textSecondary,
                textAlign: 'center',
                marginTop: Spacing.s,
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
  );
}
