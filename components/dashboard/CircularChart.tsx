import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { ThemedText } from '../ThemedText';

const { width } = Dimensions.get('window');

interface CircularChartProps {
  value: number;
  maxValue?: number;
  title: string;
  subtitle?: string;
  color: string;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: number;
  strokeWidth?: number;
}

export const CircularChart: React.FC<CircularChartProps> = ({
  value,
  maxValue = 100,
  title,
  subtitle,
  color,
  icon,
  size = 120,
  strokeWidth = 8,
}) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / maxValue, 1);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);
  
  const centerX = size / 2;
  const centerY = size / 2;

  const formatValue = () => {
    if (maxValue === 5 || maxValue === 4) {
      // GPA формат
      return value.toFixed(1);
    } else {
      // Процент формат
      return `${Math.round(value)}%`;
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      shadowColor: color,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
      borderWidth: 1,
      borderColor: color + '20',
      position: 'relative',
      overflow: 'hidden',
    },
    iconContainer: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: color + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    svgContainer: {
      marginBottom: 16,
    },
    valueText: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    titleText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    subtitleText: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    progressLabel: {
      position: 'absolute',
      bottom: 8,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: color,
      marginHorizontal: 2,
    },
  });

  return (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.container}>
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={16} color={color} />
        </View>
      )}
      
      <View style={styles.svgContainer}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          {/* Background circle */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        
        {/* Center content */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <ThemedText style={styles.valueText}>
            {formatValue()}
          </ThemedText>
        </View>
      </View>
      
      <ThemedText style={styles.titleText}>
        {title}
      </ThemedText>
      
      {subtitle && (
        <ThemedText style={styles.subtitleText}>
          {subtitle}
        </ThemedText>
      )}
      
      {/* Progress indicator */}
      <View style={styles.progressLabel}>
        {Array.from({ length: 5 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor: index < (progress * 5) ? color : colors.border,
              },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
};
