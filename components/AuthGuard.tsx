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

  const initializingRef = React.useRef(false);

  const publicRoutes = ['login', 'debug'];
  const currentRoute = segments[0];
  const isPublicRoute = publicRoutes.includes(currentRoute);

  const initializeAuth = useCallback(async () => {
    if (initializingRef.current) {
      return;
    }

    initializingRef.current = true;
    try {

      if (isAuthenticated) {
        setIsInitializing(false);
        return;
      }

      const token = await AsyncStorage.getItem('authToken');

      if (token) {

        dispatch(checkAuthStatus()).then((result) => {

          if (checkAuthStatus.rejected.match(result)) {
            router.replace('/login');
          }
        });
      } else {

        router.replace('/login');
      }
    } catch (error) {

      router.replace('/login');
    } finally {
      initializingRef.current = false;
      setIsInitializing(false);
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {

    if (!isInitializing) return;

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
    return null;
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
