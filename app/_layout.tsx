import { store } from '@/store';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

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
    <Provider store={store}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar 
            style="light" 
            translucent={true}
            backgroundColor="transparent"
            hidden={Platform.OS === 'android'}
          />
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </ThemeProvider>
        </View>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
