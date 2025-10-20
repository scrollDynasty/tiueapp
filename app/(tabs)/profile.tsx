import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationModal } from '@/components/ConfirmationModal';
import { AdminProfile } from '@/components/profile/AdminProfile';
import { StudentProfile } from '@/components/profile/StudentProfile';
import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useResponsive } from '@/hooks/useResponsive';
import { clearCredentials, logoutUser } from '@/store/slices/authSlice';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const insets = useSafeAreaInsets();
  const { isSmallScreen, spacing, isVerySmallScreen } = useResponsive();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = React.useState(false);
  
  // Ref для отслеживания размонтирования компонента
  const isMountedRef = React.useRef(true);

  // Cleanup при размонтировании
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleLogout = React.useCallback(async () => {
    if (isMountedRef.current) {
      setIsLogoutModalVisible(true);
    }
  }, []);

  const performLogout = React.useCallback(async () => {
    // Закрываем модальное окно сразу
    if (isMountedRef.current) {
      setIsLogoutModalVisible(false);
    }
    
    try {
      await dispatch(logoutUser()).unwrap();
      await AsyncStorage.multiRemove(['userToken', 'userRole', 'userData']);
      dispatch(clearCredentials());
      router.replace('/login');
    } catch (error) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.error('❌ Logout error:', error);
      }
      // При ошибке показываем уведомление только если компонент еще смонтирован
      if (isMountedRef.current) {
        // Здесь можно добавить показ ошибки пользователю
        console.error('Не удалось выйти из системы');
      }
    }
  }, [dispatch]);

  const handleCancelLogout = React.useCallback(() => {
    if (isMountedRef.current) {
      setIsLogoutModalVisible(false);
    }
  }, []);

  // Ранний возврат если пользователя нет
  if (!user) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : spacing.lg,
          paddingBottom: Platform.OS === 'android'
            ? (isVerySmallScreen ? 80 : isSmallScreen ? 85 : 90) // Компактные отступы для Android
            : (isVerySmallScreen ? 140 : isSmallScreen ? 150 : 160), // Обычные для iOS
          paddingTop: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : spacing.md,
        }}
      >
        {/* Рендерим разные интерфейсы в зависимости от роли */}
        {user.role === 'admin' ? (
          <AdminProfile user={user} onLogout={handleLogout} />
        ) : (
          <StudentProfile user={user} onLogout={handleLogout} />
        )}
      </ScrollView>

      {/* Модальное окно подтверждения выхода */}
      <ConfirmationModal
        isVisible={isLogoutModalVisible}
        title="Выйти из аккаунта"
        message="Вы действительно хотите выйти из системы?"
        confirmText="Выйти"
        cancelText="Отмена"
        onConfirm={performLogout}
        onCancel={handleCancelLogout}
        isDangerous={true}
      />
    </View>
  );
}