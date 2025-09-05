import { Colors } from '@/constants/DesignTokens';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { checkAuthStatus } from '@/store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (token) {
        // Проверяем валидность токена
        await dispatch(checkAuthStatus());
      } else {
        // Токена нет, перенаправляем на логин
        router.replace('/login');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      router.replace('/login');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (!isInitializing && !loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isInitializing, loading]);

  if (isInitializing || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brandPrimary} />
      </View>
    );
  }

  if (!isAuthenticated) {
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
