import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useAppDispatch } from '@/hooks/redux';
import { useColorScheme } from '@/hooks/useColorScheme';
import { setSelectedDay } from '@/store/slices/scheduleSlice';
import { scheduleStyles } from '@/styles/screens/schedule';
import { selectScheduleItems, selectSelectedDay } from '@/types/redux';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

export default function ScheduleScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const dispatch = useAppDispatch();
  
  const schedule = useSelector(selectScheduleItems);
  const selectedDay = useSelector(selectSelectedDay);
  
  const todaySchedule = schedule.filter(item => item.day === selectedDay);

  return (
    <SafeAreaView style={[scheduleStyles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={scheduleStyles.header}>
        <ThemedText style={[scheduleStyles.title, { color: colors.text }]}>Расписание</ThemedText>
        <TouchableOpacity style={[{ backgroundColor: colors.surfaceSecondary, padding: 8, borderRadius: 8 }]}>
          <Ionicons name="search" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Day Selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={scheduleStyles.weekSelector}
      >
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              scheduleStyles.weekButton,
              {
                backgroundColor: selectedDay === day ? colors.primary : colors.surfaceSecondary,
              }
            ]}
            onPress={() => dispatch(setSelectedDay(day))}
          >
            <ThemedText
              style={[
                scheduleStyles.weekButtonText,
                {
                  color: selectedDay === day ? '#fff' : colors.text,
                  fontWeight: selectedDay === day ? '600' : '400',
                }
              ]}
            >
              {day.slice(0, 3)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Schedule List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20 }}>
          <ThemedText style={[{ fontSize: 18, fontWeight: '600', marginBottom: 16 }, { color: colors.text }]}>
            {selectedDay}
          </ThemedText>
          
          {todaySchedule.length > 0 ? (
            todaySchedule.map((item, index) => (
              <View key={item.id} style={[scheduleStyles.classCard, { backgroundColor: colors.surface, borderLeftColor: item.color }]}>
                <ThemedText style={[scheduleStyles.classTime, { color: colors.primary }]}>
                  {item.time}
                </ThemedText>
                <ThemedText style={[scheduleStyles.classSubject, { color: colors.text }]}>
                  {item.subject}
                </ThemedText>
                <ThemedText style={[scheduleStyles.classDetails, { color: colors.textSecondary }]}>
                  {item.room}, {item.building}
                </ThemedText>
                <ThemedText style={[scheduleStyles.classTeacher, { color: colors.textSecondary }]}>
                  {item.teacher}
                </ThemedText>
              </View>
            ))
          ) : (
            <View style={scheduleStyles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
              <ThemedText style={[scheduleStyles.emptyText, { color: colors.textSecondary }]}>
                На сегодня занятий нет
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
