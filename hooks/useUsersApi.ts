import { authApi } from '@/services/api';
import { UserProfile } from '@/types';
import { showToast } from '@/utils/toast';
import * as SecureStore from 'expo-secure-store';
import React from 'react';

// Этот хук инкапсулирует всю логику для работы с API пользователей
export const useUsersApi = () => {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const isMountedRef = React.useRef(true);

  // Безопасное получение токена
  const getSecureToken = React.useCallback(async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('CRITICAL: Could not get token from SecureStore.', error);
      return null;
    }
  }, []);

  // Обработка ошибок API
  const handleApiError = React.useCallback((error: any, operation: string) => {
    console.error(`${operation} error:`, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      `Произошла ошибка при ${operation.toLowerCase()}`;
    showToast(`Ошибка: ${message}`);
  }, []);

  // Выполнение запроса с логикой повторных попыток
  const executeWithRetry = React.useCallback(async (
    apiCall: () => Promise<any>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<any> => {
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (!isMountedRef.current) throw new Error('Component unmounted');
        return await apiCall();
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) break;
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    throw lastError;
  }, []);

  // Загрузка пользователей
  const loadUsers = React.useCallback(async () => {
    if (!isMountedRef.current) return;
    setIsLoading(true);
    try {
      const token = await getSecureToken();
      if (!token) throw new Error('No auth token');

      const response = await executeWithRetry(() => authApi.getUsers());
      if (isMountedRef.current && response.success && Array.isArray(response.data)) {
        setUsers(response.data);
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
        setIsLoading(false);
      }
    }
  }, [getSecureToken, executeWithRetry, handleApiError]);

  // Изначальная загрузка данных
  React.useEffect(() => {
    isMountedRef.current = true;
    loadUsers();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadUsers]);

  // Функция создания пользователя
  const createUser = async (userData: Partial<UserProfile>) => {
    try {
      const response = await executeWithRetry(() => authApi.createUser(userData));
      if (response.success && response.data) {
        showToast('Пользователь создан');
        await loadUsers(); // Перезагружаем список
        return true;
      } else {
        handleApiError(response, 'создании пользователя');
        return false;
      }
    } catch (error) {
      handleApiError(error, 'создании пользователя');
      return false;
    }
  };

  // Функция обновления пользователя
  const updateUser = async (userId: string, userData: Partial<UserProfile>) => {
    try {
      const response = await executeWithRetry(() => authApi.updateUser(userId, userData));
      if (response.success && response.data) {
        setUsers(prev => prev.map(u => (u.id === userId ? (response.data as UserProfile) : u)));
        showToast('Пользователь обновлен');
        return true;
      } else {
        handleApiError(response, 'обновлении пользователя');
        return false;
      }
    } catch (error) {
      handleApiError(error, 'обновлении пользователя');
      return false;
    }
  };
  
    // Функция удаления пользователя
  const deleteUser = async (userId: string) => {
    try {
      const response = await executeWithRetry(() => authApi.deleteUser(userId));
      if (response.success !== false) {
        showToast('Пользователь удален');
        await loadUsers(); // Перезагружаем список
        return true;
      } else {
        handleApiError(response, 'удалении пользователя');
        return false;
      }
    } catch (error) {
      handleApiError(error, 'удалении пользователя');
      return false;
    }
  };

  // Функция сброса пароля
  const resetPassword = async (userId: string, newPassword: string) => {
    try {
        // API должен поддерживать сброс пароля отдельным эндпоинтом или через updateUser
        // Здесь предполагается, что updateUser может принимать только пароль
        const response = await executeWithRetry(() => authApi.updateUser(userId, { password: newPassword }));
        if (response.success) {
            showToast('Пароль успешно изменен');
            return true;
        } else {
            handleApiError(response, 'сбросе пароля');
            return false;
        }
    } catch (error) {
        handleApiError(error, 'сбросе пароля');
        return false;
    }
  };

  return {
    users,
    isLoading,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    // sanitizeInput, // Если он нужен в компоненте, его тоже можно вынести в utils
  };
};
