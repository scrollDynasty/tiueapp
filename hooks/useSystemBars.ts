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

      // Пробуем разные методы скрытия навигационной панели
      try {
        // Метод 1: react-native-system-navigation-bar
        if (SystemNavigationBar && SystemNavigationBar.immersive) {
          await SystemNavigationBar.immersive();
        } else {
        }
      } catch (systemNavError) {
      }
      
      try {
        // Метод 2: expo-navigation-bar
        await NavigationBar.setVisibilityAsync('hidden');
      } catch (expoNavError) {
      }
      
      try {
        // Метод 3: Дополнительные настройки
        if (SystemNavigationBar && SystemNavigationBar.navigationHide) {
          await SystemNavigationBar.navigationHide();
        }
      } catch (hiddenError) {
      }
      
      // Настраиваем статус бар
      StatusBar.setStatusBarStyle('light');
      
      isImmersiveActive.current = true;
    } catch (error) {
      
      // Fallback - пробуем только expo-navigation-bar
      try {
        await NavigationBar.setVisibilityAsync('hidden');
      } catch (fallbackError) {
        console.warn('❌ Fallback также не сработал:', fallbackError);
        // Последний fallback - устанавливаем позицию
        try {
          await NavigationBar.setPositionAsync('absolute');
          await NavigationBar.setBackgroundColorAsync('#00000000');
        } catch (finalError) {
          console.warn('❌ Все методы не сработали:', finalError);
        }
      }
    }
  }, []);

  // Функция для автоскрытия через 3 секунды
  const scheduleAutoHide = useCallback(() => {
    
    if (autoHideTimer.current) {
      clearTimeout(autoHideTimer.current);
    }
    
    autoHideTimer.current = setTimeout(() => {
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
      
      // НЕ запускаем таймер автоскрытия - оставляем панель скрытой постоянно
      // scheduleAutoHide();
    } catch (error) {
      console.warn('❌ Ошибка деактивации immersive режима:', error);
    }
  }, [scheduleAutoHide]);

  // Обработчик изменения состояния приложения
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    
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
    let checkInterval: ReturnType<typeof setInterval> | null = null;
    
    const handleNavigationVisibilityChange = async () => {
      try {
        const visibility = await NavigationBar.getVisibilityAsync();
        
        // Логируем только при изменении состояния
        if (visibility !== lastVisibility) {
          lastVisibility = visibility;
          
          if (visibility === 'visible' && isImmersiveActive.current) {
            // Навигация стала видимой - НЕ запускаем автоскрытие, оставляем как есть
            isImmersiveActive.current = false;
            // scheduleAutoHide(); // Отключено для постоянного immersive режима
          }
        }
      } catch (error) {
        // Убираем логирование ошибок для уменьшения спама
      }
    };

    // Оптимизированная частота проверки - 2 секунды для экономии батареи
    checkInterval = setInterval(handleNavigationVisibilityChange, 2000);

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
      // Очищаем все refs при размонтировании
      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
        autoHideTimer.current = null;
      }
      isImmersiveActive.current = false;
    };
  }, [scheduleAutoHide]);

  // Основной useEffect для настройки immersive режима
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    let initTimer: ReturnType<typeof setTimeout> | null = null;
    
    // Активируем immersive режим при запуске с задержкой
    initTimer = setTimeout(() => {
      enableImmersiveMode();
      initTimer = null;
    }, 1000);

    // Cleanup
    return () => {
      if (subscription?.remove) {
        subscription.remove();
      } else if ('removeEventListener' in AppState) {
        // Fallback для старых версий React Native
        (AppState as any).removeEventListener('change', handleAppStateChange);
      }
      
      if (initTimer) {
        clearTimeout(initTimer);
        initTimer = null;
      }
      
      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
        autoHideTimer.current = null;
      }
    };
  }, [enableImmersiveMode, handleAppStateChange]);

  return {
    enableImmersiveMode,
    disableImmersiveMode,
    reactivateImmersiveMode: () => {}, // Отключено - не перезапускаем автоскрытие
    isImmersiveActive: isImmersiveActive.current,
  };
};
