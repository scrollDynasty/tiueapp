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

  const enableImmersiveMode = useCallback(async () => {
    if (Platform.OS !== 'android') return;

    try {

      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
        autoHideTimer.current = null;
      }

      try {

        if (SystemNavigationBar && SystemNavigationBar.immersive) {
          await SystemNavigationBar.immersive();
        } else {
        }
      } catch (systemNavError) {
      }

      try {

        await NavigationBar.setVisibilityAsync('hidden');
      } catch (expoNavError) {
      }

      try {

        if (SystemNavigationBar && SystemNavigationBar.navigationHide) {
          await SystemNavigationBar.navigationHide();
        }
      } catch (hiddenError) {
      }

      StatusBar.setStatusBarStyle('light');

      isImmersiveActive.current = true;
    } catch (error) {

      try {
        await NavigationBar.setVisibilityAsync('hidden');
      } catch (fallbackError) {
        console.warn('❌ Fallback также не сработал:', fallbackError);

        try {
          await NavigationBar.setPositionAsync('absolute');
          await NavigationBar.setBackgroundColorAsync('#00000000');
        } catch (finalError) {
          console.warn('❌ Все методы не сработали:', finalError);
        }
      }
    }
  }, []);

  const scheduleAutoHide = useCallback(() => {

    if (autoHideTimer.current) {
      clearTimeout(autoHideTimer.current);
    }

    autoHideTimer.current = setTimeout(() => {
      enableImmersiveMode();
    }, 3000);
  }, [enableImmersiveMode]);

  const disableImmersiveMode = useCallback(async () => {
    if (Platform.OS !== 'android') return;

    try {
      await SystemNavigationBar.navigationShow();
      await NavigationBar.setVisibilityAsync('visible');

      isImmersiveActive.current = false;

    } catch (error) {
      console.warn('❌ Ошибка деактивации immersive режима:', error);
    }
  }, [scheduleAutoHide]);

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {

    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {

      setTimeout(() => {
        enableImmersiveMode();
      }, 500);
    }
    appState.current = nextAppState;
  }, [enableImmersiveMode]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let lastVisibility = 'hidden';
    let checkInterval: ReturnType<typeof setInterval> | null = null;

    const handleNavigationVisibilityChange = async () => {
      try {
        const visibility = await NavigationBar.getVisibilityAsync();

        if (visibility !== lastVisibility) {
          lastVisibility = visibility;

          if (visibility === 'visible' && isImmersiveActive.current) {

            isImmersiveActive.current = false;
          }
        }
      } catch (error) {

      }
    };

    checkInterval = setInterval(handleNavigationVisibilityChange, 5000);

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }

      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
        autoHideTimer.current = null;
      }
      isImmersiveActive.current = false;
    };
  }, [scheduleAutoHide]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    let initTimer: ReturnType<typeof setTimeout> | null = null;

    initTimer = setTimeout(() => {
      enableImmersiveMode();
      initTimer = null;
    }, 1000);

    return () => {
      if (subscription?.remove) {
        subscription.remove();
      } else if ('removeEventListener' in AppState) {

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
    reactivateImmersiveMode: () => {},
    isImmersiveActive: isImmersiveActive.current,
  };
};
