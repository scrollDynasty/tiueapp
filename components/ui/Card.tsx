import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { cardStyles } from '@/styles/components/card';
import { SHADOWS, SPACING } from '@/styles/global';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: string[];
  padding?: number;
  margin?: number;
  elevation?: keyof typeof SHADOWS;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  gradient,
  padding = SPACING.md,
  margin = SPACING.sm,
  elevation = 'small',
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const cardStyle = [
    cardStyles.card,
    {
      backgroundColor: colors.card,
      padding,
      margin,
      ...SHADOWS[elevation],
      shadowColor: colorScheme === 'dark' ? '#000' : '#000',
    },
    style,
  ];

  if (gradient) {
    return (
      <LinearGradient colors={gradient as any} style={cardStyle}>
        {children}
      </LinearGradient>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};
