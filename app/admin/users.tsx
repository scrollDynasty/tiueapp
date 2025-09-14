import { ConfirmationModal } from '@/components/ConfirmationModal';
import { ThemedText } from '@/components/ThemedText';
import { PasswordResetModal } from '@/components/admin/PasswordResetModal';
import { UserCard } from '@/components/admin/UserCard';
import { getThemeColors } from '@/constants/Colors';
import { Colors, Radius, Typography } from '@/constants/DesignTokens';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSelector } from '@/hooks/redux';
import { useResponsive } from '@/hooks/useResponsive';
import { useUsersApi } from '@/hooks/useUsersApi';
import { UserProfile } from '@/types';
import { showToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Утилиты и хуки, специфичные для этого компонента
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// Основной компонент экрана
export default function UsersManagementScreen() {
  const { theme } = useTheme();
  const themeColors = getThemeColors(theme === 'dark');
  const { isSmallScreen, spacing, fontSize, isVerySmallScreen } = useResponsive();
  const { user: adminUser } = useAppSelector((state) => state.auth);

  // --- Логика API, вынесенная в хук ---
  const {
    users,
    isLoading: isLoadingUsers,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
  } = useUsersApi();

  // --- Состояния UI, которые остаются в компоненте ---
  const [formState, setFormState] = React.useState<Partial<UserProfile>>({});
  const [password, setPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterRole, setFilterRole] = React.useState<'all' | UserProfile['role']>('all');
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserProfile | null>(null);

  const [showPasswordReset, setShowPasswordReset] = React.useState(false);
  const [resetPasswordUser, setResetPasswordUser] = React.useState<UserProfile | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<UserProfile | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Загрузка пользователей при монтировании компонента
  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Фильтрация пользователей
  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.first_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, debouncedSearchQuery, filterRole]);

  // --- Функции для управления UI (модальные окна, форма) ---
  const handleEditUser = React.useCallback((userToEdit: UserProfile) => {
    setEditingUser(userToEdit);
    setFormState(userToEdit);
    setPassword('');
    setShowCreateForm(true);
  }, []);

  const handleDeleteUser = React.useCallback((user: UserProfile) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  }, []);

  const handleResetPassword = React.useCallback((user: UserProfile) => {
    setResetPasswordUser(user);
    setShowPasswordReset(true);
  }, []);

  const handleToggleStatus = React.useCallback((userId: string) => {
    // Реализация переключения статуса пользователя
    console.log('Toggle status for user:', userId);
  }, []);

  const handleToggleCreateForm = React.useCallback(() => {
    setShowCreateForm(prev => !prev);
    setEditingUser(null);
    setFormState({});
    setPassword('');
  }, []);

  const handleFormChange = React.useCallback((field: keyof UserProfile, value: string) => {
    setFormState(prev => ({ ...prev, [field]: sanitizeInput(value) }));
  }, []);

  // --- Функции-обертки для вызова API из хука ---
  const onConfirmDelete = async () => {
    if (!userToDelete) return;
    await deleteUser(userToDelete.id);
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const onConfirmResetPassword = async (newPassword: string) => {
    if (!resetPasswordUser) return;
    const success = await resetPassword(resetPasswordUser.id, newPassword);
    if (success) {
      setShowPasswordReset(false);
      setResetPasswordUser(null);
    }
  };

  const handleSubmitForm = async () => {
    // Валидация
    if (!formState.first_name || !formState.last_name || !formState.username || !formState.email) {
      showToast('Заполните все обязательные поля');
      return;
    }
    if (!editingUser && !password) {
      showToast('Пароль обязателен для нового пользователя');
      return;
    }

    setIsSubmitting(true);
    let success = false;
    
    try {
      if (editingUser) {
        success = await updateUser(editingUser.id, formState);
      } else {
        success = await createUser({ ...formState, password } as UserProfile & { password: string });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
    
    setIsSubmitting(false);

    if (success) {
      setShowCreateForm(false);
      setEditingUser(null);
      setFormState({});
      setPassword('');
    }
  };

  // Проверка прав доступа
  if (!adminUser || adminUser.role !== 'admin') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.surface }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <Ionicons name="shield-outline" size={64} color={Colors.textSecondary} />
          <ThemedText style={{ 
            fontSize: fontSize.title, 
            color: Colors.textSecondary, 
            marginTop: spacing.lg,
            fontWeight: 'bold'
          }}>
            Доступ запрещен
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // --- Рендеринг компонента ---
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ 
          padding: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : spacing.xl,
          paddingBottom: 140,
        }}
      >
        {/* Заголовок */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <ThemedText style={{ 
            ...Typography.displayH1, 
            color: themeColors.text, 
            marginBottom: spacing.md,
            textAlign: 'center' 
          }}>
            Управление пользователями
          </ThemedText>
        </Animated.View>

        {/* Кнопка добавления */}
        {!showCreateForm && (
          <Animated.View entering={FadeInDown.duration(500).delay(300)}>
            <Pressable
              style={{
                backgroundColor: Colors.brandPrimary,
                padding: spacing.md,
                borderRadius: Radius.card,
                marginBottom: spacing.lg,
                alignItems: 'center',
              }}
              onPress={handleToggleCreateForm}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
                <ThemedText style={{ 
                  ...Typography.body,
                  fontWeight: 'bold',
                  color: "#FFFFFF", 
                  marginLeft: spacing.sm 
                }}>
                  Добавить пользователя
                </ThemedText>
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* Форма создания/редактирования */}
        {showCreateForm && (
          <Animated.View entering={FadeInDown.duration(500).delay(200)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <ThemedText style={{ 
                ...Typography.titleH2, 
                color: themeColors.text, 
                flex: 1
              }}>
                {editingUser ? 'Редактировать пользователя' : 'Создать нового пользователя'}
              </ThemedText>
              <Pressable onPress={handleToggleCreateForm}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </Pressable>
            </View>
            
            <View style={{ 
              backgroundColor: themeColors.surface, 
              borderRadius: Radius.card, 
              padding: spacing.lg, 
              marginBottom: spacing.lg,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: Colors.strokeSoft,
                  borderRadius: Radius.card,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                  color: themeColors.text,
                  backgroundColor: themeColors.background,
                  fontSize: fontSize.body,
                }}
                placeholder="Имя"
                placeholderTextColor={Colors.textSecondary}
                value={formState.first_name || ''}
                onChangeText={text => handleFormChange('first_name', text)}
              />
              
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: Colors.strokeSoft,
                  borderRadius: Radius.card,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                  color: themeColors.text,
                  backgroundColor: themeColors.background,
                  fontSize: fontSize.body,
                }}
                placeholder="Фамилия"
                placeholderTextColor={Colors.textSecondary}
                value={formState.last_name || ''}
                onChangeText={text => handleFormChange('last_name', text)}
              />
              
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: Colors.strokeSoft,
                  borderRadius: Radius.card,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                  color: themeColors.text,
                  backgroundColor: themeColors.background,
                  fontSize: fontSize.body,
                }}
                placeholder="Имя пользователя"
                placeholderTextColor={Colors.textSecondary}
                value={formState.username || ''}
                onChangeText={text => handleFormChange('username', text)}
              />
              
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: Colors.strokeSoft,
                  borderRadius: Radius.card,
                  padding: spacing.md,
                  marginBottom: spacing.md,
                  color: themeColors.text,
                  backgroundColor: themeColors.background,
                  fontSize: fontSize.body,
                }}
                placeholder="Email"
                placeholderTextColor={Colors.textSecondary}
                value={formState.email || ''}
                onChangeText={text => handleFormChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              {!editingUser && (
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: Colors.strokeSoft,
                    borderRadius: Radius.card,
                    padding: spacing.md,
                    marginBottom: spacing.md,
                    color: themeColors.text,
                    backgroundColor: themeColors.background,
                    fontSize: fontSize.body,
                  }}
                  placeholder="Пароль"
                  placeholderTextColor={Colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              )}

              {/* Выбор роли */}
              <View style={{ marginBottom: spacing.lg }}>
                <ThemedText style={{ 
                  ...Typography.body, 
                  color: themeColors.text, 
                  marginBottom: spacing.sm 
                }}>
                  Роль:
                </ThemedText>
                <View style={{ flexDirection: 'row', gap: spacing.md }}>
                  {(['student', 'professor', 'admin'] as const).map((role) => (
                    <Pressable
                      key={role}
                      style={{
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        borderRadius: Radius.card,
                        borderWidth: 1,
                        borderColor: formState.role === role ? Colors.brandPrimary : Colors.strokeSoft,
                        backgroundColor: formState.role === role ? Colors.brandPrimary : 'transparent',
                      }}
                      onPress={() => handleFormChange('role', role)}
                    >
                      <ThemedText style={{
                        color: formState.role === role ? '#FFFFFF' : themeColors.text,
                        ...Typography.body,
                      }}>
                        {role === 'admin' ? 'Администратор' : role === 'professor' ? 'Преподаватель' : 'Студент'}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <Pressable
                  style={{
                    flex: 1,
                    backgroundColor: Colors.brandPrimary,
                    padding: spacing.md,
                    borderRadius: Radius.card,
                    alignItems: 'center',
                    opacity: isSubmitting ? 0.7 : 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                  onPress={handleSubmitForm}
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: spacing.sm }} />
                  )}
                  <ThemedText style={{ ...Typography.body, fontWeight: 'bold', color: '#FFFFFF' }}>
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                  </ThemedText>
                </Pressable>
                
                <Pressable
                  style={{
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.md,
                    borderRadius: Radius.card,
                    borderWidth: 1,
                    borderColor: Colors.strokeSoft,
                    alignItems: 'center',
                  }}
                  onPress={handleToggleCreateForm}
                >
                  <ThemedText style={{ ...Typography.body, fontWeight: 'bold', color: themeColors.text }}>
                    Отмена
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Поиск и фильтры */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: Colors.strokeSoft,
              borderRadius: Radius.card,
              padding: spacing.md,
              marginBottom: spacing.md,
              color: themeColors.text,
              backgroundColor: themeColors.surface,
              fontSize: fontSize.body,
            }}
            placeholder="Поиск пользователей..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <View style={{ flexDirection: 'row', marginBottom: spacing.lg, gap: spacing.sm }}>
            {(['all', 'student', 'professor', 'admin'] as const).map((role) => (
              <Pressable
                key={role}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: Radius.card,
                  backgroundColor: filterRole === role ? Colors.brandPrimary : themeColors.surface,
                  borderWidth: 1,
                  borderColor: filterRole === role ? Colors.brandPrimary : Colors.strokeSoft,
                }}
                onPress={() => setFilterRole(role)}
              >
                <ThemedText style={{
                  color: filterRole === role ? '#FFFFFF' : themeColors.text,
                  ...Typography.caption,
                }}>
                  {role === 'all' ? 'Все' : role === 'admin' ? 'Админы' : role === 'professor' ? 'Преподаватели' : 'Студенты'}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Список пользователей */}
        <Animated.View entering={FadeInDown.duration(500).delay(600)}>
          {isLoadingUsers ? (
            <View style={{ alignItems: 'center', padding: spacing.xl }}>
              <ActivityIndicator size="large" color={Colors.brandPrimary} />
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginTop: spacing.md }}>
                Загрузка пользователей...
              </ThemedText>
            </View>
          ) : filteredUsers.length === 0 ? (
            <View style={{ alignItems: 'center', padding: spacing.xl }}>
              <Ionicons name="people-outline" size={48} color={Colors.textSecondary} />
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginTop: spacing.md }}>
                Пользователи не найдены
              </ThemedText>
            </View>
          ) : (
            <View style={{ gap: spacing.md }}> 
              {filteredUsers.map((user, index) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={() => handleEditUser(user)}
                  onDelete={() => handleDeleteUser(user)}
                  onResetPassword={() => handleResetPassword(user)}
                  onToggleStatus={handleToggleStatus}
                  animationDelay={index * 100}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Модальные окна */}
      <PasswordResetModal
        isVisible={showPasswordReset}
        user={resetPasswordUser}
        onClose={() => setShowPasswordReset(false)}
        onReset={onConfirmResetPassword}
      />
      
      <ConfirmationModal
        isVisible={showDeleteConfirm}
        title="Удалить пользователя"
        message={`Вы уверены, что хотите удалить пользователя "${userToDelete?.first_name} ${userToDelete?.last_name}"?`}
        onConfirm={onConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </SafeAreaView>
  );
}