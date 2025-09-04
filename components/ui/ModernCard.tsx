import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { hp, LAYOUT, SHADOWS, SIZES, SPACING, TYPOGRAPHY, wp } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface ModernCardProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  gradient?: [string, string];
  backgroundColor?: string;
  iconColor?: string;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outlined' | 'elevated';
  children?: React.ReactNode;
}

export function ModernCard({
  title,
  subtitle,
  value,
  icon,
  gradient,
  backgroundColor,
  iconColor,
  style,
  size = 'medium',
  variant = 'default',
  children,
}: ModernCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const cardStyles = [
    styles.container,
    styles[size],
    styles[variant],
    style,
  ];

  const iconColorResolved = iconColor || (gradient ? '#FFFFFF' : colors.primary);
  const textColor = gradient ? '#FFFFFF' : colors.text;
  const subtitleColor = gradient ? 'rgba(255, 255, 255, 0.8)' : colors.textSecondary;

  const CardContent = () => (
    <View style={styles.content}>
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: gradient ? 'rgba(255, 255, 255, 0.2)' : colors.backgroundSecondary }]}>
          <Ionicons name={icon} size={24} color={iconColorResolved} />
        </View>
      )}
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
          {title}
        </Text>
        
        {subtitle && (
          <Text style={[styles.subtitle, { color: subtitleColor }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        
        {value !== undefined && (
          <Text style={[styles.value, { color: textColor }]} numberOfLines={1}>
            {value}
          </Text>
        )}
      </View>
      
      {children}
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={cardStyles}
      >
        <CardContent />
      </LinearGradient>
    );
  }

  return (
    <View style={[cardStyles, { backgroundColor: backgroundColor || colors.card }]}>
      <CardContent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.border.large,
    overflow: 'hidden',
  },
  
  // Размеры
  small: {
    minHeight: hp(8),
    padding: SPACING.md,
  },
  medium: {
    minHeight: hp(12),
    padding: SPACING.lg,
  },
  large: {
    minHeight: hp(16),
    padding: SPACING.xl,
  },
  
  // Варианты
  default: {
    ...SHADOWS.medium,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: 'rgba(79, 70, 229, 0.2)',
    ...SHADOWS.small,
  },
  elevated: {
    ...SHADOWS.large,
  },
  
  content: {
    ...LAYOUT.row,
    ...LAYOUT.alignCenter,
    flex: 1,
  },
  
  iconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    ...LAYOUT.center,
    marginRight: SPACING.md,
  },
  
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  
  title: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    marginBottom: SPACING.xs / 2,
    letterSpacing: -0.2,
  },
  
  subtitle: {
    ...TYPOGRAPHY.body2,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  
  value: {
    ...TYPOGRAPHY.h2,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
