import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AdminLayout() {
  const { theme } = useTheme();
  const themeColors = getThemeColors(theme === 'dark');
  
  return (
    <>
      <StatusBar 
        style={theme === 'dark' ? 'light' : 'dark'} 
        backgroundColor={themeColors.background} 
      />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: themeColors.surface,
          },
          headerTintColor: themeColors.text,
          headerTitleStyle: {
            color: themeColors.text,
          },
        }}
      >
        <Stack.Screen 
          name="news" 
          options={{ 
            headerShown: false // Отключаем автоматический заголовок
          }} 
        />
        <Stack.Screen 
          name="events" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="users" 
          options={{ 
            headerShown: false 
          }} 
        />
      </Stack>
    </>
  );
}
