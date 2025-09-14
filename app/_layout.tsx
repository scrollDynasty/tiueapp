import { store } from '@/store';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import AuthGuard from '@/components/AuthGuard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useImmersiveMode } from '@/hooks/useSystemBars';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  const { enableImmersiveMode, reactivateImmersiveMode } = useImmersiveMode();

  useEffect(() => {
    // Дополнительная активация immersive режима после загрузки приложения
    const timer = setTimeout(() => {
      enableImmersiveMode();
    }, 1000);

    // Дополнительная переактивация через 3 секунды (на случай если что-то пошло не так)
    const backupTimer = setTimeout(() => {
      reactivateImmersiveMode();
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(backupTimer);
    };
  }, [enableImmersiveMode, reactivateImmersiveMode]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <SafeAreaProvider>
            <View style={styles.container}>
              <StatusBar 
                style="light" 
                translucent={true}
                backgroundColor="transparent"
                hidden={Platform.OS === 'android'}
              />
              <ErrorBoundary onError={(error, errorInfo) => {
                // В продакшене можно отправить в систему мониторинга
                if (__DEV__) {
                  console.error('🚨 App Error:', error);
                }
              }}>
                <AuthGuard>
                  <Stack screenOptions={{
                    headerShown: false,
                    ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
                  }}>
                    <Stack.Screen name="login" options={{ headerShown: false }} />
                    <Stack.Screen name="debug" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="news" options={{ headerShown: false }} />
                    <Stack.Screen name="events" options={{ headerShown: false }} />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                </AuthGuard>
              </ErrorBoundary>
            </View>
          </SafeAreaProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});