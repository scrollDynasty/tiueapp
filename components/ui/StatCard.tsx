import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { statCardStyles } from '@/styles/components/card';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  subtitle?: string;
  gradient?: string[];
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle,
  gradient,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const iconColor = color || colors.primary;

  return (
    <Card gradient={gradient} style={statCardStyles.container}>
      <View style={statCardStyles.header}>
        <Ionicons 
          name={icon} 
          size={24} 
          color={gradient ? '#fff' : iconColor} 
          style={statCardStyles.icon}
        />
        <ThemedText 
          style={[statCardStyles.title, { color: gradient ? '#fff' : colors.textSecondary }]}
        >
          {title}
        </ThemedText>
      </View>
      <ThemedText 
        style={[statCardStyles.value, { color: gradient ? '#fff' : colors.text }]}
      >
        {value}
      </ThemedText>
      {subtitle && (
        <ThemedText 
          style={[statCardStyles.subtitle, { color: gradient ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}
        >
          {subtitle}
        </ThemedText>
      )}
    </Card>
  );
};
