import { ThemedText } from '@/components/ThemedText';
import { Colors, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { addNews } from '@/store/slices/newsSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewsManagementScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: news } = useAppSelector((state) => state.news);
  
  const [title, setTitle] = React.useState('');
  const [subtitle, setSubtitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [selectedIcon, setSelectedIcon] = React.useState<'school-outline' | 'trophy-outline' | 'people-outline' | 'megaphone-outline' | 'calendar-outline'>('megaphone-outline');

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

  const handleAddNews = () => {
    if (!title.trim() || !subtitle.trim() || !content.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    const newNews = {
      id: Date.now().toString(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      content: content.trim(),
      author: `${user.first_name} ${user.last_name}`.trim() || user.username,
      date: 'только что',
      category: 'announcement' as const,
      icon: selectedIcon,
      isImportant: false,
    };

    dispatch(addNews(newNews));
    
    // Очищаем форму
    setTitle('');
    setSubtitle('');
    setContent('');
    setSelectedIcon('megaphone-outline');
    
    Alert.alert('Успешно', 'Новость добавлена');
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
            style={{
              backgroundColor: Colors.brandPrimary,
              paddingVertical: Spacing.m,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <ThemedText style={{ ...Typography.body, color: Colors.surface, fontWeight: '600' }}>
              Добавить новость
            </ThemedText>
          </Pressable>
        </Animated.View>

        {/* Список новостей */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <ThemedText style={{ ...Typography.titleH2, color: Colors.textPrimary, marginBottom: Spacing.m }}>
            Существующие новости ({news.length})
          </ThemedText>
          
          {news.length === 0 ? (
            <View style={{
              backgroundColor: Colors.surface,
              borderRadius: 16,
              padding: Spacing.l,
              alignItems: 'center',
              ...Shadows.card,
            }}>
              <Ionicons name="newspaper-outline" size={48} color={Colors.textSecondary} />
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.s }}>
                Новостей пока нет
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
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
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
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
