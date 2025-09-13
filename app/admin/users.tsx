import { ConfirmationModal } from '@/components/ConfirmationModal';
import { ThemedText } from '@/components/ThemedText';
import { PasswordResetModal } from '@/components/admin/PasswordResetModal';
import { UserCard } from '@/components/admin/UserCard';
import { getThemeColors } from '@/constants/Colors';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useResponsive } from '@/hooks/useResponsive';
import { authApi } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, TextInput, View, ToastAndroid, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Интерфейс пользователя
interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: 'student' | 'professor' | 'admin';
  is_active: boolean;
  created_at: string;
  last_login?: string;
  faculty?: string;
  course?: number;
  group?: string;
  department?: string;
}

// Интерфейс для API запросов с отменой
interface CancellableRequest {
  cancel: () => void;
}

// Функция для показа toast уведомлений
const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // Для iOS можно использовать библиотеку toast или fallback на Alert
    Alert.alert('Уведомление', message);
  }
};

// Функция для санитизации входных данных
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Убираем HTML теги
    .replace(/javascript:/gi, '') // Убираем javascript: URLs
    .replace(/on\w+=/gi, '') // Убираем event handlers
    .trim();
};

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Rate limiting hook
const useRateLimit = (limit: number = 5, window: number = 60000) => {
  const requestTimestamps = React.useRef<number[]>([]);

  const canMakeRequest = React.useCallback(() => {
    const now = Date.now();
    const windowStart = now - window;
    
    // Удаляем старые запросы
    requestTimestamps.current = requestTimestamps.current.filter(
      timestamp => timestamp > windowStart
    );

    if (requestTimestamps.current.length >= limit) {
      return false;
    }

    requestTimestamps.current.push(now);
    return true;
  }, [limit, window]);

  return { canMakeRequest };
};

export default function UsersManagementScreen() {
  const { theme } = useTheme();
  const themeColors = getThemeColors(theme === 'dark');
  const { isSmallScreen, spacing, fontSize, isVerySmallScreen } = useResponsive();
  const { canMakeRequest } = useRateLimit();
  
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  // Ref для отслеживания монтирования компонента
  const isMountedRef = React.useRef(true);
  
  // Ref для хранения активных запросов
  const activeRequestsRef = React.useRef<Set<CancellableRequest>>(new Set());
  
  // Состояние для создания пользователя
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<'student' | 'professor' | 'admin'>('student');
  const [faculty, setFaculty] = React.useState('');
  const [course, setCourse] = React.useState('');
  const [group, setGroup] = React.useState('');
  const [department, setDepartment] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // Состояние для управления пользователями
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterRole, setFilterRole] = React.useState<'all' | 'student' | 'professor' | 'admin'>('all');
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserProfile | null>(null);

  // Состояния для работы с API
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(true);

  // Состояния для сброса пароля
  const [showPasswordReset, setShowPasswordReset] = React.useState(false);
  const [resetPasswordUser, setResetPasswordUser] = React.useState<UserProfile | null>(null);

  // Состояния для удаления пользователя
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<UserProfile | null>(null);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Функция для безопасного получения токена
  const getSecureToken = React.useCallback(async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Error getting secure token:', error);
      // Fallback на AsyncStorage если SecureStore недоступен
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        return await AsyncStorage.getItem('authToken');
      } catch (fallbackError) {
        console.error('Error getting fallback token:', fallbackError);
        return null;
      }
    }
  }, []);

  // Функции управления ошибками и API с retry логикой
  const handleApiError = React.useCallback((error: any, operation: string) => {
    console.error(`${operation} error:`, error);
    const message = error?.response?.data?.message || 
                    error?.message || 
                    `Произошла ошибка при ${operation.toLowerCase()}`;
    showToast(`Ошибка: ${message}`);
  }, []);

  // Функция для выполнения API запроса с retry
  const executeWithRetry = React.useCallback(async (
    apiCall: () => Promise<any>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<any> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (!isMountedRef.current) {
          throw new Error('Component unmounted');
        }
        return await apiCall();
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError!;
  }, []);

  // Responsive helper function
  const getResponsiveValue = React.useCallback((small: number, medium: number, large: number) => {
    if (isVerySmallScreen) return small;
    if (isSmallScreen) return medium;
    return large;
  }, [isVerySmallScreen, isSmallScreen]);

  // Мемоизированные responsive стили
  const responsiveStyles = React.useMemo(() => ({
    cardPadding: getResponsiveValue(spacing.sm, spacing.md, Spacing.m),
    cardRadius: getResponsiveValue(10, 11, Radius.card),
    fontSize: getResponsiveValue(fontSize.small, fontSize.body, Typography.body.fontSize),
    buttonSize: getResponsiveValue(32, 34, 36),
    borderRadius: getResponsiveValue(8, 10, Radius.icon),
  }), [getResponsiveValue, spacing, fontSize]);

  // Cleanup функция для отмены всех активных запросов
  const cancelAllRequests = React.useCallback(() => {
    activeRequestsRef.current.forEach(request => {
      try {
        request.cancel();
      } catch (error) {
        console.error('Error cancelling request:', error);
      }
    });
    activeRequestsRef.current.clear();
  }, []);

  // Главный useEffect с proper cleanup
  React.useEffect(() => {
    isMountedRef.current = true;
    
    const loadUsers = async () => {
      if (!isMountedRef.current) return;
      setIsLoadingUsers(true);
      
      try {
        const token = await getSecureToken();
        if (!token || !isMountedRef.current) {
          throw new Error('No auth token');
        }

        const response = await executeWithRetry(async () => {
          return await authApi.getUsers();
        });
        
        if (isMountedRef.current && response.success && response.data) {
          const usersData = Array.isArray(response.data) ? response.data : [];
          setUsers(usersData);
        } else if (isMountedRef.current) {
          setUsers([]);
        }
      } catch (error) {
        if (isMountedRef.current) {
          setUsers([]);
          console.error('Load users error:', error);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoadingUsers(false);
        }
      }
    };

    loadUsers();
    
    return () => {
      isMountedRef.current = false;
      cancelAllRequests();
      
      // Очистка всех состояний
      setUsers([]);
      setEditingUser(null);
      setResetPasswordUser(null);
      setUserToDelete(null);
      setSearchQuery('');
      setFilterRole('all');
      setShowCreateForm(false);
      setShowPasswordReset(false);
      setShowDeleteConfirm(false);
      clearForm();
    };
  }, [getSecureToken, executeWithRetry, cancelAllRequests]);

  // Функция для повторной загрузки пользователей с rate limiting
  const loadUsers = React.useCallback(async () => {
    if (!canMakeRequest()) {
      showToast('Слишком много запросов. Попробуйте позже.');
      return;
    }

    if (!isMountedRef.current) return;
    
    setIsLoadingUsers(true);
    try {
      const token = await getSecureToken();
      if (!token || !isMountedRef.current) {
        throw new Error('No auth token');
      }

      const response = await executeWithRetry(async () => {
        return await authApi.getUsers();
      });
      
      if (isMountedRef.current && response.success && response.data) {
        const usersData = Array.isArray(response.data) ? response.data : [];
        setUsers(usersData);
      } else if (isMountedRef.current) {
        setUsers([]);
      }
    } catch (error) {
      if (isMountedRef.current) {
        setUsers([]);
        handleApiError(error, 'загрузке пользователей');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingUsers(false);
      }
    }
  }, [canMakeRequest, getSecureToken, executeWithRetry, handleApiError]);

  // Фильтрация пользователей с использованием debouncedSearchQuery
  const filteredUsers = React.useMemo(() => {
    if (!Array.isArray(users)) {
      return [];
    }
    
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

  // Функция очистки формы
  const clearForm = React.useCallback(() => {
    setFirstName('');
    setLastName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('student');
    setFaculty('');
    setCourse('');
    setGroup('');
    setDepartment('');
    setEditingUser(null);
  }, []);

  // Очищаем пароль при переключении в режим редактирования
  React.useEffect(() => {
    if (editingUser) {
      setPassword(''); // Очищаем пароль при редактировании
    }
  }, [editingUser]);

  // Функция валидации формы с улучшенной безопасностью
  const validateForm = React.useCallback(() => {
    // Санитизируем входные данные
    const sanitizedFirstName = sanitizeInput(firstName);
    const sanitizedLastName = sanitizeInput(lastName);
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedEmail = sanitizeInput(email);

    // Базовая валидация
    if (!sanitizedFirstName || !sanitizedLastName || !sanitizedUsername || !sanitizedEmail) {
      showToast('Заполните все обязательные поля');
      return false;
    }

    // Валидация пароля для новых пользователей
    if (!editingUser && !password.trim()) {
      showToast('Введите пароль для нового пользователя');
      return false;
    }

    if (!editingUser && password.trim().length < 6) {
      showToast('Пароль должен содержать минимум 6 символов');
      return false;
    }

    // Улучшенная валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      showToast('Введите корректный email адрес');
      return false;
    }

    // Проверка на потенциально опасные символы
    const dangerousPattern = /[<>\"']/;
    if (dangerousPattern.test(firstName) || dangerousPattern.test(lastName) || 
        dangerousPattern.test(username) || dangerousPattern.test(email)) {
      showToast('Поля содержат недопустимые символы');
      return false;
    }

    // Валидация для студентов
    if (role === 'student' && !sanitizeInput(faculty).trim()) {
      showToast('Укажите факультет для студента');
      return false;
    }

    if (role === 'student' && course && (isNaN(parseInt(course)) || parseInt(course) < 1 || parseInt(course) > 6)) {
      showToast('Курс должен быть от 1 до 6');
      return false;
    }

    // Валидация для преподавателей
    if (role === 'professor' && !sanitizeInput(department).trim()) {
      showToast('Укажите кафедру для преподавателя');
      return false;
    }

    return true;
  }, [firstName, lastName, username, email, password, role, faculty, course, department, editingUser]);

  // Обработчики с useCallback для предотвращения лишних re-renders
  const handleFirstNameChange = React.useCallback((text: string) => {
    setFirstName(sanitizeInput(text));
  }, []);

  const handleLastNameChange = React.useCallback((text: string) => {
    setLastName(sanitizeInput(text));
  }, []);

  const handleUsernameChange = React.useCallback((text: string) => {
    setUsername(sanitizeInput(text.toLowerCase()));
  }, []);

  const handleEmailChange = React.useCallback((text: string) => {
    setEmail(sanitizeInput(text.toLowerCase()));
  }, []);

  const handleSearchChange = React.useCallback((text: string) => {
    setSearchQuery(sanitizeInput(text));
  }, []);

  // Функция для рендеринга полей в зависимости от роли
  const renderRoleSpecificFields = React.useCallback(() => {
    const inputStyle = {
      backgroundColor: Colors.surfaceSubtle,
      borderRadius: responsiveStyles.borderRadius,
      padding: responsiveStyles.cardPadding,
      fontSize: responsiveStyles.fontSize,
      color: Colors.textPrimary,
      borderWidth: 1,
      borderColor: Colors.strokeSoft,
    };

    if (role === 'student') {
      return (
        <>
          <View style={{ marginBottom: Spacing.m }}>
            <ThemedText style={{ 
              ...Typography.body, 
              color: Colors.textSecondary, 
              marginBottom: Spacing.s,
              fontSize: responsiveStyles.fontSize
            }}>
              Факультет *
            </ThemedText>
            <TextInput
              value={faculty}
              onChangeText={(text) => setFaculty(sanitizeInput(text))}
              placeholder="Введите факультет"
              style={inputStyle}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
          
          <View style={{ 
            flexDirection: isVerySmallScreen ? 'column' : 'row', 
            gap: isVerySmallScreen ? spacing.sm : Spacing.m, 
            marginBottom: Spacing.m 
          }}>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ 
                ...Typography.body, 
                color: Colors.textSecondary, 
                marginBottom: Spacing.s,
                fontSize: responsiveStyles.fontSize
              }}>
                Курс
              </ThemedText>
              <TextInput
                value={course}
                onChangeText={(text) => setCourse(text.replace(/[^1-6]/g, ''))}
                placeholder="1-6"
                keyboardType="numeric"
                maxLength={1}
                style={inputStyle}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
            
            <View style={{ flex: 1 }}>
              <ThemedText style={{ 
                ...Typography.body, 
                color: Colors.textSecondary, 
                marginBottom: Spacing.s,
                fontSize: responsiveStyles.fontSize
              }}>
                Группа
              </ThemedText>
              <TextInput
                value={group}
                onChangeText={(text) => setGroup(sanitizeInput(text))}
                placeholder="Введите группу"
                style={inputStyle}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>
        </>
      );
    }
    
    if (role === 'professor') {
      return (
        <View style={{ marginBottom: Spacing.m }}>
          <ThemedText style={{ 
            ...Typography.body, 
            color: Colors.textSecondary, 
            marginBottom: Spacing.s,
            fontSize: responsiveStyles.fontSize
          }}>
            Кафедра *
          </ThemedText>
          <TextInput
            value={department}
            onChangeText={(text) => setDepartment(sanitizeInput(text))}
            placeholder="Введите кафедру"
            style={inputStyle}
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
      );
    }
    
    return null;
  }, [role, faculty, course, group, department, responsiveStyles, isVerySmallScreen, spacing]);

  // Функция сброса пароля
  const handleResetPassword = React.useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return;
    }

    setResetPasswordUser(user);
    setShowPasswordReset(true);
  }, [users]);

  // Функция подтверждения сброса пароля (ИСПРАВЛЕНА - НЕ ПОКАЗЫВАЕТ ПАРОЛЬ)
  const confirmPasswordReset = React.useCallback(async (newPassword: string) => {
    if (!resetPasswordUser || !canMakeRequest()) {
      if (!canMakeRequest()) {
        showToast('Слишком много запросов. Попробуйте позже.');
      }
      return;
    }
    
    if (!isMountedRef.current) return;
    
    try {
      // Отправляем полные данные пользователя с новым паролем
      const updateData = {
        first_name: resetPasswordUser.first_name,
        last_name: resetPasswordUser.last_name,
        username: resetPasswordUser.username,
        email: resetPasswordUser.email,
        role: resetPasswordUser.role,
        is_active: resetPasswordUser.is_active,
        password: newPassword.trim()
      };
      
      const response = await executeWithRetry(async () => {
        return await authApi.updateUser(resetPasswordUser.id, updateData as any);
      });
      
      if (response.success && isMountedRef.current) {
        // БЕЗОПАСНОЕ уведомление без показа пароля
        showToast(`Пароль пользователя ${resetPasswordUser.username} успешно изменен`);
        
        // Обновляем список пользователей
        await loadUsers();
        
        // Закрываем модальное окно
        setShowPasswordReset(false);
        setResetPasswordUser(null);
      } else {
        console.error('Password reset failed:', response);
        showToast(response.error || 'Не удалось изменить пароль');
        throw new Error(response.error || 'Password reset failed');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      if (isMountedRef.current) {
        showToast('Не удалось изменить пароль');
      }
      throw error;
    }
  }, [resetPasswordUser, canMakeRequest, executeWithRetry, loadUsers]);

  // Функция закрытия модального окна сброса пароля
  const handleClosePasswordReset = React.useCallback(() => {
    setShowPasswordReset(false);
    setResetPasswordUser(null);
  }, []);

  const handleCreateUser = React.useCallback(async () => {
    if (!validateForm() || !canMakeRequest()) {
      if (!canMakeRequest()) {
        showToast('Слишком много запросов. Попробуйте позже.');
      }
      return;
    }

    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    
    try {
      const userData: Partial<UserProfile> = {
        first_name: sanitizeInput(firstName),
        last_name: sanitizeInput(lastName),
        username: sanitizeInput(username),
        email: sanitizeInput(email),
        role: role,
        is_active: true,
        faculty: role === 'student' ? sanitizeInput(faculty) : undefined,
        course: role === 'student' && course ? parseInt(course) : undefined,
        group: role === 'student' ? sanitizeInput(group) : undefined,
        department: role === 'professor' ? sanitizeInput(department) : undefined,
      };

      if (editingUser) {
        // Обновление существующего пользователя
        const response = await executeWithRetry(async () => {
          return await authApi.updateUser(editingUser.id, userData);
        });
        
        if (response.success && response.data && isMountedRef.current) {
          setUsers(prev => prev.map(u => 
            u.id === editingUser.id 
              ? response.data as UserProfile
              : u
          ));
          showToast('Пользователь обновлен');
        } else {
          console.error('Update failed:', response);
          showToast(response.error || 'Не удалось обновить пользователя');
          return;
        }
      } else {
        // Создание нового пользователя  
        const userDataWithPassword = {
          ...userData,
          password: password.trim(),
        };
        
        const response = await executeWithRetry(async () => {
          return await authApi.createUser(userDataWithPassword);
        });
        
        if (response.success && response.data && isMountedRef.current) {
          setUsers(prev => [...prev, response.data as UserProfile]);
          showToast('Пользователь создан');
          // Перезагружаем список пользователей для синхронизации
          loadUsers();
        } else {
          console.error('Create failed:', response);
          showToast(response.error || 'Не удалось создать пользователя');
          return;
        }
      }
      
      clearForm();
      setShowCreateForm(false);
    } catch (error) {
      if (isMountedRef.current) {
        handleApiError(error, editingUser ? 'обновлении пользователя' : 'создании пользователя');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [validateForm, canMakeRequest, firstName, lastName, username, email, role, faculty, course, group, department, password, editingUser, clearForm, executeWithRetry, handleApiError, loadUsers]);

  const handleEditUser = React.useCallback((user: UserProfile) => {
    setEditingUser(user);
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role);
    setFaculty(user.faculty || '');
    setCourse(user.course?.toString() || '');
    setGroup(user.group || '');
    setDepartment(user.department || '');
    setPassword(''); // Не показываем пароль при редактировании
    setShowCreateForm(true);
  }, []);

  const handleToggleUserStatus = React.useCallback(async (userId: string) => {
    if (!canMakeRequest()) {
      showToast('Слишком много запросов. Попробуйте позже.');
      return;
    }

    const user = users.find(u => u.id === userId);
    if (!user || !isMountedRef.current) return;

    try {
      const response = await executeWithRetry(async () => {
        return await authApi.updateUser(userId, { 
          is_active: !user.is_active 
        });
      });

      if (response.success && response.data && isMountedRef.current) {
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? response.data as UserProfile
            : u
        ));
        showToast(`Пользователь ${user.is_active ? 'деактивирован' : 'активирован'}`);
      } else {
        showToast(response.error || 'Не удалось изменить статус пользователя');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      if (isMountedRef.current) {
        showToast('Не удалось изменить статус пользователя');
      }
    }
  }, [canMakeRequest, users, executeWithRetry]);

  const handleDeleteUser = React.useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setUserToDelete(user);
      setShowDeleteConfirm(true);
    }
  }, [users]);

  const confirmDeleteUser = React.useCallback(async () => {
    if (!userToDelete || !canMakeRequest()) {
      if (!canMakeRequest()) {
        showToast('Слишком много запросов. Попробуйте позже.');
      }
      return;
    }

    if (!isMountedRef.current) return;
    
    try {
      const response = await executeWithRetry(async () => {
        return await authApi.deleteUser(userToDelete.id);
      });
      
      // Закрываем модальное окно в любом случае
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      
      // Проверяем успешность удаления
      if (response.success !== false && isMountedRef.current) {
        // Перезагружаем список пользователей с сервера
        await loadUsers();
        // Показываем уведомление об успешном удалении
        showToast('Пользователь удален');
      } else {
        console.error('Delete failed:', response.error || response.message);
        showToast(response.message || 'Не удалось удалить пользователя');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      // Закрываем модальное окно даже при ошибке
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      if (isMountedRef.current) {
        showToast('Произошла ошибка при удалении пользователя');
      }
    }
  }, [userToDelete, canMakeRequest, executeWithRetry, loadUsers]);

  const handleToggleCreateForm = React.useCallback(() => {
    setShowCreateForm(!showCreateForm);
    if (showCreateForm) {
      clearForm();
    }
  }, [showCreateForm, clearForm]);

  const handleRoleChange = React.useCallback((newRole: 'student' | 'professor' | 'admin') => {
    setRole(newRole);
  }, []);

  const handleFilterRoleChange = React.useCallback((newFilter: 'all' | 'student' | 'professor' | 'admin') => {
    setFilterRole(newFilter);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ 
          padding: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.l,
          paddingBottom: isVerySmallScreen ? 120 : isSmallScreen ? 130 : 140,
        }}
      >
        {/* Заголовок с кнопкой назад */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <View style={{ 
            marginBottom: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : Spacing.l,
            paddingTop: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : spacing.md,
          }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
            }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                {/* Кнопка назад */}
                <Pressable
                  onPress={() => router.back()}
                  style={{
                    width: isVerySmallScreen ? 36 : isSmallScreen ? 40 : 44,
                    height: isVerySmallScreen ? 36 : isSmallScreen ? 40 : 44,
                    borderRadius: isVerySmallScreen ? 18 : isSmallScreen ? 20 : 22,
                    backgroundColor: Colors.surface,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
                    ...Shadows.card,
                  }}
                >
                  <Ionicons 
                    name="arrow-back" 
                    size={isVerySmallScreen ? 18 : isSmallScreen ? 20 : 24} 
                    color={Colors.textPrimary} 
                  />
                </Pressable>

                <View style={{ flex: 1 }}>
                  <ThemedText style={{ 
                    ...Typography.displayH1, 
                    color: Colors.textPrimary,
                    fontSize: isVerySmallScreen ? fontSize.header : isSmallScreen ? 22 : Typography.displayH1.fontSize,
                    marginBottom: isVerySmallScreen ? 2 : isSmallScreen ? 4 : 6,
                  }}>
                    Управление пользователями
                  </ThemedText>
                  <ThemedText style={{ 
                    ...Typography.body, 
                    color: Colors.textSecondary,
                    fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? fontSize.body : Typography.body.fontSize
                  }}>
                    {users.length} {users.length === 1 ? 'пользователь' : users.length < 5 ? 'пользователя' : 'пользователей'} в системе
                  </ThemedText>
                </View>
              </View>

              {/* Компактная кнопка добавления */}
              <Pressable
                onPress={handleToggleCreateForm}
                style={{
                  width: isVerySmallScreen ? 44 : isSmallScreen ? 46 : 48,
                  height: isVerySmallScreen ? 44 : isSmallScreen ? 46 : 48,
                  borderRadius: isVerySmallScreen ? 22 : isSmallScreen ? 23 : 24,
                  backgroundColor: Colors.brandPrimary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  ...Shadows.card,
                }}
              >
                <Ionicons 
                  name={showCreateForm ? "close" : "add"} 
                  size={isVerySmallScreen ? 20 : isSmallScreen ? 22 : 24} 
                  color={Colors.surface} 
                />
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* Основная кнопка добавления пользователя */}
        {!showCreateForm && (
          <Animated.View entering={FadeInDown.duration(500).delay(300)}>
            <View style={{ 
              flexDirection: 'row', 
              gap: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m, 
              marginBottom: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : Spacing.l 
            }}>
              <Pressable
                onPress={() => {
                  setShowCreateForm(true);
                  clearForm();
                }}
                style={{
                  flex: 1,
                  backgroundColor: Colors.brandPrimary,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : Spacing.l,
                  paddingHorizontal: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : Spacing.l,
                  borderRadius: isVerySmallScreen ? 10 : isSmallScreen ? 11 : Radius.card,
                  ...Shadows.card,
                }}
              >
                <Ionicons 
                  name="person-add" 
                  size={isVerySmallScreen ? 20 : isSmallScreen ? 22 : 24} 
                  color={Colors.surface} 
                  style={{ marginRight: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s }}
                />
                <ThemedText style={{
                  ...Typography.titleH2,
                  color: Colors.surface,
                  fontSize: isVerySmallScreen ? fontSize.body : isSmallScreen ? fontSize.title : Typography.titleH2.fontSize,
                }}>
                  Добавить
                </ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* Форма создания пользователя */}
        {showCreateForm && (
          <Animated.View entering={FadeInDown.duration(500).delay(200)}>
            <ThemedText style={{ 
              ...Typography.titleH2, 
              color: Colors.textPrimary, 
              marginBottom: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
              fontSize: isVerySmallScreen ? fontSize.title : isSmallScreen ? Typography.titleH2.fontSize : Typography.titleH2.fontSize
            }}>
              {editingUser ? 'Редактировать пользователя' : 'Создать нового пользователя'}
            </ThemedText>
          
          <View style={{
            backgroundColor: Colors.surface,
            borderRadius: isVerySmallScreen ? 10 : isSmallScreen ? 11 : Radius.card,
            padding: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.l,
            marginBottom: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : Spacing.l,
            ...Shadows.card,
          }}>
            {/* Имя и фамилия */}
            <View style={{ 
              flexDirection: isVerySmallScreen ? 'column' : 'row', 
              gap: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m, 
              marginBottom: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m 
            }}>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ 
                  ...Typography.body, 
                  color: Colors.textSecondary, 
                  marginBottom: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
                  fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? fontSize.body : Typography.body.fontSize
                }}>
                  Имя
                </ThemedText>
                <TextInput
                  value={firstName}
                  onChangeText={handleFirstNameChange}
                  placeholder="Введите имя"
                  style={{
                    backgroundColor: Colors.surfaceSubtle,
                    borderRadius: isVerySmallScreen ? 8 : isSmallScreen ? 10 : Radius.icon,
                    padding: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
                    fontSize: isVerySmallScreen ? fontSize.body : isSmallScreen ? 15 : 16,
                    color: Colors.textPrimary,
                    borderWidth: 1,
                    borderColor: Colors.strokeSoft,
                  }}
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <ThemedText style={{ 
                  ...Typography.body, 
                  color: Colors.textSecondary, 
                  marginBottom: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
                  fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? fontSize.body : Typography.body.fontSize
                }}>
                  Фамилия
                </ThemedText>
                <TextInput
                  value={lastName}
                  onChangeText={handleLastNameChange}
                  placeholder="Введите фамилию"
                  style={{
                    backgroundColor: Colors.surfaceSubtle,
                    borderRadius: isVerySmallScreen ? 8 : isSmallScreen ? 10 : Radius.icon,
                    padding: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
                    fontSize: isVerySmallScreen ? fontSize.body : isSmallScreen ? 15 : 16,
                    color: Colors.textPrimary,
                    borderWidth: 1,
                    borderColor: Colors.strokeSoft,
                  }}
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
            </View>

            {/* Username */}
            <View style={{ 
              marginBottom: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m 
            }}>
              <ThemedText style={{ 
                ...Typography.body, 
                color: Colors.textSecondary, 
                marginBottom: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
                fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? fontSize.body : Typography.body.fontSize
              }}>
                Имя пользователя
              </ThemedText>
              <TextInput
                value={username}
                onChangeText={handleUsernameChange}
                placeholder="Введите имя пользователя"
                autoCapitalize="none"
                style={{
                  backgroundColor: Colors.surfaceSubtle,
                  borderRadius: isVerySmallScreen ? 8 : isSmallScreen ? 10 : Radius.icon,
                  padding: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
                  fontSize: isVerySmallScreen ? fontSize.body : isSmallScreen ? 15 : 16,
                  color: Colors.textPrimary,
                  borderWidth: 1,
                  borderColor: Colors.strokeSoft,
                }}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            {/* Email */}
            <View style={{ 
              marginBottom: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m 
            }}>
              <ThemedText style={{ 
                ...Typography.body, 
                color: Colors.textSecondary, 
                marginBottom: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
                fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? fontSize.body : Typography.body.fontSize
              }}>
                Email
              </ThemedText>
              <TextInput
                value={email}
                onChangeText={handleEmailChange}
                placeholder="Введите email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  backgroundColor: Colors.surfaceSubtle,
                  borderRadius: isVerySmallScreen ? 8 : isSmallScreen ? 10 : Radius.icon,
                  padding: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
                  fontSize: isVerySmallScreen ? fontSize.body : isSmallScreen ? 15 : 16,
                  color: Colors.textPrimary,
                  borderWidth: 1,
                  borderColor: Colors.strokeSoft,
                }}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            {/* Пароль - только для новых пользователей */}
            {!editingUser && (
              <View style={{ marginBottom: Spacing.m }}>
                <ThemedText style={{ 
                  ...Typography.body, 
                  color: Colors.textSecondary, 
                  marginBottom: Spacing.s,
                  fontSize: responsiveStyles.fontSize
                }}>
                  Пароль *
                </ThemedText>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Введите пароль (минимум 6 символов)"
                  secureTextEntry
                  autoComplete="new-password"
                  textContentType="newPassword"
                  style={{
                    backgroundColor: Colors.surfaceSubtle,
                    borderRadius: responsiveStyles.borderRadius,
                    padding: responsiveStyles.cardPadding,
                    fontSize: responsiveStyles.fontSize,
                    color: Colors.textPrimary,
                    borderWidth: 1,
                    borderColor: Colors.strokeSoft,
                  }}
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
            )}

            {/* Роль */}
            <View style={{ marginBottom: Spacing.l }}>
              <ThemedText style={{ 
                ...Typography.body, 
                color: Colors.textSecondary, 
                marginBottom: Spacing.s,
                fontSize: responsiveStyles.fontSize
              }}>
                Роль пользователя
              </ThemedText>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
                backgroundColor: Colors.surfaceSubtle,
                borderRadius: Radius.icon,
                padding: Spacing.m,
                borderWidth: 1,
                borderColor: Colors.strokeSoft,
              }}>
                {(['student', 'professor', 'admin'] as const).map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => handleRoleChange(r)}
                    style={{
                      backgroundColor: role === r ? Colors.brandPrimary : Colors.surface,
                      paddingHorizontal: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
                      paddingVertical: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
                      borderRadius: isVerySmallScreen ? 6 : isSmallScreen ? 8 : Radius.icon,
                      borderWidth: 1,
                      borderColor: role === r ? Colors.brandPrimary : Colors.strokeSoft,
                      ...Shadows.card,
                    }}
                  >
                    <ThemedText style={{
                      fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? fontSize.body : Typography.body.fontSize,
                      color: role === r ? Colors.surface : Colors.textPrimary,
                      fontWeight: role === r ? '600' : '400',
                    }}>
                      {r === 'admin' ? 'Администратор' : 
                       r === 'professor' ? 'Преподаватель' : 'Студент'}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
            
            {renderRoleSpecificFields()}

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
              }}>
                {isLoading 
                  ? (editingUser ? 'Обновляем...' : 'Создаем...') 
                  : (editingUser ? 'Обновить пользователя' : 'Создать пользователя')
                }
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>
        )}

        {/* Поиск и фильтры */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.surface,
            borderRadius: Radius.card,
            padding: Spacing.m,
            marginBottom: Spacing.l,
            ...Shadows.card,
          }}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} style={{ marginRight: Spacing.s }} />
            <TextInput
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Поиск пользователей..."
              style={{
                flex: 1,
                fontSize: 16,
                color: Colors.textPrimary,
              }}
              placeholderTextColor={Colors.textSecondary}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Фильтр по ролям */}
        <Animated.View entering={FadeInDown.duration(500).delay(500)}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: Spacing.l }}
            contentContainerStyle={{ paddingHorizontal: 2 }}
          >
            {(['all', 'student', 'professor', 'admin'] as const).map((filter) => (
              <Pressable
                key={filter}
                onPress={() => handleFilterRoleChange(filter)}
                style={{
                  backgroundColor: filterRole === filter ? Colors.brandPrimary : Colors.surface,
                  paddingHorizontal: Spacing.l,
                  paddingVertical: Spacing.s,
                  borderRadius: Radius.card,
                  marginRight: Spacing.s,
                  ...Shadows.card,
                }}
              >
                <ThemedText style={{
                  ...Typography.body,
                  color: filterRole === filter ? Colors.surface : Colors.textPrimary,
                }}>
                  {filter === 'all' ? 'Все' : 
                   filter === 'student' ? 'Студенты' :
                   filter === 'professor' ? 'Преподаватели' : 'Администраторы'}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Список пользователей */}
        <Animated.View entering={FadeInDown.duration(500).delay(600)}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
          }}>
            <ThemedText style={{ 
              ...Typography.titleH2, 
              color: Colors.textPrimary,
              fontSize: isVerySmallScreen ? fontSize.title : isSmallScreen ? Typography.titleH2.fontSize : Typography.titleH2.fontSize
            }}>
              Пользователи системы
            </ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ThemedText style={{ 
                ...Typography.body, 
                color: Colors.textSecondary, 
                marginRight: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
                fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? fontSize.body : Typography.body.fontSize
              }}>
                {filteredUsers.length} из {users.length}
              </ThemedText>
              <Pressable
                onPress={loadUsers}
                disabled={isLoadingUsers}
                style={{
                  backgroundColor: Colors.surface,
                  width: isVerySmallScreen ? 28 : isSmallScreen ? 30 : 32,
                  height: isVerySmallScreen ? 28 : isSmallScreen ? 30 : 32,
                  borderRadius: isVerySmallScreen ? 14 : isSmallScreen ? 15 : 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                  ...Shadows.card,
                }}
              >
                <Ionicons 
                  name="refresh" 
                  size={isVerySmallScreen ? 14 : isSmallScreen ? 15 : 16} 
                  color={isLoadingUsers ? Colors.textSecondary : Colors.brandPrimary} 
                />
              </Pressable>
            </View>
          </View>

          {isLoadingUsers ? (
            <View style={{
              backgroundColor: Colors.surface,
              borderRadius: isVerySmallScreen ? 10 : isSmallScreen ? 11 : Radius.card,
              padding: isVerySmallScreen ? spacing.lg : isSmallScreen ? spacing.xl : Spacing.xl,
              alignItems: 'center',
              ...Shadows.card,
            }}>
              <ActivityIndicator size="large" color={Colors.brandPrimary} />
              <ThemedText style={{ 
                ...Typography.body, 
                color: Colors.textSecondary, 
                marginTop: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
                textAlign: 'center',
                fontSize: isVerySmallScreen ? fontSize.body : isSmallScreen ? Typography.body.fontSize : Typography.body.fontSize
              }}>
                Загружаем пользователей...
              </ThemedText>
            </View>
          ) : filteredUsers.length === 0 ? (
            <View style={{
              backgroundColor: Colors.surface,
              borderRadius: isVerySmallScreen ? 10 : isSmallScreen ? 11 : Radius.card,
              padding: isVerySmallScreen ? spacing.lg : isSmallScreen ? spacing.xl : Spacing.xl,
              alignItems: 'center',
              ...Shadows.card,
            }}>
              <Ionicons 
                name="people-outline" 
                size={isVerySmallScreen ? 40 : isSmallScreen ? 44 : 48} 
                color={Colors.textSecondary} 
              />
              <ThemedText style={{ 
                ...Typography.titleH2, 
                color: Colors.textSecondary, 
                marginTop: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
                textAlign: 'center',
                fontSize: isVerySmallScreen ? fontSize.title : isSmallScreen ? Typography.titleH2.fontSize : Typography.titleH2.fontSize
              }}>
                {searchQuery || filterRole !== 'all' ? 'Пользователи не найдены' : 'Пока нет пользователей'}
              </ThemedText>
              <ThemedText style={{ 
                ...Typography.body, 
                color: Colors.textSecondary, 
                marginTop: Spacing.s,
                textAlign: 'center'
              }}>
                {searchQuery || filterRole !== 'all' 
                  ? 'Попробуйте изменить критерии поиска' 
                  : 'Создайте первого пользователя с помощью кнопки выше'}
              </ThemedText>
            </View>
          ) : (
            <View style={{ 
              gap: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.m 
            }}> 
              {filteredUsers.map((user, index) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={handleEditUser}
                  onToggleStatus={handleToggleUserStatus}
                  onDelete={handleDeleteUser}
                  onResetPassword={handleResetPassword}
                  animationDelay={index * 100}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Модальное окно сброса пароля */}
      <PasswordResetModal
        isVisible={showPasswordReset}
        user={resetPasswordUser}
        onClose={handleClosePasswordReset}
        onReset={confirmPasswordReset}
      />

      {/* Модальное окно подтверждения удаления */}
      <ConfirmationModal
        isVisible={showDeleteConfirm}
        title="Удалить пользователя"
        message={`Вы уверены, что хотите удалить пользователя "${userToDelete?.first_name} ${userToDelete?.last_name}"?\n\nЭто действие необратимо!`}
        confirmText="Удалить"
        cancelText="Отмена"
        isDangerous={true}
        onConfirm={confirmDeleteUser}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setUserToDelete(null);
        }}
      />
    </SafeAreaView>
  );
}