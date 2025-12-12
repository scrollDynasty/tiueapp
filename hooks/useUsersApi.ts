import { authApi } from '@/services/api';
import { UserProfile } from '@/types';
import { showToast } from '@/utils/toast';
import React from 'react';

export const useUsersApi = () => {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const isMountedRef = React.useRef(true);

  const handleApiError = (error: any, operation: string) => {
    console.error(`${operation} error:`, error);
    const message =
      error?.response?.data?.message ||
      error?.message ||
      `Произошла ошибка при ${operation.toLowerCase()}`;
    showToast(`Ошибка: ${message}`);
  };

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
        if (attempt === maxRetries) break;

        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            if (isMountedRef.current) {
              resolve(void 0);
            } else {
              reject(new Error('Component unmounted'));
            }
          }, delay * attempt);

          if (!isMountedRef.current) {
            clearTimeout(timer);
            reject(new Error('Component unmounted'));
          }
        });
      }
    }
    throw lastError;
  }, []);

  const loadUsers = React.useCallback(async () => {
    if (!isMountedRef.current) return;
    setIsLoading(true);
    try {
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
  }, [executeWithRetry]);

  React.useEffect(() => {
    isMountedRef.current = true;
    loadUsers();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadUsers]);

  const createUser = async (userData: Partial<UserProfile>) => {
    try {
      const response = await executeWithRetry(() => authApi.createUser(userData));
      if (response.success && response.data) {
        showToast('Пользователь создан');
        await loadUsers();
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

  const deleteUser = async (userId: string) => {
    try {
      const response = await executeWithRetry(() => authApi.deleteUser(userId));
      if (response.success !== false) {
        showToast('Пользователь удален');
        await loadUsers();
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

  const resetPassword = async (userId: string, newPassword: string) => {
    try {

        const response = await executeWithRetry(() => authApi.updateUser(userId, { password: newPassword } as any));
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

  };
};
