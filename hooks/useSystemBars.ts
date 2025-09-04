import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useSystemBars() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Скрываем системную навигацию полностью
      NavigationBar.setVisibilityAsync('hidden');
      // Делаем её прозрачной
      NavigationBar.setBackgroundColorAsync('transparent');
      // Настраиваем поведение - показывается по свайпу
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, []);

  // Возвращаем безопасные отступы
  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
  };
}
