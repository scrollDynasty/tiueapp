import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, View, ViewStyle } from 'react-native';
import Animated, {
    FadeIn,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { Animation, Colors, Spacing } from '../constants/DesignTokens';
import { ThemedText } from './ThemedText';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
}

interface NewsCardProps {
  title: string;
  subtitle: string;
  date: string;
  image?: string;
  events?: Event[];
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  onEventPress?: (event: Event) => void;
  style?: ViewStyle;
  index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function NewsCard({ 
  title, 
  subtitle, 
  date, 
  image,
  events = [],
  icon = 'notifications-outline', 
  onPress,
  onEventPress,
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
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#E5EAF2',
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 6,
          },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 8,
        },
        animatedStyle,
        style,
      ]}
    >
      {/* Изображение, если есть */}
      {image && (
        <Image
          source={{ uri: image }}
          style={{
            width: '100%',
            height: 200,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
          resizeMode="cover"
        />
      )}
      
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

      {/* События, связанные с новостью */}
      {events.length > 0 && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: '#E5EAF2',
            paddingHorizontal: Spacing.m,
            paddingVertical: Spacing.s,
          }}
        >
          <ThemedText
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: Colors.textPrimary,
              marginBottom: Spacing.xs,
            }}
          >
            📅 Связанные события
          </ThemedText>
          
          {events.map((event) => (
            <Pressable
              key={event.id}
              onPress={() => onEventPress?.(event)}
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 8,
                padding: Spacing.s,
                marginBottom: Spacing.xs,
                borderLeftWidth: 3,
                borderLeftColor: Colors.brandPrimary,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: Colors.textPrimary,
                  marginBottom: 2,
                }}
                numberOfLines={1}
              >
                {event.title}
              </ThemedText>
              
              <ThemedText
                style={{
                  fontSize: 11,
                  color: Colors.textSecondary,
                }}
              >
                📍 {event.location} • {event.date} в {event.time}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      )}
    </AnimatedPressable>
  );
}
