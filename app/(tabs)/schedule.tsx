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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 }}>
        <ThemedText style={[{ fontSize: 24, fontWeight: 'bold', color: colors.text }]}>Расписание</ThemedText>
        <TouchableOpacity style={[{ backgroundColor: colors.surfaceSecondary, padding: 8, borderRadius: 8 }]}>
          <Ionicons name="search" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Day Selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: 20, paddingVertical: 16 }}
        contentContainerStyle={{ gap: 12, alignItems: 'center' }}
      >
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              {
                padding: 12,
                borderRadius: 20,
                backgroundColor: selectedDay === day ? colors.primary : colors.surfaceSecondary,
              }
            ]}
            onPress={() => dispatch(setSelectedDay(day))}
          >
            <ThemedText
              style={[
                {
                  fontSize: 14,
                  fontWeight: selectedDay === day ? '600' : '400',
                  color: selectedDay === day ? '#fff' : colors.text,
                }
              ]}
            >
              {day.slice(0, 3)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Schedule List */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      >
        <View style={{ paddingHorizontal: 20 }}>
          <ThemedText style={[{ fontSize: 18, fontWeight: '600', marginBottom: 16 }, { color: colors.text }]}>
            {selectedDay}
          </ThemedText>
          
          {todaySchedule.length > 0 ? (
            todaySchedule.map((item, index) => (
              <View key={item.id} style={[
                {
                  backgroundColor: colors.surface,
                  borderLeftColor: item.color,
                  borderLeftWidth: 4,
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }
              ]}>
                <ThemedText style={[{ fontSize: 12, fontWeight: '600', color: colors.primary }]}>
                  {item.time}
                </ThemedText>
                <ThemedText style={[{ fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 4 }]}>
                  {item.subject}
                </ThemedText>
                <ThemedText style={[{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }]}>
                  {item.room}, {item.building}
                </ThemedText>
                <ThemedText style={[{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }]}>
                  {item.teacher}
                </ThemedText>
              </View>
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
              <ThemedText style={[{ fontSize: 16, color: colors.textSecondary, marginTop: 16, textAlign: 'center' }]}>
                На сегодня занятий нет
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
