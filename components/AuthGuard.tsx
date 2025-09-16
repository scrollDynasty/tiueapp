import { Colors } from '@/constants/DesignTokens';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { checkAuthStatus } from '@/store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useSegments } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const segments = useSegments();
  
  // Используем ref для предотвращения дублированных вызовов
  const initializingRef = React.useRef(false);
  
  // Публичные маршруты, которые не требуют аутентификации
  const publicRoutes = ['login', 'debug'];
  const currentRoute = segments[0]; // Получаем первый сегмент маршрута
  const isPublicRoute = publicRoutes.includes(currentRoute);

  const initializeAuth = useCallback(async () => {
    if (initializingRef.current) {
      return; // Предотвращаем дублированные вызовы
    }
    
    initializingRef.current = true;
    try {
      // Если пользователь уже аутентифицирован в Redux, не проверяем AsyncStorage
      if (isAuthenticated) {
        setIsInitializing(false);
        return;
      }

      const token = await AsyncStorage.getItem('authToken');

      if (token) {
        // Проверяем валидность токена
        const result = await dispatch(checkAuthStatus());

        // Если проверка провалилась, очищаем токен и перенаправляем
        if (checkAuthStatus.rejected.match(result)) {
          await AsyncStorage.removeItem('authToken');
          router.replace('/login');
        }
      } else {
        // Токена нет, перенаправляем на логин
        router.replace('/login');
      }
    } catch (error) {
      // Очищаем AsyncStorage при ошибке
      await AsyncStorage.clear();
      router.replace('/login');
    } finally {
      initializingRef.current = false;
      setIsInitializing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    // Запускаем только один раз при первой загрузке
    if (!isInitializing) return;

    // Если это публичный маршрут, не проверяем аутентификацию
    if (isPublicRoute) {
      setIsInitializing(false);
      return;
    }

    initializeAuth();
  }, [isInitializing, isPublicRoute, initializeAuth]);

  useEffect(() => {
    if (!isInitializing && !loading && !isAuthenticated && !isPublicRoute) {
      router.replace('/login');
    }
  }, [isAuthenticated, isInitializing, loading, isPublicRoute]);

  // Для публичных маршрутов всегда показываем контент
  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (isInitializing || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brandPrimary} />
      </View>
    );
  }

  if (!isAuthenticated && !isPublicRoute) {
    return null; // Роутер автоматически перенаправит на логин
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
});
