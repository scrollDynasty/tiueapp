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
      // ОПТИМИЗАЦИЯ: Если пользователь уже аутентифицирован в Redux, пропускаем все проверки
      if (isAuthenticated) {
        setIsInitializing(false);
        return;
      }

      // ОПТИМИЗАЦИЯ: Параллельно проверяем токен и валидность
      const token = await AsyncStorage.getItem('authToken');

      if (token) {
        // Запускаем проверку статуса, но не ждем её завершения для быстрой загрузки
        dispatch(checkAuthStatus()).then((result) => {
          // Если проверка провалилась, перенаправляем на логин
          if (checkAuthStatus.rejected.match(result)) {
            router.replace('/login');
          }
        });
      } else {
        // Токена нет, перенаправляем на логин
        router.replace('/login');
      }
    } catch (error) {
      // При ошибке просто перенаправляем на логин
      router.replace('/login');
    } finally {
      initializingRef.current = false;
      setIsInitializing(false);
    }
  }, [dispatch, isAuthenticated]);


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
