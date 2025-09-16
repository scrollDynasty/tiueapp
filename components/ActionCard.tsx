import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
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
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActionCard({ title, icon, onPress, style }: ActionCardProps) {
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
      [0.05, 0.08]
    );

    return {
      transform: [{ scale: scale.value }],
      shadowOpacity,
      borderColor: pressed.value > 0.5 ? colors.primary : colors.border,
    };
  });

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: pressed.value > 0.5 ? colors.backgroundSecondary : colors.surface,
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
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: isSmall ? 4 : 6,
          },
          shadowRadius: isSmall ? 6 : 10,
          elevation: isSmall ? 4 : 8,
        },
        animatedStyle,
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            padding: isSmall ? spacing.md : spacing.lg,
            borderRadius: borderRadius.lg,
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          },
          backgroundStyle,
        ]}
      >
        <Animated.View style={iconStyle}>
          <Ionicons 
            name={icon} 
            size={isSmall ? 20 : 24} 
            color={colors.primary}
          />
        </Animated.View>
        
        <ThemedText
          style={{
            fontSize: typography.xs,
            lineHeight: typography.xs * 1.3,
            color: colors.textSecondary,
            letterSpacing: 0.3,
            textTransform: 'uppercase',
            textAlign: 'left',
          }}
          numberOfLines={2}
        >
          {title}
        </ThemedText>
      </Animated.View>
    </AnimatedPressable>
  );
}
