import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
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
  );
}
