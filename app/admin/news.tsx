import { ConfirmationModal } from '@/components/ConfirmationModal';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { authApi } from '@/services/api';
import { fetchEvents } from '@/store/slices/eventsSlice';
import { addNews, createNews, fetchNews } from '@/store/slices/newsSlice';
import { News } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewsManagementScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: news, isLoading } = useAppSelector((state) => state.news);
  const { items: events } = useAppSelector((state) => state.events);
  
  const [title, setTitle] = React.useState('');
  const [subtitle, setSubtitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [selectedEventIds, setSelectedEventIds] = React.useState<number[]>([]);
  const [selectedIcon, setSelectedIcon] = React.useState<'school-outline' | 'trophy-outline' | 'people-outline' | 'megaphone-outline' | 'calendar-outline'>('megaphone-outline');

  // Состояния для удаления новости
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [newsToDelete, setNewsToDelete] = React.useState<{ id: string; title: string } | null>(null);

  // Загружаем новости и события при открытии страницы
  React.useEffect(() => {
    dispatch(fetchNews());
    dispatch(fetchEvents());
  }, [dispatch]);

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

  const iconOptions = [
    { value: 'megaphone-outline', label: 'Объявление' },
    { value: 'school-outline', label: 'Учеба' },
    { value: 'trophy-outline', label: 'Достижения' },
    { value: 'people-outline', label: 'События' },
    { value: 'calendar-outline', label: 'Календарь' },
  ] as const;

  const handleAddNews = async () => {
    if (!title.trim() || !subtitle.trim() || !content.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    const newNewsData = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      content: content.trim(),
      category: 'announcement' as const,
      icon: selectedIcon,
      is_important: false,
      image: imageUrl.trim() || undefined,
    };

    try {
      // Сначала пытаемся сохранить через API
      await dispatch(createNews(newNewsData)).unwrap();
      
      // Перезагружаем список новостей
      dispatch(fetchNews());
      
      // Очищаем форму
      setTitle('');
      setSubtitle('');
      setContent('');
      setImageUrl('');
      setSelectedEventIds([]);
      setSelectedIcon('megaphone-outline');
      
      Alert.alert('Успешно', 'Новость добавлена и сохранена в базе данных');
    } catch (error) {
      console.error('API Error:', error);
      
      // Если API не работает, сохраняем локально
      const fallbackNews: News = {
        id: Date.now().toString(),
        title: title.trim(),
        subtitle: subtitle.trim(),
        content: content.trim(),
        category: 'announcement' as const,
        icon: selectedIcon,
        image: imageUrl.trim() || undefined,
        author: `${user.first_name} ${user.last_name}`.trim() || user.username,
        date: 'только что',
        isImportant: false,
      };
      
      dispatch(addNews(fallbackNews));
      
      // Очищаем форму
      setTitle('');
      setSubtitle('');
      setContent('');
      setImageUrl('');
      setSelectedEventIds([]);
      setSelectedIcon('megaphone-outline');
      
      Alert.alert('Внимание', 'Новость добавлена локально. Проверьте подключение к серверу для синхронизации с базой данных.');
    }
  };

  // Функция удаления новости
  const handleDeleteNews = (newsId: string, newsTitle: string) => {
    setNewsToDelete({ id: newsId, title: newsTitle });
    setShowDeleteConfirm(true);
  };

  // Подтверждение удаления новости
  const confirmDeleteNews = async () => {
    if (!newsToDelete) return;

    try {
      // API вызов для удаления новости
      const response = await authApi.deleteNews(newsToDelete.id);
      
      // Закрываем модальное окно
      setShowDeleteConfirm(false);
      setNewsToDelete(null);
      
      // Обновляем список новостей
      dispatch(fetchNews());
      
      // Показываем уведомление об успешном удалении
      Alert.alert('Успешно', 'Новость удалена');
      
    } catch (error) {
      console.error('Error deleting news:', error);
      // Закрываем модальное окно даже при ошибке
      setShowDeleteConfirm(false);
      setNewsToDelete(null);
      Alert.alert('Ошибка', 'Не удалось удалить новость');
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
              Управление новостями
            </ThemedText>
          </View>
        </Animated.View>

        {/* Форма добавления новости */}
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
            Добавить новость
          </ThemedText>

          {/* Заголовок */}
          <View style={{ marginBottom: Spacing.m }}>
            <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
              Заголовок
            </ThemedText>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Введите заголовок новости"
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

          {/* Подзаголовок */}
          <View style={{ marginBottom: Spacing.m }}>
            <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
              Краткое описание
            </ThemedText>
            <TextInput
              value={subtitle}
              onChangeText={setSubtitle}
              placeholder="Краткое описание новости"
              multiline
              numberOfLines={2}
              style={{
                backgroundColor: Colors.surfaceSubtle,
                borderRadius: 12,
                padding: Spacing.m,
                fontSize: 16,
                color: Colors.textPrimary,
                minHeight: 60,
              }}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          {/* Контент */}
          <View style={{ marginBottom: Spacing.m }}>
            <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
              Полный текст
            </ThemedText>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Полный текст новости"
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: Colors.surfaceSubtle,
                borderRadius: 12,
                padding: Spacing.m,
                fontSize: 16,
                color: Colors.textPrimary,
                minHeight: 100,
                textAlignVertical: 'top',
              }}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          {/* URL изображения */}
          <View style={{ marginBottom: Spacing.l }}>
            <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
              URL изображения (необязательно)
            </ThemedText>
            <TextInput
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://example.com/image.jpg"
              style={{
                backgroundColor: Colors.surfaceSubtle,
                borderRadius: 12,
                padding: Spacing.m,
                fontSize: 16,
                color: Colors.textPrimary,
              }}
              placeholderTextColor={Colors.textSecondary}
            />
            {imageUrl.trim() && (
              <View style={{ marginTop: Spacing.s }}>
                <ThemedText style={{ ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.xs }}>
                  Предварительный просмотр:
                </ThemedText>
                <Image
                  source={{ uri: imageUrl }}
                  style={{
                    width: '100%',
                    height: 150,
                    borderRadius: 8,
                    backgroundColor: Colors.surfaceSubtle,
                  }}
                  resizeMode="cover"
                  onError={() => {
                    Alert.alert('Ошибка', 'Не удалось загрузить изображение по указанному URL');
                  }}
                />
              </View>
            )}
          </View>

          {/* Выбор иконки */}
          <View style={{ marginBottom: Spacing.l }}>
            <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
              Иконка
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: Spacing.s }}>
                {iconOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => setSelectedIcon(option.value)}
                    style={{
                      backgroundColor: selectedIcon === option.value ? Colors.brandPrimary : Colors.surfaceSubtle,
                      paddingHorizontal: Spacing.m,
                      paddingVertical: Spacing.s,
                      borderRadius: 12,
                      alignItems: 'center',
                      minWidth: 80,
                    }}
                  >
                    <Ionicons 
                      name={option.value} 
                      size={20} 
                      color={selectedIcon === option.value ? Colors.surface : Colors.textSecondary} 
                    />
                    <ThemedText style={{
                      ...Typography.caption,
                      color: selectedIcon === option.value ? Colors.surface : Colors.textSecondary,
                      marginTop: 4,
                    }}>
                      {option.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Кнопка добавления */}
          <Pressable
            onPress={handleAddNews}
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
              {isLoading ? 'Добавляем...' : 'Добавить новость'}
            </ThemedText>
          </Pressable>
        </Animated.View>

        {/* Список новостей */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <ThemedText style={{ ...Typography.titleH2, color: Colors.textPrimary, marginBottom: Spacing.m }}>
            Существующие новости ({Array.isArray(news) ? news.length : 0})
          </ThemedText>
          
          {!Array.isArray(news) || news.length === 0 ? (
            <View style={{
              backgroundColor: Colors.surface,
              borderRadius: 12,
              padding: Spacing.l,
              alignItems: 'center',
              ...Shadows.card,
            }}>
              <Ionicons name="newspaper-outline" size={48} color={Colors.textSecondary} />
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.s }}>
                Новости пока не созданы
              </ThemedText>
            </View>
          ) : (
            <View style={{ gap: Spacing.s }}>
              {news.map((item) => (
                <View
                  key={item.id}
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 12,
                    padding: Spacing.m,
                    ...Shadows.card,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
                      <View style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: Colors.brandPrimary10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: Spacing.s,
                      }}>
                        <Ionicons name={item.icon} size={16} color={Colors.brandPrimary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={{ ...Typography.body, color: Colors.textPrimary, marginBottom: 2 }}>
                          {item.title}
                        </ThemedText>
                        <ThemedText style={{ ...Typography.caption, color: Colors.textSecondary }}>
                          {item.subtitle}
                        </ThemedText>
                        <ThemedText style={{ ...Typography.caption, color: Colors.textSecondary, marginTop: 4 }}>
                          {item.date} • {item.author}
                        </ThemedText>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => handleDeleteNews(item.id, item.title)}
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
        title="Удалить новость?"
        message={
          newsToDelete 
            ? `Вы уверены, что хотите удалить новость "${newsToDelete.title}"?\n\nЭто действие нельзя отменить!`
            : ''
        }
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={confirmDeleteNews}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setNewsToDelete(null);
        }}
        isDangerous={true}
      />
    </SafeAreaView>
  );
}
