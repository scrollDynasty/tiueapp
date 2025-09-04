import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { INTERACTIVE, SHADOWS, SPACING, wp } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, TouchableOpacity, ViewStyle } from 'react-native';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  size?: number;
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = 'add',
  color,
  size = wp(14),
  style,
}) => {
  const colorScheme = useColorScheme();
  const animatedValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const backgroundColor = color || Colors[colorScheme ?? 'light'].primary;

  const fabStyle: ViewStyle = {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.md,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.large,
    zIndex: 1000,
    ...style,
  };

  return (
    <Animated.View
      style={[
        fabStyle,
        {
          transform: [{ scale: animatedValue }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={INTERACTIVE.touchable.activeOpacity}
        style={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: size / 2,
        }}
      >
        <Ionicons
          name={icon}
          size={size * 0.4}
          color="#ffffff"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};
