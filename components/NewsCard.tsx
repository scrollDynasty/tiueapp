import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import Animated, {
    FadeIn,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { Animation, Colors, Radius, Shadows, Spacing } from '../constants/DesignTokens';
import { ThemedText } from './ThemedText';

interface NewsCardProps {
  title: string;
  subtitle: string;
  date: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: ViewStyle;
  index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function NewsCard({ 
  title, 
  subtitle, 
  date, 
  icon = 'notifications-outline', 
  onPress, 
  style,
  index = 0 
}: NewsCardProps) {
  const pressed = useSharedValue(0);

  const handlePressIn = () => {
    'worklet';
    pressed.value = withTiming(1, { duration: Animation.duration.short });
  };

  const handlePressOut = () => {
    'worklet';
    pressed.value = withTiming(0, { duration: Animation.duration.short });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressed.value, [0, 1], [1, 0.98]);
    const opacity = interpolate(pressed.value, [0, 1], [1, 0.9]);

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <AnimatedPressable
      entering={FadeIn.delay(index * 100)}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          borderRadius: Radius.card,
          borderWidth: 1,
          borderColor: Colors.strokeSoft,
          backgroundColor: Colors.surface,
          ...Shadows.card,
        },
        animatedStyle,
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          padding: Spacing.m,
          alignItems: 'center',
        }}
      >
        {/* Индикатор слева */}
        <View
          style={{
            width: 6,
            height: 48,
            backgroundColor: Colors.brandPrimary,
            borderRadius: 3,
            marginRight: Spacing.m,
          }}
        />

        {/* Контент */}
        <View style={{ flex: 1 }}>
          <ThemedText
            style={{
              fontSize: 16,
              lineHeight: 24,
              fontWeight: '600',
              color: Colors.textPrimary,
              marginBottom: Spacing.xxs,
            }}
            numberOfLines={2}
          >
            {title}
          </ThemedText>
          
          <ThemedText
            style={{
              fontSize: 13,
              lineHeight: 18,
              fontWeight: '500',
              color: Colors.textSecondary,
              marginBottom: Spacing.xs,
            }}
            numberOfLines={2}
          >
            {subtitle}
          </ThemedText>

          <ThemedText
            style={{
              fontSize: 12,
              lineHeight: 16,
              fontWeight: '500',
              color: Colors.textSecondary,
            }}
          >
            {date}
          </ThemedText>
        </View>

        {/* Иконка-чип */}
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: Colors.chipBg,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: Spacing.s,
          }}
        >
          <Ionicons 
            name={icon} 
            size={14} 
            color={Colors.chipIcon} 
          />
        </View>
      </View>
    </AnimatedPressable>
  );
}
