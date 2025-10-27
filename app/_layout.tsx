import AuthGuard from '@/components/AuthGuard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useImmersiveMode } from '@/hooks/useSystemBars';
import { store } from '@/store';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';

import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

// Предотвращаем автоматическое скрытие нативного splash screen
ExpoSplashScreen.preventAutoHideAsync().catch(() => {
  // Игнорируем ошибку если splash screen уже был скрыт
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // Загружаем шрифты асинхронно без блокировки рендера
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  const [appReady, setAppReady] = React.useState(false);
  
  const { enableImmersiveMode } = useImmersiveMode();

  useEffect(() => {
    // Настраиваем StatusBar для iOS без анимации для быстрого применения
    if (Platform.OS === 'ios') {
      RNStatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content', false);
    }
    
    // Активируем immersive режим сразу
    enableImmersiveMode();
  }, [enableImmersiveMode, colorScheme]);

  // Быстрая инициализация приложения
  useEffect(() => {
    const initApp = async () => {
      if (!loaded) return;
      
      try {
        // ОПТИМИЗАЦИЯ: Удаляем проверку AsyncStorage и сразу показываем контент
        // Пользователь предпочитает быструю загрузку вместо анимации splash
        await ExpoSplashScreen.hideAsync();
        setAppReady(true);
      } catch {
        // При ошибке сразу показываем контент
        setAppReady(true);
      }
    };
    
    initApp();
  }, [loaded]);


  // Показываем loader пока приложение не готово (вместо null)
  if (!loaded || !appReady) {
    return (
      <View style={styles.container}>
        {/* Пустой контейнер вместо null для сохранения структуры хуков */}
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <View style={styles.container}>
              <StatusBar 
                style={colorScheme === 'dark' ? 'light' : 'dark'}
                backgroundColor="transparent"
                translucent={true}
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