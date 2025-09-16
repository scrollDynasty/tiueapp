import { ConfirmationModal } from '@/components/ConfirmationModal';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSelector } from '@/hooks/redux';
import { authApi } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewsManagementScreen() {
  const { isDarkMode } = useTheme();
  const { user } = useAppSelector((state) => state.auth);
  
  const [news, setNews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [subtitle, setSubtitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [selectedImage, setSelectedImage] = React.useState<ImagePicker.ImagePickerAsset | null>(null);
  const [selectedIcon, setSelectedIcon] = React.useState<'school-outline' | 'trophy-outline' | 'people-outline' | 'megaphone-outline' | 'calendar-outline'>('megaphone-outline');

  // Состояния для удаления новости
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [newsToDelete, setNewsToDelete] = React.useState<{ id: string; title: string } | null>(null);

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

  // Функция выбора изображения
  const pickImage = async () => {
    // Запрашиваем разрешение на доступ к медиатеке
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Разрешение требуется', 'Разрешите доступ к фотографиям для загрузки изображений');
      return;
    }

    // Открываем выбор изображения
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  // Функция удаления выбранного изображения
  const removeImage = () => {
    setSelectedImage(null);
  };

  // Загружаем новости при открытии страницы
  React.useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await authApi.getNews();
      if (response.success && response.data) {
        setNews(response.data);
      }
    } catch (error) {
      console.error('Error loading news:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить новости');
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
      image: selectedImage || undefined,
    };

    try {
      setLoading(true);
      const response = await authApi.createNews(newNewsData);
      
      if (response.success) {
        // Перезагружаем список новостей
        await loadNews();
        
        // Очищаем форму
        setTitle('');
        setSubtitle('');
        setContent('');
        setSelectedImage(null);
        setSelectedIcon('megaphone-outline');
        
        Alert.alert('Успешно', 'Новость добавлена и сохранена в базе данных');
      } else {
        Alert.alert('Ошибка', response.error || 'Не удалось создать новость');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Ошибка', `Не удалось создать новость: ${error}`);
    } finally {
      setLoading(false);
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
      const response = await authApi.deleteNews(newsToDelete.id);
      
      if (response.success) {
        // Перезагружаем список новостей
        await loadNews();
        Alert.alert('Успешно', 'Новость удалена');
      } else {
        Alert.alert('Ошибка', response.error || 'Не удалось удалить новость');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      Alert.alert('Ошибка', 'Не удалось удалить новость');
    } finally {
      // Закрываем модальное окно
      setShowDeleteConfirm(false);
      setNewsToDelete(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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

          {/* Выбор изображения */}
          <View style={{ marginBottom: Spacing.l }}>
            <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
              Изображение (необязательно)
            </ThemedText>
            
            {selectedImage ? (
              // Показываем выбранное изображение
              <View>
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={{
                    width: '100%',
                    height: 200,
                    borderRadius: 12,
                    marginBottom: Spacing.s,
                  }}
                  resizeMode="cover"
                />
                <View style={{ flexDirection: 'row', gap: Spacing.s }}>
                  <Pressable
                    onPress={pickImage}
                    style={{
                      flex: 1,
                      backgroundColor: Colors.brandPrimary,
                      borderRadius: 8,
                      paddingVertical: Spacing.s,
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
                      backgroundColor: Colors.error + '20',
                      borderRadius: 8,
                      paddingVertical: Spacing.s,
                      paddingHorizontal: Spacing.m,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.error} />
                  </Pressable>
                </View>
              </View>
            ) : (
              // Кнопка выбора изображения
              <Pressable
                onPress={pickImage}
                style={{
                  backgroundColor: Colors.surfaceSubtle,
                  borderRadius: 12,
                  padding: Spacing.l,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: Colors.strokeSoft,
                  borderStyle: 'dashed',
                }}
              >
                <Ionicons name="cloud-upload-outline" size={32} color={Colors.textSecondary} />
                <ThemedText style={{ 
                  ...Typography.body, 
                  color: Colors.textSecondary, 
                  marginTop: Spacing.s,
                  textAlign: 'center'
                }}>
                  Нажмите для выбора изображения
                </ThemedText>
                <ThemedText style={{ 
                  ...Typography.caption, 
                  color: Colors.textSecondary, 
                  marginTop: 4,
                  textAlign: 'center'
                }}>
                  JPG, PNG до 10MB
                </ThemedText>
              </Pressable>
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
              {loading ? 'Добавляем...' : 'Добавить новость'}
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
                        <ThemedText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                          {formatDate(item.created_at || item.date)} • {item.author}
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
