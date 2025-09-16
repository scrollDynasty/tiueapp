import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';
import { ThemedText } from '../ThemedText';

interface CircularChartProps {
  value: number;
  maxValue: number;
  title: string;
  color?: string;
  suffix?: string;
}

export const CircularChart: React.FC<CircularChartProps> = ({ 
  value, 
  maxValue, 
  title, 
  color = '#2563EB',
  suffix = ''
}) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / maxValue, 1);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);

  const styles = StyleSheet.create({
    card: {
      margin: 8,
      backgroundColor: isDarkMode ? '#1E3A8A' : '#FFFFFF',
      borderRadius: 12,
      elevation: 3,
      alignItems: 'center',
    },
    cardContent: {
      padding: 16,
      alignItems: 'center',
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFFFFF' : '#1E3A8A',
      marginBottom: 16,
      textAlign: 'center',
    },
    chartContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    valueText: {
      position: 'absolute',
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? '#60A5FA' : '#2563EB',
    },
  });

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <View style={styles.chartContainer}>
          <Svg width={size} height={size}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isDarkMode ? '#334155' : '#E2E8F0'}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <ThemedText style={styles.valueText}>
            {value.toFixed(1)}{suffix}
          </ThemedText>
        </View>
      </Card.Content>
    </Card>
  );
};
