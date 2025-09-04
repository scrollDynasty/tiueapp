import { ThemedText } from '@/components/ThemedText';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UsersManagementScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<'student' | 'admin'>('student');
  const [isLoading, setIsLoading] = React.useState(false);

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
              borderRadius: Radius.card,
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

  const handleCreateUser = async () => {
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setIsLoading(true);
    
    try {
      // Здесь будет API вызов для создания пользователя
      const userData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        password: password,
        role: role,
      };

      console.log('Creating user:', userData);
      
      // Имитация API вызова
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Очищаем форму
      setFirstName('');
      setLastName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('student');
      
      Alert.alert('Успешно', 'Пользователь создан');
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Ошибка', 'Не удалось создать пользователя');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceSubtle }}>
      <ScrollView contentContainerStyle={{ padding: Spacing.l }}>
        {/* Заголовок */}
        <Animated.View entering={FadeInDown.duration(500)}>
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
              <Ionicons name="chevron-back" size={24} color={Colors.brandPrimary} />
            </Pressable>
            
            <View style={{ flex: 1 }}>
              <ThemedText style={{ ...Typography.displayH1, color: Colors.textPrimary }}>
                Управление пользователями
              </ThemedText>
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary }}>
                Создание и редактирование пользователей
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Форма создания пользователя */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <ThemedText style={{ ...Typography.titleH2, color: Colors.textPrimary, marginBottom: Spacing.m }}>
            Создать нового пользователя
          </ThemedText>
          
          <View style={{
            backgroundColor: Colors.surface,
            borderRadius: Radius.card,
            padding: Spacing.l,
            marginBottom: Spacing.l,
            ...Shadows.card,
          }}>
            {/* Имя и фамилия */}
            <View style={{ flexDirection: 'row', gap: Spacing.m, marginBottom: Spacing.m }}>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
                  Имя
                </ThemedText>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Введите имя"
                  style={{
                    backgroundColor: Colors.surfaceSubtle,
                    borderRadius: Radius.icon,
                    padding: Spacing.m,
                    fontSize: 16,
                    color: Colors.textPrimary,
                    borderWidth: 1,
                    borderColor: Colors.strokeSoft,
                  }}
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
                  Фамилия
                </ThemedText>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Введите фамилию"
                  style={{
                    backgroundColor: Colors.surfaceSubtle,
                    borderRadius: Radius.icon,
                    padding: Spacing.m,
                    fontSize: 16,
                    color: Colors.textPrimary,
                    borderWidth: 1,
                    borderColor: Colors.strokeSoft,
                  }}
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
            </View>

            {/* Username */}
            <View style={{ marginBottom: Spacing.m }}>
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
                Имя пользователя
              </ThemedText>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Введите имя пользователя"
                autoCapitalize="none"
                style={{
                  backgroundColor: Colors.surfaceSubtle,
                  borderRadius: Radius.icon,
                  padding: Spacing.m,
                  fontSize: 16,
                  color: Colors.textPrimary,
                  borderWidth: 1,
                  borderColor: Colors.strokeSoft,
                }}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            {/* Email */}
            <View style={{ marginBottom: Spacing.m }}>
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
                Email
              </ThemedText>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Введите email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  backgroundColor: Colors.surfaceSubtle,
                  borderRadius: Radius.icon,
                  padding: Spacing.m,
                  fontSize: 16,
                  color: Colors.textPrimary,
                  borderWidth: 1,
                  borderColor: Colors.strokeSoft,
                }}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            {/* Пароль */}
            <View style={{ marginBottom: Spacing.m }}>
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
                Пароль
              </ThemedText>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Введите пароль"
                secureTextEntry
                style={{
                  backgroundColor: Colors.surfaceSubtle,
                  borderRadius: Radius.icon,
                  padding: Spacing.m,
                  fontSize: 16,
                  color: Colors.textPrimary,
                  borderWidth: 1,
                  borderColor: Colors.strokeSoft,
                }}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            {/* Роль */}
            <View style={{ marginBottom: Spacing.l }}>
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
                Роль пользователя
              </ThemedText>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.surfaceSubtle,
                borderRadius: Radius.icon,
                padding: Spacing.m,
                borderWidth: 1,
                borderColor: Colors.strokeSoft,
              }}>
                <ThemedText style={{ ...Typography.body, color: Colors.textPrimary, flex: 1 }}>
                  {role === 'admin' ? 'Администратор' : 'Студент'}
                </ThemedText>
                <Switch 
                  value={role === 'admin'} 
                  onValueChange={(value) => setRole(value ? 'admin' : 'student')}
                  trackColor={{ false: Colors.strokeSoft, true: Colors.brandPrimary }}
                  thumbColor={role === 'admin' ? Colors.surface : Colors.textSecondary}
                />
              </View>
            </View>

            {/* Кнопка создания */}
            <Pressable
              onPress={handleCreateUser}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? Colors.strokeSoft : Colors.brandPrimary,
                paddingVertical: Spacing.m,
                borderRadius: Radius.card,
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
                {isLoading ? 'Создаем...' : 'Создать пользователя'}
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>

        {/* Список пользователей (заглушка) */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <ThemedText style={{ ...Typography.titleH2, color: Colors.textPrimary, marginBottom: Spacing.m }}>
            Существующие пользователи
          </ThemedText>
          
          <View style={{
            backgroundColor: Colors.surface,
            borderRadius: Radius.card,
            padding: Spacing.l,
            alignItems: 'center',
            ...Shadows.card,
          }}>
            <Ionicons name="people-outline" size={48} color={Colors.textSecondary} />
            <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.s }}>
              Список пользователей будет доступен в следующих версиях
            </ThemedText>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
