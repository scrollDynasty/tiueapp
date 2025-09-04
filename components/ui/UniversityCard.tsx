import { Colors, Gradients } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface UniversityCardProps {
  title: string;
  value?: string | number;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  gradient?: keyof typeof Gradients;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outline' | 'solid';
  style?: ViewStyle;
}

export function UniversityCard({
  title,
  value,
  subtitle,
  icon,
  gradient = 'primary',
  onPress,
  size = 'medium',
  variant = 'default',
  style
}: UniversityCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const gradientColors = Gradients[gradient];

  const getCardSize = () => {
    switch (size) {
      case 'small':
        return styles.smallCard;
      case 'large':
        return styles.largeCard;
      default:
        return styles.mediumCard;
    }
  };

  const renderContent = () => (
    <View style={[styles.content, getCardSize()]}>
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons 
            name={icon} 
            size={size === 'small' ? 20 : size === 'large' ? 32 : 24} 
            color={variant === 'outline' ? gradientColors[0] : 'white'} 
          />
        </View>
      )}
      
      <View style={styles.textContainer}>
        {value && (
          <Text style={[
            styles.value, 
            { 
              color: variant === 'outline' ? colors.text : 'white',
              fontSize: size === 'small' ? 18 : size === 'large' ? 32 : 24
            }
          ]}>
            {value}
          </Text>
        )}
        
        <Text style={[
          styles.title, 
          { 
            color: variant === 'outline' ? colors.text : 'white',
            fontSize: size === 'small' ? 12 : size === 'large' ? 18 : 14
          }
        ]}>
          {title}
        </Text>
        
        {subtitle && (
          <Text style={[
            styles.subtitle, 
            { 
              color: variant === 'outline' ? colors.textSecondary : 'rgba(255, 255, 255, 0.8)',
              fontSize: size === 'small' ? 10 : size === 'large' ? 14 : 12
            }
          ]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );

  if (variant === 'outline') {
    return (
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          styles.outlineCard,
          { 
            backgroundColor: colors.surface,
            borderColor: gradientColors[0],
          },
          style
        ]}
      >
        {renderContent()}
      </Pressable>
    );
  }

  if (variant === 'solid') {
    return (
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          { backgroundColor: gradientColors[0] },
          style
        ]}
      >
        {renderContent()}
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={[styles.card, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {renderContent()}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  outlineCard: {
    borderWidth: 2,
  },
  gradient: {
    flex: 1,
  },
  content: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallCard: {
    minHeight: 80,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  mediumCard: {
    minHeight: 120,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  largeCard: {
    minHeight: 160,
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  value: {
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  title: {
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 16,
  },
});
