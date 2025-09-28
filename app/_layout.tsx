import AuthGuard from '@/components/AuthGuard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SplashScreen } from '@/components/SplashScreen';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useImmersiveMode } from '@/hooks/useSystemBars';
import { store } from '@/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Загружаем шрифты асинхронно без блокировки рендера
const fontLoadPromise = useFonts({
  SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = fontLoadPromise;
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
        // Проверяем показывался ли splash в этой сессии
        const hasShownSplash = await AsyncStorage.getItem('splashShownInSession');
        
        if (hasShownSplash === 'true') {
          // Сразу скрываем splash и показываем контент
          await ExpoSplashScreen.hideAsync();
          setAppReady(true);
        } else {
          // Показываем кастомный splash максимум на 1.5 секунды
          setTimeout(async () => {
            await AsyncStorage.setItem('splashShownInSession', 'true');
            await ExpoSplashScreen.hideAsync();
            setAppReady(true);
          }, 1500);
        }
      } catch {
        // При ошибке сразу показываем контент
        await ExpoSplashScreen.hideAsync();
        setAppReady(true);
      }
    };
    
    initApp();
  }, [loaded]);


  // Показываем null пока приложение не готово
  if (!loaded || !appReady) {
    return null;
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