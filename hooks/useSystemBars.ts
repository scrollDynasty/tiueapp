import * as NavigationBar from 'expo-navigation-bar';
import * as StatusBar from 'expo-status-bar';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';

export const useImmersiveMode = () => {
  const appState = useRef(AppState.currentState);
  const isImmersiveActive = useRef(false);
  const autoHideTimer = useRef<any>(null);
  const navigationVisibilityListener = useRef<any>(null);

  // Функция для включения immersive режима
  const enableImmersiveMode = useCallback(async () => {
    if (Platform.OS !== 'android') return;

    try {
      // Очищаем таймер если есть
      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
        autoHideTimer.current = null;
      }

      // Используем react-native-system-navigation-bar для максимальной совместимости
      await SystemNavigationBar.immersive();
      
      // Дополнительно используем expo-navigation-bar
      await NavigationBar.setVisibilityAsync('hidden');
      
      // Настраиваем статус бар
      StatusBar.setStatusBarStyle('light');
      
      isImmersiveActive.current = true;
      console.log('✅ Immersive mode activated');
    } catch (error) {
      console.warn('❌ Ошибка активации immersive режима:', error);
      
      // Fallback для старых версий Android
      try {
        await NavigationBar.setVisibilityAsync('hidden');
      } catch (fallbackError) {
        console.warn('❌ Fallback также не сработал:', fallbackError);
      }
    }
  }, []);

  // Функция для автоскрытия через 3 секунды
  const scheduleAutoHide = useCallback(() => {
    console.log('🔄 Запуск таймера автоскрытия (3 сек)');
    
    if (autoHideTimer.current) {
      clearTimeout(autoHideTimer.current);
    }
    
    autoHideTimer.current = setTimeout(() => {
      console.log('⏰ Таймер сработал - скрываем навигацию');
      enableImmersiveMode();
    }, 3000); // 3 секунды
  }, [enableImmersiveMode]);

  // Функция для отключения immersive режима
  const disableImmersiveMode = useCallback(async () => {
    if (Platform.OS !== 'android') return;

    try {
      await SystemNavigationBar.navigationShow();
      await NavigationBar.setVisibilityAsync('visible');
      
      isImmersiveActive.current = false;
      console.log('✅ Immersive mode deactivated');
      
      // Запускаем таймер автоскрытия
      scheduleAutoHide();
    } catch (error) {
      console.warn('❌ Ошибка деактивации immersive режима:', error);
    }
  }, [scheduleAutoHide]);

  // Обработчик изменения состояния приложения
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    console.log('📱 App state changed:', appState.current, '->', nextAppState);
    
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // Приложение стало активным - включаем immersive режим через небольшую задержку
      setTimeout(() => {
        enableImmersiveMode();
      }, 500);
    }
    appState.current = nextAppState;
  }, [enableImmersiveMode]);

  // Слушатель изменения видимости навигации
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let lastVisibility = 'hidden';
    
    const handleNavigationVisibilityChange = async () => {
      try {
        const visibility = await NavigationBar.getVisibilityAsync();
        
        // Логируем только при изменении состояния
        if (visibility !== lastVisibility) {
          console.log('🔍 Navigation visibility changed:', lastVisibility, '->', visibility);
          lastVisibility = visibility;
          
          if (visibility === 'visible' && isImmersiveActive.current) {
            // Навигация стала видимой - запускаем таймер автоскрытия
            isImmersiveActive.current = false;
            scheduleAutoHide();
          }
        }
      } catch (error) {
        // Убираем логирование ошибок для уменьшения спама
      }
    };

    // Уменьшаем частоту проверки до 500мс
    const checkInterval = setInterval(handleNavigationVisibilityChange, 500);

    return () => {
      clearInterval(checkInterval);
    };
  }, [scheduleAutoHide]);

  // Основной useEffect для настройки immersive режима
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Активируем immersive режим при запуске с задержкой
    setTimeout(() => {
      enableImmersiveMode();
    }, 1000);

    // Cleanup
    return () => {
      subscription?.remove();
      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
      }
    };
  }, [enableImmersiveMode, handleAppStateChange]);

  return {
    enableImmersiveMode,
    disableImmersiveMode,
    reactivateImmersiveMode: scheduleAutoHide,
    isImmersiveActive: isImmersiveActive.current,
  };
};
