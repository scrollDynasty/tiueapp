import { ConfirmationModal } from '@/components/ConfirmationModal';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { authApi } from '@/services/api';
import { addEvent, createEvent, fetchEvents } from '@/store/slices/eventsSlice';
import { formatDateYMD } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Категории событий (те же что и у студентов)
const EVENT_CATEGORIES = [
  { key: 'university', label: 'Университет', icon: 'school-outline', color: '#6366F1' },
  { key: 'club', label: 'Клубы', icon: 'people-outline', color: '#8B5CF6' },
  { key: 'conference', label: 'Конференции', icon: 'megaphone-outline', color: '#EF4444' },
  { key: 'social', label: 'Социальные', icon: 'heart-outline', color: '#EC4899' },
  { key: 'sport', label: 'Спорт', icon: 'fitness-outline', color: '#10B981' },
];

export default function EventsManagementScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: events, isLoading } = useAppSelector((state) => state.events);
  
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [category, setCategory] = React.useState('university');

  // Состояния для удаления события
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [eventToDelete, setEventToDelete] = React.useState<{ id: string; title: string } | null>(null);

  // Функция для форматирования даты (дд.мм.гггг)
  const formatDate = (text: string) => {
    // Удаляем все нецифровые символы
    const cleaned = text.replace(/\D/g, '');
    
    // Ограничиваем до 8 цифр
    const limited = cleaned.slice(0, 8);
    
    // Добавляем точки в нужных местах
    if (limited.length >= 3 && limited.length <= 4) {
      return `${limited.slice(0, 2)}.${limited.slice(2)}`;
    } else if (limited.length >= 5) {
      return `${limited.slice(0, 2)}.${limited.slice(2, 4)}.${limited.slice(4)}`;
    } else {
      return limited;
    }
  };

  // Функция для форматирования времени (чч:мм)
  const formatTime = (text: string) => {
    // Удаляем все нецифровые символы
    const cleaned = text.replace(/\D/g, '');
    
    // Ограничиваем до 4 цифр
    const limited = cleaned.slice(0, 4);
    
    // Добавляем двоеточие
    if (limited.length >= 3) {
      return `${limited.slice(0, 2)}:${limited.slice(2)}`;
    } else {
      return limited;
    }
  };

  // Функция для валидации даты
  const validateDate = (dateString: string) => {
    const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    const match = dateString.match(regex);
    
    if (!match) return false;
    
    const [, day, month, year] = match;
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    // Проверяем базовые ограничения
    if (dayNum < 1 || dayNum > 31) return false;
    if (monthNum < 1 || monthNum > 12) return false;
    if (yearNum < 2024 || yearNum > 2030) return false;
    
    // Проверяем валидность даты через объект Date
    const dateObj = new Date(yearNum, monthNum - 1, dayNum);
    return dateObj.getFullYear() === yearNum && 
           dateObj.getMonth() === monthNum - 1 && 
           dateObj.getDate() === dayNum;
  };

  // Функция для валидации времени
  const validateTime = (timeString: string) => {
    const regex = /^(\d{2}):(\d{2})$/;
    const match = timeString.match(regex);
    
    if (!match) return false;
    
    const [, hours, minutes] = match;
    const hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes, 10);
    
    return hoursNum >= 0 && hoursNum <= 23 && minutesNum >= 0 && minutesNum <= 59;
  };

  // Обработчики изменения полей с валидацией
  const handleDateChange = (text: string) => {
    const formatted = formatDate(text);
    setDate(formatted);
  };

  const handleTimeChange = (text: string) => {
    const formatted = formatTime(text);
    setTime(formatted);
  };

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

    // Валидация даты
    if (!validateDate(date.trim())) {
      Alert.alert('Ошибка', 'Введите корректную дату в формате дд.мм.гггг\nПример: 25.12.2024');
      return;
    }

    // Валидация времени
    if (!validateTime(time.trim())) {
      Alert.alert('Ошибка', 'Введите корректное время в формате чч:мм\nПример: 14:30');
      return;
    }

    // Проверка, что дата не в прошлом
    const [day, month, year] = date.split('.');
    const eventDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Сбрасываем время для корректного сравнения дат
    
    if (eventDate < today) {
      Alert.alert('Ошибка', 'Дата события не может быть в прошлом');
      return;
    }

    const newEventData = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      date: date.trim(),
      time: time.trim(),
      category: category as 'university' | 'club' | 'conference' | 'social' | 'sport',
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
      setCategory('university');
      
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
      setCategory('university');
      
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
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ padding: Spacing.l }}
      >
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

          {/* Категория события */}
          <View style={{ marginBottom: Spacing.m }}>
            <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
              Категория события
            </ThemedText>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -4 }}
              contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
            >
              {EVENT_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.key}
                  onPress={() => setCategory(cat.key)}
                  style={{
                    backgroundColor: category === cat.key ? cat.color : Colors.surfaceSubtle,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    minWidth: 120,
                    borderWidth: 1,
                    borderColor: category === cat.key ? cat.color : 'transparent',
                  }}
                >
                  <Ionicons 
                    name={cat.icon as any} 
                    size={18} 
                    color={category === cat.key ? 'white' : Colors.textSecondary} 
                    style={{ marginRight: 8 }}
                  />
                  <ThemedText style={{
                    color: category === cat.key ? 'white' : Colors.textPrimary,
                    fontSize: 14,
                    fontWeight: category === cat.key ? '600' : '400',
                  }}>
                    {cat.label}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Дата и время */}
          <View style={{ flexDirection: 'row', gap: Spacing.m, marginBottom: Spacing.l }}>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
                Дата
              </ThemedText>
              <TextInput
                value={date}
                onChangeText={handleDateChange}
                placeholder="дд.мм.гггг"
                keyboardType="numeric"
                maxLength={10}
                style={{
                  backgroundColor: Colors.surfaceSubtle,
                  borderRadius: 12,
                  padding: Spacing.m,
                  fontSize: 16,
                  color: Colors.textPrimary,
                  borderWidth: date && !validateDate(date) ? 2 : 0,
                  borderColor: date && !validateDate(date) ? '#EF4444' : 'transparent',
                }}
                placeholderTextColor={Colors.textSecondary}
              />
              {/* Подсказка для формата даты */}
              <ThemedText style={{
                fontSize: 12,
                color: date && !validateDate(date) ? '#EF4444' : Colors.textSecondary,
                marginTop: 4,
              }}>
                Формат: дд.мм.гггг (например: 25.12.2024)
              </ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
                Время
              </ThemedText>
              <TextInput
                value={time}
                onChangeText={handleTimeChange}
                placeholder="чч:мм"
                keyboardType="numeric"
                maxLength={5}
                style={{
                  backgroundColor: Colors.surfaceSubtle,
                  borderRadius: 12,
                  padding: Spacing.m,
                  fontSize: 16,
                  color: Colors.textPrimary,
                  borderWidth: time && !validateTime(time) ? 2 : 0,
                  borderColor: time && !validateTime(time) ? '#EF4444' : 'transparent',
                }}
                placeholderTextColor={Colors.textSecondary}
              />
              {/* Подсказка для формата времени */}
              <ThemedText style={{
                fontSize: 12,
                color: time && !validateTime(time) ? '#EF4444' : Colors.textSecondary,
                marginTop: 4,
              }}>
                Формат: чч:мм (например: 14:30)
              </ThemedText>
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
            <View style={{ gap: Spacing.m }}>
              {events.map((item) => {
                const categoryInfo = EVENT_CATEGORIES.find(cat => cat.key === item.category);
                return (
                  <Animated.View
                    key={item.id}
                    entering={FadeInDown.duration(300)}
                    style={{
                      backgroundColor: Colors.surface,
                      borderRadius: 16,
                      padding: 0,
                      overflow: 'hidden',
                      ...Shadows.card,
                      borderWidth: 1,
                      borderColor: Colors.strokeSoft,
                    }}
                  >
                    {/* Верхняя часть с градиентом */}
                    <LinearGradient
                      colors={categoryInfo ? [categoryInfo.color + '15', categoryInfo.color + '08'] : ['#6366F115', '#6366F108']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        padding: Spacing.l,
                        paddingBottom: Spacing.m,
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.s }}>
                        <View style={{ flex: 1, marginRight: Spacing.m }}>
                          <ThemedText style={{ 
                            fontSize: 18, 
                            fontWeight: '700', 
                            color: Colors.textPrimary, 
                            marginBottom: 6 
                          }}>
                            {item.title}
                          </ThemedText>
                          
                          {/* Категория события */}
                          {categoryInfo && (
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: categoryInfo.color + '20',
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 20,
                              alignSelf: 'flex-start',
                              borderWidth: 1,
                              borderColor: categoryInfo.color + '30',
                            }}>
                              <Ionicons 
                                name={categoryInfo.icon as any} 
                                size={14} 
                                color={categoryInfo.color} 
                                style={{ marginRight: 6 }}
                              />
                              <ThemedText style={{
                                fontSize: 13,
                                color: categoryInfo.color,
                                fontWeight: '600',
                              }}>
                                {categoryInfo.label}
                              </ThemedText>
                            </View>
                          )}
                        </View>
                        
                        {/* Кнопка удаления */}
                        <Pressable
                          onPress={() => handleDeleteEvent(item.id, item.title)}
                          style={({ pressed }) => ({
                            backgroundColor: pressed ? '#FEE2E2' : '#FECACA',
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#FCA5A5',
                            opacity: pressed ? 0.8 : 1,
                          })}
                        >
                          <Ionicons name="trash-outline" size={18} color="#DC2626" />
                        </Pressable>
                      </View>
                    </LinearGradient>

                    {/* Основной контент */}
                    <View style={{ padding: Spacing.l, paddingTop: 0 }}>
                      {/* Описание */}
                      <ThemedText style={{ 
                        fontSize: 15, 
                        color: Colors.textSecondary, 
                        lineHeight: 22,
                        marginBottom: Spacing.m 
                      }}>
                        {item.description}
                      </ThemedText>
                      
                      {/* Информационные блоки */}
                      <View style={{ 
                        flexDirection: 'row', 
                        backgroundColor: Colors.surfaceSubtle, 
                        borderRadius: 12, 
                        padding: Spacing.m,
                        gap: Spacing.l
                      }}>
                        {/* Дата и время */}
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <View style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              backgroundColor: '#6366F115',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginRight: 10,
                            }}>
                              <Ionicons name="calendar-outline" size={16} color="#6366F1" />
                            </View>
                            <View>
                              <ThemedText style={{ 
                                fontSize: 13, 
                                color: Colors.textSecondary,
                                fontWeight: '500'
                              }}>
                                Дата и время
                              </ThemedText>
                              <ThemedText style={{ 
                                fontSize: 14, 
                                color: Colors.textPrimary,
                                fontWeight: '600'
                              }}>
                                {formatDateYMD(item.date)}
                              </ThemedText>
                            </View>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              backgroundColor: '#8B5CF615',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginRight: 10,
                            }}>
                              <Ionicons name="time-outline" size={16} color="#8B5CF6" />
                            </View>
                            <View>
                              <ThemedText style={{ 
                                fontSize: 13, 
                                color: Colors.textSecondary,
                                fontWeight: '500'
                              }}>
                                Время
                              </ThemedText>
                              <ThemedText style={{ 
                                fontSize: 14, 
                                color: Colors.textPrimary,
                                fontWeight: '600'
                              }}>
                                {item.time}
                              </ThemedText>
                            </View>
                          </View>
                        </View>
                        
                        {/* Место проведения */}
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              backgroundColor: '#EC489915',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginRight: 10,
                            }}>
                              <Ionicons name="location-outline" size={16} color="#EC4899" />
                            </View>
                            <View style={{ flex: 1 }}>
                              <ThemedText style={{ 
                                fontSize: 13, 
                                color: Colors.textSecondary,
                                fontWeight: '500'
                              }}>
                                Место проведения
                              </ThemedText>
                              <ThemedText 
                                numberOfLines={2}
                                style={{ 
                                  fontSize: 14, 
                                  color: Colors.textPrimary,
                                  fontWeight: '600',
                                }}
                              >
                                {item.location}
                              </ThemedText>
                            </View>
                          </View>
                        </View>
                      </View>
                      
                      {/* Статистика участников */}
                      <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        marginTop: Spacing.m,
                        paddingTop: Spacing.m,
                        borderTopWidth: 1,
                        borderTopColor: Colors.strokeSoft
                      }}>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: '#10B98115',
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 20,
                          marginRight: Spacing.m,
                        }}>
                          <Ionicons name="people-outline" size={14} color="#10B981" style={{ marginRight: 4 }} />
                          <ThemedText style={{ 
                            fontSize: 13, 
                            color: '#10B981',
                            fontWeight: '600'
                          }}>
                            {item.currentParticipants || 0} участников
                          </ThemedText>
                        </View>
                        
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: Colors.chipBg,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 20,
                        }}>
                          <Ionicons name="person-outline" size={14} color={Colors.chipIcon} style={{ marginRight: 4 }} />
                          <ThemedText style={{ 
                            fontSize: 13, 
                            color: Colors.chipIcon,
                            fontWeight: '600'
                          }}>
                            Администратор
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                );
              })}
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
