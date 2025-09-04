import * as NavigationBar from 'expo-navigation-bar';
import * as StatusBar from 'expo-status-bar';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, BackHandler, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SystemNavigationBar from 'react-native-system-navigation-bar';

export const useImmersiveMode = () => {
  const appState = useRef(AppState.currentState);
  const isImmersiveActive = useRef(false);

  // Функция для включения immersive режима
  const enableImmersiveMode = useCallback(async () => {
    if (Platform.OS !== 'android') return;

    try {
      // Используем react-native-system-navigation-bar для максимальной совместимости
      await SystemNavigationBar.immersive();
      
      // Дополнительно используем expo-navigation-bar
      await NavigationBar.setVisibilityAsync('hidden');
      await NavigationBar.setBehaviorAsync('overlay-swipe');
      await NavigationBar.setBackgroundColorAsync('#00000000');
      
      // Настраиваем статус бар
      StatusBar.setStatusBarStyle('light');
      StatusBar.setStatusBarTranslucent(true);
      
      isImmersiveActive.current = true;
      console.log('✅ Immersive mode activated');
    } catch (error) {
      console.warn('❌ Ошибка активации immersive режима:', error);
      
      // Fallback для старых версий Android
      try {
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('overlay-swipe');
      } catch (fallbackError) {
        console.warn('❌ Fallback также не сработал:', fallbackError);
      }
    }
  }, []);

  // Функция для отключения immersive режима
  const disableImmersiveMode = useCallback(async () => {
    if (Platform.OS !== 'android') return;

    try {
      await SystemNavigationBar.navigationShow();
      await NavigationBar.setVisibilityAsync('visible');
      isImmersiveActive.current = false;
      console.log('✅ Immersive mode deactivated');
    } catch (error) {
      console.warn('❌ Ошибка деактивации immersive режима:', error);
    }
  }, []);

  // Функция для переактивации режима (при возврате из фона)
  const reactivateImmersiveMode = useCallback(() => {
    // Небольшая задержка для стабильности
    setTimeout(enableImmersiveMode, 100);
  }, [enableImmersiveMode]);

  useEffect(() => {
    // Активируем immersive режим при монтировании компонента
    enableImmersiveMode();

    // Обработчик изменения состояния приложения
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('📱 App state changed:', appState.current, '->', nextAppState);
      
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Приложение вернулось из фона - переактивируем immersive режим
        reactivateImmersiveMode();
      }
      
      appState.current = nextAppState;
    };

    // Обработчик кнопки "Назад" для предотвращения выхода из immersive режима
    const handleBackPress = () => {
      if (isImmersiveActive.current) {
        // Если immersive режим активен, переактивируем его после нажатия "Назад"
        setTimeout(enableImmersiveMode, 50);
      }
      return false; // Позволяем стандартное поведение кнопки "Назад"
    };

    // Подписываемся на события
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // Дополнительная переактивация через интервал (для особо упрямых случаев)
    const interval = setInterval(() => {
      if (appState.current === 'active' && !isImmersiveActive.current) {
        enableImmersiveMode();
      }
    }, 3000);

    // Cleanup функция
    return () => {
      clearInterval(interval);
      appStateSubscription?.remove();
      backHandler?.remove();
      // При размонтировании показываем системную навигацию обратно
      disableImmersiveMode();
    };
  }, [enableImmersiveMode, disableImmersiveMode, reactivateImmersiveMode]);

  return {
    enableImmersiveMode,
    disableImmersiveMode,
    reactivateImmersiveMode,
    isImmersiveActive: isImmersiveActive.current
  };
};

export function useSystemBars() {
  const insets = useSafeAreaInsets();

  // Возвращаем безопасные отступы
  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
  };
}
