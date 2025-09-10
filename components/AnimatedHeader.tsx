import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Pressable, View } from 'react-native';
import {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { Animation, Spacing } from '../constants/DesignTokens';
import { useResponsive } from '../hooks/useResponsive';
import { ThemedText } from './ThemedText';

interface HeaderProps {
  userName: string;
  avatarUrl?: string;
  notificationCount?: number;
  onAvatarPress?: () => void;
  onNotificationPress?: () => void;
}

export function AnimatedHeader({ 
  userName, 
  avatarUrl, 
  notificationCount = 0,
  onAvatarPress,
  onNotificationPress 
}: HeaderProps) {
  const { isVerySmallScreen } = useResponsive();
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const bellScale = useSharedValue(1);

  const handleBellPress = () => {
    'worklet';
    bellScale.value = withSpring(1.2, Animation.spring, () => {
      bellScale.value = withSpring(1, Animation.spring);
    });
  };

  const bellAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: bellScale.value }],
    };
  });

  return (
    <LinearGradient
      colors={['transparent', 'transparent']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        shadowColor: 'transparent',
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      }}
    >
            <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: Spacing.l,
          paddingTop: Spacing.xl,
          paddingBottom: Spacing.m,
        }}
      >
        {/* Приветствие */}
        <View 
          style={{ 
            flex: 1, 
            paddingVertical: 16,
            paddingRight: 20,
          }}
        >
          <View
            style={{
              backgroundColor: 'transparent',
              borderRadius: 0,
              padding: 0,
              borderLeftWidth: 0,
              borderLeftColor: 'transparent',
            }}
          >
            {/* Заголовок "Добро пожаловать" */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: isVerySmallScreen ? 4 : 6 }}>
              <Ionicons 
                name="sunny" 
                size={isVerySmallScreen ? 14 : 16} 
                color={colors.primary} 
                style={{ marginRight: isVerySmallScreen ? 4 : 6 }}
              />
              <ThemedText
                style={{
                  fontSize: isVerySmallScreen ? 12 : 14,
                  color: colors.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Добро пожаловать
              </ThemedText>
            </View>
            
            {/* Имя пользователя */}
            <ThemedText
              style={{
                fontSize: isVerySmallScreen ? 18 : 22,
                color: colors.text,
                letterSpacing: -0.3,
                lineHeight: isVerySmallScreen ? 22 : 26,
              }}
            >
              {userName}
              <ThemedText style={{ fontSize: isVerySmallScreen ? 18 : 22 }}> 👋</ThemedText>
            </ThemedText>
          </View>
        </View>

        {/* Правая часть с уведомлениями и аватаром */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          paddingTop: 8,
        }}>
        {/* Колокольчик с счётчиком */}
        <Pressable
          onPress={() => {
            handleBellPress();
            onNotificationPress?.();
          }}
          style={{
            marginRight: Spacing.m,
            position: 'relative',
          }}
        >
          <View>
            <Ionicons 
              name="notifications-outline" 
              size={isVerySmallScreen ? 24 : 28} 
              color={colors.text} 
            />
          </View>
          
          {notificationCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                backgroundColor: colors.primary,
                borderRadius: 8,
                minWidth: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 4,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 10,
                  color: colors.surface,
                }}
              >
                {notificationCount > 99 ? '99+' : notificationCount.toString()}
              </ThemedText>
            </View>
          )}
        </Pressable>

        {/* Аватар */}
        <View>
          <Pressable onPress={onAvatarPress}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{
                  width: isVerySmallScreen ? 40 : 48,
                  height: isVerySmallScreen ? 40 : 48,
                  borderRadius: isVerySmallScreen ? 20 : 24,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />
            ) : (
              <View
                style={{
                  width: isVerySmallScreen ? 40 : 48,
                  height: isVerySmallScreen ? 40 : 48,
                  borderRadius: isVerySmallScreen ? 20 : 24,
                  backgroundColor: `${colors.primary}20`,
                  borderWidth: 1,
                  borderColor: colors.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons 
                  name="person" 
                  size={isVerySmallScreen ? 20 : 24} 
                  color={colors.primary} 
                />
              </View>
            )}
          </Pressable>
        </View>
        </View>
      </View>
    </LinearGradient>
  );
}
