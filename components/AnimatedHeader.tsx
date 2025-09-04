import { Ionicons } from '@expo/vector-icons';
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
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.l,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.l,
      }}
    >
      {/* Приветствие */}
      <Animated.View entering={SlideInLeft.duration(400)} style={{ flex: 1 }}>
        <ThemedText
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: '#1E1E1E',
            fontFamily: 'Inter',
          }}
        >
          Добро пожаловать, {userName}
        </ThemedText>
      </Animated.View>

      {/* Правая часть с уведомлениями и аватаром */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
              size={24} 
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
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: Colors.strokeSoft,
                }}
              />
            ) : (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: Colors.brandPrimary10,
                  borderWidth: 1,
                  borderColor: Colors.strokeSoft,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons 
                  name="person" 
                  size={20} 
                  color={Colors.brandPrimary} 
                />
              </View>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
