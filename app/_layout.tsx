import AuthGuard from '@/components/AuthGuard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SplashScreen } from '@/components/SplashScreen';
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
ExpoSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = React.useState(true);
  
  const { enableImmersiveMode, reactivateImmersiveMode } = useImmersiveMode();

  useEffect(() => {
    // Настраиваем StatusBar для iOS
    if (Platform.OS === 'ios') {
      RNStatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content', true);
    }
    
    // Дополнительная активация immersive режима после загрузки приложения
    const timer = setTimeout(() => {
      enableImmersiveMode();
    }, 1000);

    // Отключаем переактивацию - оставляем immersive режим постоянно активным
    // const backupTimer = setTimeout(() => {
    //   reactivateImmersiveMode();
    // }, 3000);

    return () => {
      clearTimeout(timer);
      // clearTimeout(backupTimer); // Больше не используется
    };
  }, [enableImmersiveMode, reactivateImmersiveMode, colorScheme]);

  const handleSplashFinish = React.useCallback(async () => {
    // Скрываем нативный splash screen когда заканчивается кастомный
    await ExpoSplashScreen.hideAsync();
    setShowSplash(false);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            {showSplash ? (
              <SplashScreen onAnimationFinish={handleSplashFinish} />
            ) : (
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
            )}
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