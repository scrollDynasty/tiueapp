import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Pressable, View } from 'react-native';
import Animated, {
  SlideInLeft,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Animation, Colors, Spacing } from '../constants/DesignTokens';
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
      colors={['#FFFFFF', '#F8FAFF', '#EEF4FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        shadowColor: Colors.shadowUmbra,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 5,
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
        <Animated.View 
          entering={SlideInLeft.duration(600).delay(100)}
          style={{ 
            flex: 1, 
            paddingVertical: 16,
            paddingRight: 20,
          }}
        >
          <View
            style={{
              backgroundColor: 'rgba(74, 144, 226, 0.08)',
              borderRadius: isVerySmallScreen ? 12 : 16,
              padding: isVerySmallScreen ? 12 : 16,
              borderLeftWidth: isVerySmallScreen ? 3 : 4,
              borderLeftColor: Colors.brandPrimary,
            }}
          >
            {/* Заголовок "Добро пожаловать" */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: isVerySmallScreen ? 4 : 6 }}>
              <Ionicons 
                name="sunny" 
                size={isVerySmallScreen ? 14 : 16} 
                color={Colors.brandPrimary} 
                style={{ marginRight: isVerySmallScreen ? 4 : 6 }}
              />
              <ThemedText
                style={{
                  fontSize: isVerySmallScreen ? 12 : 14,
                  fontWeight: '600',
                  color: Colors.textSecondary,
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
                fontWeight: '700',
                color: Colors.textPrimary,
                letterSpacing: -0.3,
                lineHeight: isVerySmallScreen ? 22 : 26,
              }}
            >
              {userName}
              <ThemedText style={{ fontSize: isVerySmallScreen ? 18 : 22 }}> 👋</ThemedText>
            </ThemedText>
          </View>
        </Animated.View>

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
          <Animated.View style={bellAnimatedStyle}>
            <Ionicons 
              name="notifications-outline" 
              size={isVerySmallScreen ? 24 : 28} 
              color={Colors.textPrimary} 
            />
          </Animated.View>
          
          {notificationCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                backgroundColor: Colors.brandPrimary,
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
                  fontWeight: '600',
                  color: Colors.surface,
                }}
              >
                {notificationCount > 99 ? '99+' : notificationCount.toString()}
              </ThemedText>
            </View>
          )}
        </Pressable>

        {/* Аватар */}
        <Animated.View entering={ZoomIn.duration(400).delay(200)}>
          <Pressable onPress={onAvatarPress}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{
                  width: isVerySmallScreen ? 40 : 48,
                  height: isVerySmallScreen ? 40 : 48,
                  borderRadius: isVerySmallScreen ? 20 : 24,
                  borderWidth: 1,
                  borderColor: Colors.strokeSoft,
                }}
              />
            ) : (
              <View
                style={{
                  width: isVerySmallScreen ? 40 : 48,
                  height: isVerySmallScreen ? 40 : 48,
                  borderRadius: isVerySmallScreen ? 20 : 24,
                  backgroundColor: Colors.brandPrimary10,
                  borderWidth: 1,
                  borderColor: Colors.strokeSoft,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons 
                  name="person" 
                  size={isVerySmallScreen ? 20 : 24} 
                  color={Colors.brandPrimary} 
                />
              </View>
            )}
          </Pressable>
        </Animated.View>
        </View>
      </View>
    </LinearGradient>
  );
}
