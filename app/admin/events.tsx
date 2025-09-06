import { ConfirmationModal } from '@/components/ConfirmationModal';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { authApi } from '@/services/api';
import { addEvent, createEvent, fetchEvents } from '@/store/slices/eventsSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventsManagementScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: events, isLoading } = useAppSelector((state) => state.events);
  
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');

  // Состояния для удаления события
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [eventToDelete, setEventToDelete] = React.useState<{ id: string; title: string } | null>(null);

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

  const handleAddEvent = async () => {
    if (!title.trim() || !description.trim() || !location.trim() || !date.trim() || !time.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    const newEventData = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      date: date.trim(),
      time: time.trim(),
      category: 'university' as const,
      max_participants: undefined,
    };

    try {
      // Сначала пытаемся сохранить через API
      await dispatch(createEvent(newEventData)).unwrap();
      
      // Перезагружаем список событий
      dispatch(fetchEvents());
      
      // Очищаем форму
      setTitle('');
      setDescription('');
      setLocation('');
      setDate('');
      setTime('');
      
      Alert.alert('Успешно', 'Событие добавлено и сохранено в базе данных');
    } catch (error) {
      console.error('API Error:', error);
      
      // Если API не работает, сохраняем локально
      const fallbackEvent = {
        id: Date.now().toString(),
        ...newEventData,
        isRegistered: false,
        currentParticipants: 0,
      };
      
      dispatch(addEvent(fallbackEvent));
      
      // Очищаем форму
      setTitle('');
      setDescription('');
      setLocation('');
      setDate('');
      setTime('');
      
      Alert.alert('Внимание', 'Событие добавлено локально. Проверьте подключение к серверу для синхронизации с базой данных.');
    }
  };

  // Функция удаления события
  const handleDeleteEvent = (eventId: string, eventTitle: string) => {
    setEventToDelete({ id: eventId, title: eventTitle });
    setShowDeleteConfirm(true);
  };

  // Подтверждение удаления события
  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      // API вызов для удаления события
      const response = await authApi.deleteEvent(eventToDelete.id);
      
      // Закрываем модальное окно
      setShowDeleteConfirm(false);
      setEventToDelete(null);
      
      // Обновляем список событий
      dispatch(fetchEvents());
      
      // Показываем уведомление об успешном удалении
      Alert.alert('Успешно', 'Событие удалено');
      
    } catch (error) {
      console.error('Error deleting event:', error);
      // Закрываем модальное окно даже при ошибке
      setShowDeleteConfirm(false);
      setEventToDelete(null);
      Alert.alert('Ошибка', 'Не удалось удалить событие');
    }
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
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? Colors.strokeSoft : Colors.brandPrimary,
              paddingVertical: Spacing.m,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            {isLoading && (
              <ActivityIndicator 
                size="small" 
                color={Colors.textSecondary} 
                style={{ marginRight: Spacing.s }} 
              />
            )}
            <ThemedText style={{ 
              ...Typography.body, 
              color: isLoading ? Colors.textSecondary : Colors.surface, 
              fontWeight: '600' 
            }}>
              {isLoading ? 'Добавляем...' : 'Добавить событие'}
            </ThemedText>
          </Pressable>
        </Animated.View>

        {/* Список событий */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <ThemedText style={{ ...Typography.titleH2, color: Colors.textPrimary, marginBottom: Spacing.m }}>
            Существующие события ({Array.isArray(events) ? events.length : 0})
          </ThemedText>
          
          {!Array.isArray(events) || events.length === 0 ? (
            <View style={{
              backgroundColor: Colors.surface,
              borderRadius: 12,
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
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={{ ...Typography.body, color: Colors.textPrimary, marginBottom: 4, fontWeight: '600' }}>
                        {item.title}
                      </ThemedText>
                    </View>
                    <Pressable
                      onPress={() => handleDeleteEvent(item.id, item.title)}
                      style={{
                        backgroundColor: '#FEE2E2',
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: 8,
                      }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    </Pressable>
                  </View>
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

      {/* Модальное окно подтверждения удаления */}
      <ConfirmationModal
        isVisible={showDeleteConfirm}
        title="Удалить событие?"
        message={
          eventToDelete 
            ? `Вы уверены, что хотите удалить событие "${eventToDelete.title}"?\n\nЭто действие нельзя отменить!`
            : ''
        }
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={confirmDeleteEvent}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setEventToDelete(null);
        }}
        isDangerous={true}
      />
    </SafeAreaView>
  );
}
