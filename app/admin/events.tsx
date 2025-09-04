import { ThemedText } from '@/components/ThemedText';
import { Colors, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { addEvent } from '@/store/slices/eventsSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventsManagementScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: events } = useAppSelector((state) => state.events);
  
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');

  // Проверяем права доступа
  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.l }}>
          <Ionicons name="shield-outline" size={64} color={Colors.textSecondary} />
          <ThemedText style={{ ...Typography.titleH2, color: Colors.textSecondary, marginTop: Spacing.l }}>
            Доступ запрещен
          </ThemedText>
          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: Colors.brandPrimary,
              paddingHorizontal: Spacing.l,
              paddingVertical: Spacing.m,
              borderRadius: 12,
              marginTop: Spacing.l,
            }}
          >
            <ThemedText style={{ ...Typography.body, color: Colors.surface }}>
              Назад
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddEvent = () => {
    if (!title.trim() || !description.trim() || !location.trim() || !date.trim() || !time.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    const newEvent = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      date: date.trim(),
      time: time.trim(),
      category: 'university' as const,
      isRegistered: false,
      maxParticipants: undefined,
      currentParticipants: 0,
      image: undefined,
    };

    dispatch(addEvent(newEvent));
    
    // Очищаем форму
    setTitle('');
    setDescription('');
    setLocation('');
    setDate('');
    setTime('');
    
    Alert.alert('Успешно', 'Событие добавлено');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceSubtle }}>
      <ScrollView contentContainerStyle={{ padding: Spacing.l }}>
        {/* Заголовок */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.l }}>
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: Colors.surface,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: Spacing.m,
                ...Shadows.card,
              }}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
            </Pressable>
            <ThemedText style={{ ...Typography.displayH1, color: Colors.textPrimary }}>
              Управление событиями
            </ThemedText>
          </View>
        </Animated.View>

        {/* Форма добавления события */}
        <Animated.View 
          entering={FadeInDown.duration(500).delay(200)}
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 16,
            padding: Spacing.l,
            marginBottom: Spacing.l,
            ...Shadows.card,
          }}
        >
          <ThemedText style={{ ...Typography.titleH2, color: Colors.textPrimary, marginBottom: Spacing.m }}>
            Добавить событие
          </ThemedText>

          {/* Название */}
          <View style={{ marginBottom: Spacing.m }}>
            <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
              Название события
            </ThemedText>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Введите название события"
              style={{
                backgroundColor: Colors.surfaceSubtle,
                borderRadius: 12,
                padding: Spacing.m,
                fontSize: 16,
                color: Colors.textPrimary,
              }}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          {/* Описание */}
          <View style={{ marginBottom: Spacing.m }}>
            <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
              Описание
            </ThemedText>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Описание события"
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: Colors.surfaceSubtle,
                borderRadius: 12,
                padding: Spacing.m,
                fontSize: 16,
                color: Colors.textPrimary,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          {/* Место */}
          <View style={{ marginBottom: Spacing.m }}>
            <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
              Место проведения
            </ThemedText>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Например: Актовый зал, Ауд. 101"
              style={{
                backgroundColor: Colors.surfaceSubtle,
                borderRadius: 12,
                padding: Spacing.m,
                fontSize: 16,
                color: Colors.textPrimary,
              }}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          {/* Дата и время */}
          <View style={{ flexDirection: 'row', gap: Spacing.m, marginBottom: Spacing.l }}>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
                Дата
              </ThemedText>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="дд.мм.гггг"
                style={{
                  backgroundColor: Colors.surfaceSubtle,
                  borderRadius: 12,
                  padding: Spacing.m,
                  fontSize: 16,
                  color: Colors.textPrimary,
                }}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
                Время
              </ThemedText>
              <TextInput
                value={time}
                onChangeText={setTime}
                placeholder="чч:мм"
                style={{
                  backgroundColor: Colors.surfaceSubtle,
                  borderRadius: 12,
                  padding: Spacing.m,
                  fontSize: 16,
                  color: Colors.textPrimary,
                }}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          {/* Кнопка добавления */}
          <Pressable
            onPress={handleAddEvent}
            style={{
              backgroundColor: Colors.brandPrimary,
              paddingVertical: Spacing.m,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <ThemedText style={{ ...Typography.body, color: Colors.surface, fontWeight: '600' }}>
              Добавить событие
            </ThemedText>
          </Pressable>
        </Animated.View>

        {/* Список событий */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <ThemedText style={{ ...Typography.titleH2, color: Colors.textPrimary, marginBottom: Spacing.m }}>
            Существующие события ({events.length})
          </ThemedText>
          
          {events.length === 0 ? (
            <View style={{
              backgroundColor: Colors.surface,
              borderRadius: 16,
              padding: Spacing.l,
              alignItems: 'center',
              ...Shadows.card,
            }}>
              <Ionicons name="calendar-outline" size={48} color={Colors.textSecondary} />
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.s }}>
                События пока не созданы
              </ThemedText>
            </View>
          ) : (
            <View style={{ gap: Spacing.s }}>
              {events.map((item) => (
                <View
                  key={item.id}
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 12,
                    padding: Spacing.m,
                    ...Shadows.card,
                  }}
                >
                  <ThemedText style={{ ...Typography.body, color: Colors.textPrimary, marginBottom: 4, fontWeight: '600' }}>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={{ ...Typography.caption, color: Colors.textSecondary, marginBottom: 8 }}>
                    {item.description}
                  </ThemedText>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                    <ThemedText style={{ ...Typography.caption, color: Colors.textSecondary, marginLeft: 4 }}>
                      {item.location}
                    </ThemedText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                    <ThemedText style={{ ...Typography.caption, color: Colors.textSecondary, marginLeft: 4 }}>
                      {item.date} в {item.time}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
