import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SHADOWS, SIZES, SPACING } from '@/styles/global';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: [string, string, ...string[]];
  padding?: number;
  margin?: number;
  elevation?: keyof typeof SHADOWS;
  borderRadius?: number;
  animated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  gradient,
  padding = SPACING.lg,
  margin = SPACING.sm,
  elevation = 'medium',
  borderRadius = SIZES.border.large,
  animated = false,
}) => {
  const colorScheme = useColorScheme();
  
  const cardStyle: ViewStyle = {
    backgroundColor: colorScheme === 'dark' ? Colors.dark.surface : Colors.light.surface,
    borderRadius,
    padding,
    margin,
    ...SHADOWS[elevation],
    // Современный дизайн с небольшой границей
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: colorScheme === 'dark' ? Colors.dark.border : Colors.light.border,
    // Добавляем трансформацию для анимации
    ...(animated && {
      transform: [{ scale: 1 }],
    }),
    ...style,
  };

  if (gradient) {
    return (
      <LinearGradient 
        colors={gradient} 
        style={cardStyle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};
