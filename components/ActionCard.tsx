import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, Pressable, ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ThemedText } from './ThemedText';

interface ActionCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: ViewStyle;
  gradientColors?: readonly [string, string, ...string[]];
  iconColor?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActionCard({ 
  title, 
  icon, 
  onPress, 
  style, 
  gradientColors = ['#3B82F6', '#8B5CF6'],
  iconColor = '#FFFFFF' 
}: ActionCardProps) {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);
  const hovered = useSharedValue(0);
  const { isSmall, typography, spacing, borderRadius } = useResponsive();
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  const handlePressIn = () => {
    'worklet';
    scale.value = withSpring(0.95, {
      damping: 18,
      stiffness: 220,
      mass: 1,
    }); 
    pressed.value = withTiming(1, { duration: 160 });
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    'worklet';
    scale.value = withSpring(1.05, {
      damping: 18,
      stiffness: 220,
      mass: 1,
    }, () => {
      scale.value = withSpring(1, {
        damping: 18,
        stiffness: 220,
        mass: 1,
      });
    });
    pressed.value = withTiming(0, { duration: 240 });
  };

  const handleHoverIn = () => {
    'worklet';
    hovered.value = withTiming(1, { duration: 160 });
  };

  const handleHoverOut = () => {
    'worklet';
    hovered.value = withTiming(0, { duration: 160 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      hovered.value,
      [0, 1],
      [Platform.OS === 'android' ? 0 : 0.05, Platform.OS === 'android' ? 0 : 0.08]
    );

    return {
      transform: [{ scale: scale.value }],
      shadowOpacity,
      borderColor: Platform.OS === 'android' 
        ? colors.border // На Android всегда нейтральная граница
        : (pressed.value > 0.5 ? colors.primary : colors.border), // iOS - анимация
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const iconScale = interpolate(
      pressed.value,
      [0, 1],
      [1, 1.1]
    );

    return {
      transform: [{ scale: iconScale }],
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      style={[
        {
          flex: 1,
          minWidth: isSmall ? 120 : 140,
          maxWidth: isSmall ? 160 : 180,
          height: isSmall ? 110 : 130,
          borderRadius: borderRadius.lg,
          borderWidth: 1,
          // Оптимизированные тени для платформ
          ...Platform.select({
            android: {
              elevation: isSmall ? 2 : 3,
              shadowColor: 'transparent',
            },
            ios: {
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: isSmall ? 4 : 6,
              },
              shadowOpacity: 0.1,
              shadowRadius: isSmall ? 6 : 10,
              elevation: isSmall ? 4 : 8,
            },
            default: {
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: isSmall ? 4 : 6,
              },
              shadowOpacity: 0.1,
              shadowRadius: isSmall ? 6 : 10,
              elevation: isSmall ? 4 : 8,
            },
          }),
        },
        animatedStyle,
        style,
      ]}
    >
      {/* Фон карточки */}
      {Platform.OS === 'android' ? (
        // Android - простой фон
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
          }}
        />
      ) : (
        // iOS - красивый градиент
        <LinearGradient
          colors={gradientColors ?? ['#3B82F6', '#8B5CF6'] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: borderRadius.lg,
          }}
        />
      )}

      <Animated.View
        style={{
          flex: 1,
          padding: isSmall ? spacing.md : spacing.lg,
          borderRadius: borderRadius.lg,
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          overflow: 'hidden',
        }}
      >
        {/* Контент карточки */}
        <Animated.View style={iconStyle}>
          <Ionicons 
            name={icon} 
            size={isSmall ? 20 : 24} 
            color={Platform.OS === 'android' ? colors.primary : iconColor}
          />
        </Animated.View>
        
        <ThemedText
          style={{
            fontSize: typography.xs,
            lineHeight: typography.xs * 1.3,
            color: Platform.OS === 'android' ? colors.textSecondary : '#FFFFFF',
            letterSpacing: 0.3,
            textTransform: 'uppercase',
            textAlign: 'left',
            fontWeight: '600',
          }}
          numberOfLines={2}
        >
          {title}
        </ThemedText>
      </Animated.View>
    </AnimatedPressable>
  );
}
