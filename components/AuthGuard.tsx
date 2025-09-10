import { Colors } from '@/constants/DesignTokens';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { checkAuthStatus } from '@/store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const segments = useSegments();
  
  // Публичные маршруты, которые не требуют аутентификации
  const publicRoutes = ['login', 'debug'];
  const currentRoute = segments[0]; // Получаем первый сегмент маршрута
  const isPublicRoute = publicRoutes.includes(currentRoute);

  useEffect(() => {
    console.log('[AUTH_GUARD] useEffect triggered, route:', currentRoute, 'isAuthenticated:', isAuthenticated, 'isInitializing:', isInitializing);
    
    // Запускаем только один раз при первой загрузке
    if (!isInitializing) return;
    
    // Если это публичный маршрут, не проверяем аутентификацию
    if (isPublicRoute) {
      console.log('[AUTH_GUARD] Public route detected, skipping auth check');
      setIsInitializing(false);
      return;
    }
    
    initializeAuth();
  }, []); // Убираем зависимости, чтобы запускался только один раз

  const initializeAuth = async () => {
    console.log('[AUTH_GUARD] 🚀 Starting initialization...');
    
    try {
      // Если пользователь уже аутентифицирован в Redux, не проверяем AsyncStorage
      if (isAuthenticated) {
        console.log('[AUTH_GUARD] User already authenticated, skipping token check');
        setIsInitializing(false);
        return;
      }
      
      console.log('[AUTH_GUARD] 📱 Getting token from AsyncStorage...');
      const token = await AsyncStorage.getItem('authToken');
      console.log('[AUTH_GUARD] Checking stored token:', token ? `${token.substring(0, 10)}...` : 'No token');
      
      if (token) {
        // Проверяем валидность токена
        console.log('[AUTH_GUARD] 🔍 Checking auth status...');
        const result = await dispatch(checkAuthStatus());
        
        // Если проверка провалилась, очищаем токен и перенаправляем
        if (checkAuthStatus.rejected.match(result)) {
          console.log('[AUTH_GUARD] ❌ Auth check failed, clearing token and redirecting to login');
          await AsyncStorage.removeItem('authToken');
          router.replace('/login');
        } else {
          console.log('[AUTH_GUARD] ✅ Auth check successful');
        }
      } else {
        // Токена нет, перенаправляем на логин
        console.log('[AUTH_GUARD] ❌ No token found, redirecting to login');
        router.replace('/login');
      }
    } catch (error) {
      console.error('[AUTH_GUARD] 💥 Auth initialization error:', error);
      // Очищаем AsyncStorage при ошибке
      await AsyncStorage.clear();
      router.replace('/login');
    } finally {
      console.log('[AUTH_GUARD] 🏁 Initialization finished, setting isInitializing to false');
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (!isInitializing && !loading && !isAuthenticated && !isPublicRoute) {
      console.log('[AUTH_GUARD] Redirecting to login - not authenticated and not on public route');
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
