import { ConfirmationModal } from '@/components/ConfirmationModal';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSelector } from '@/hooks/redux';
import { authApi } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, TextInput, View } from 'react-native';
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
  const { isDarkMode } = useTheme();
  
  // Цвета в бело-синем стиле
  const colors = {
    background: isDarkMode ? '#1E3A8A' : '#EFF6FF',
    surface: isDarkMode ? '#2563EB' : '#FFFFFF',
    primary: isDarkMode ? '#60A5FA' : '#3B82F6',
    text: isDarkMode ? '#FFFFFF' : '#1E3A8A',
    textSecondary: isDarkMode ? '#E2E8F0' : '#64748B',
    border: isDarkMode ? '#3B82F6' : '#DBEAFE',
    error: '#EF4444',
    success: '#10B981',
  };
  
  const { user } = useAppSelector((state) => state.auth);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('university');
  const [image, setImage] = useState<any>(null);

  // Состояния для удаления события
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string } | null>(null);

  // Загружаем события при открытии страницы
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await authApi.getEvents();
      if (response.success && response.data) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить события');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Функция для форматирования даты (дд.мм.гггг)
  const formatDateInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
    if (match) {
      const [, day, month, year] = match;
      let formatted = day;
      if (month) formatted += `.${month}`;
      if (year) formatted += `.${year}`;
      return formatted;
    }
    return text;
  };

  // Функция для форматирования времени (чч:мм)
  const formatTimeInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,2})$/);
    if (match) {
      const [, hours, minutes] = match;
      let formatted = hours;
      if (minutes) formatted += `:${minutes}`;
      return formatted;
    }
    return text;
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Разрешение требуется', 'Разрешите доступ к фотографиям для загрузки изображений');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0]);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleCreateEvent = async () => {
    if (!title.trim() || !description.trim() || !location.trim() || !date.trim() || !time.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      date: date.trim(),
      time: time.trim(),
      category,
      image: image || undefined,
    };

    try {
      setLoading(true);
      const response = await authApi.createEvent(eventData);
      
      if (response.success) {
        await loadEvents();
        
        // Очищаем форму
        setTitle('');
        setDescription('');
        setLocation('');
        setDate('');
        setTime('');
        setCategory('university');
        setImage(null);
        
        Alert.alert('Успешно', 'Событие создано');
      } else {
        Alert.alert('Ошибка', response.error || 'Не удалось создать событие');
      }
    } catch (error) {
      console.error('Create event error:', error);
      Alert.alert('Ошибка', `Не удалось создать событие: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = (eventId: string, eventTitle: string) => {
    setEventToDelete({ id: eventId, title: eventTitle });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      const response = await authApi.deleteEvent(eventToDelete.id);
      
      if (response.success) {
        await loadEvents();
        Alert.alert('Успешно', 'Событие удалено');
      } else {
        Alert.alert('Ошибка', response.error || 'Не удалось удалить событие');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      Alert.alert('Ошибка', 'Не удалось удалить событие');
    } finally {
      setShowDeleteConfirm(false);
      setEventToDelete(null);
    }
  };

  // Проверяем права доступа
  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Ionicons name="shield-outline" size={64} color={colors.textSecondary} />
          <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: colors.textSecondary, marginTop: 24 }}>
            Доступ запрещен
          </ThemedText>
          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 12,
              marginTop: 24,
            }}
          >
            <ThemedText style={{ fontSize: 16, color: 'white' }}>
              Назад
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={isDarkMode 
        ? ['#1E3A8A', '#2563EB', '#3B82F6']
        : ['#EFF6FF', '#DBEAFE', '#BFDBFE']
      }
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ padding: 16 }}
        >
          {/* Заголовок */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
              <Pressable
                onPress={() => router.back()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.surface,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                }}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </Pressable>
              <ThemedText style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
                Управление событиями
              </ThemedText>
            </View>
          </Animated.View>

          {/* Форма создания события */}
          <Animated.View 
            entering={FadeInDown.duration(500).delay(200)}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            }}
          >
            <ThemedText style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
              Создать событие
            </ThemedText>

            {/* Название */}
            <View style={{ marginBottom: 16 }}>
              <ThemedText style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
                Название
              </ThemedText>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Введите название события"
                style={{
                  backgroundColor: isDarkMode ? '#334155' : '#F8FAFC',
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 16,
                  color: colors.text,
                }}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Описание */}
            <View style={{ marginBottom: 16 }}>
              <ThemedText style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
                Описание
              </ThemedText>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Описание события"
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: isDarkMode ? '#334155' : '#F8FAFC',
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 16,
                  color: colors.text,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Место */}
            <View style={{ marginBottom: 16 }}>
              <ThemedText style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
                Место проведения
              </ThemedText>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Введите место проведения"
                style={{
                  backgroundColor: isDarkMode ? '#334155' : '#F8FAFC',
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 16,
                  color: colors.text,
                }}
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Дата и время */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
                  Дата (дд.мм.гггг)
                </ThemedText>
                <TextInput
                  value={date}
                  onChangeText={(text) => setDate(formatDateInput(text))}
                  placeholder="01.01.2024"
                  keyboardType="numeric"
                  maxLength={10}
                  style={{
                    backgroundColor: isDarkMode ? '#334155' : '#F8FAFC',
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 16,
                    color: colors.text,
                  }}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
                  Время (чч:мм)
                </ThemedText>
                <TextInput
                  value={time}
                  onChangeText={(text) => setTime(formatTimeInput(text))}
                  placeholder="10:00"
                  keyboardType="numeric"
                  maxLength={5}
                  style={{
                    backgroundColor: isDarkMode ? '#334155' : '#F8FAFC',
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 16,
                    color: colors.text,
                  }}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            {/* Категория */}
            <View style={{ marginBottom: 16 }}>
              <ThemedText style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
                Категория
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {EVENT_CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat.key}
                      onPress={() => setCategory(cat.key)}
                      style={{
                        backgroundColor: category === cat.key ? colors.primary : (isDarkMode ? '#334155' : '#F8FAFC'),
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 12,
                        alignItems: 'center',
                        minWidth: 80,
                      }}
                    >
                      <Ionicons 
                        name={cat.icon as any} 
                        size={16} 
                        color={category === cat.key ? 'white' : colors.textSecondary} 
                      />
                      <ThemedText style={{
                        fontSize: 12,
                        color: category === cat.key ? 'white' : colors.textSecondary,
                        marginTop: 4,
                      }}>
                        {cat.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Изображение */}
            <View style={{ marginBottom: 24 }}>
              <ThemedText style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
                Изображение (необязательно)
              </ThemedText>
              
              {image ? (
                <View>
                  <Image
                    source={{ uri: image.uri }}
                    style={{
                      width: '100%',
                      height: 200,
                      borderRadius: 12,
                      marginBottom: 8,
                    }}
                    resizeMode="cover"
                  />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                      onPress={pickImage}
                      style={{
                        flex: 1,
                        backgroundColor: colors.primary,
                        borderRadius: 8,
                        paddingVertical: 8,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="image-outline" size={18} color="white" style={{ marginRight: 6 }} />
                      <ThemedText style={{ color: 'white' }}>
                        Заменить
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={removeImage}
                      style={{
                        backgroundColor: colors.error + '20',
                        borderRadius: 8,
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={pickImage}
                  style={{
                    backgroundColor: isDarkMode ? '#334155' : '#F8FAFC',
                    borderRadius: 12,
                    padding: 24,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: colors.border,
                    borderStyle: 'dashed',
                  }}
                >
                  <Ionicons name="cloud-upload-outline" size={32} color={colors.textSecondary} />
                  <ThemedText style={{ 
                    fontSize: 14,
                    color: colors.textSecondary, 
                    marginTop: 8,
                    textAlign: 'center'
                  }}>
                    Нажмите для выбора изображения
                  </ThemedText>
                  <ThemedText style={{ 
                    fontSize: 12,
                    color: colors.textSecondary, 
                    marginTop: 4,
                    textAlign: 'center'
                  }}>
                    JPG, PNG до 10MB
                  </ThemedText>
                </Pressable>
              )}
            </View>

            {/* Кнопка создания */}
            <Pressable
              onPress={handleCreateEvent}
              disabled={loading}
              style={{
                backgroundColor: loading ? colors.border : colors.primary,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              {loading && (
                <ActivityIndicator 
                  size="small" 
                  color={colors.textSecondary} 
                  style={{ marginRight: 8 }} 
                />
              )}
              <ThemedText style={{ 
                fontSize: 16,
                fontWeight: '600',
                color: loading ? colors.textSecondary : 'white'
              }}>
                {loading ? 'Создаем...' : 'Создать событие'}
              </ThemedText>
            </Pressable>
          </Animated.View>

          {/* Список событий */}
          <Animated.View entering={FadeInDown.duration(500).delay(400)}>
            <ThemedText style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
              Существующие события ({events.length})
            </ThemedText>
            
            {events.length === 0 ? (
              <View style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 24,
                alignItems: 'center',
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}>
                <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
                <ThemedText style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8 }}>
                  События пока не созданы
                </ThemedText>
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                {events.map((event) => (
                  <View
                    key={event.id}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      padding: 16,
                      elevation: 2,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
                        {event.image && (
                          <Image
                            source={{ uri: event.image }}
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: 8,
                              marginRight: 12,
                            }}
                            resizeMode="cover"
                          />
                        )}
                        <View style={{ flex: 1 }}>
                          <ThemedText style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                            {event.title}
                          </ThemedText>
                          <ThemedText style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
                            {event.description}
                          </ThemedText>
                          <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>
                            {event.location}
                          </ThemedText>
                          <ThemedText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                            {formatDate(event.created_at || event.date)} в {event.time}
                          </ThemedText>
                        </View>
                      </View>
                      <Pressable
                        onPress={() => handleDeleteEvent(event.id, event.title)}
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
    </LinearGradient>
  );
}