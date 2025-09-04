import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { ThemedText } from './ThemedText';

interface ActionCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ActionCard({ title, icon, onPress, style }: ActionCardProps) {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);
  const hovered = useSharedValue(0);

  const handlePressIn = () => {
    'worklet';
    scale.value = withSpring(0.95, {
      damping: 18,
      stiffness: 220,
      mass: 1,
    });
    pressed.value = withTiming(1, { duration: 160 });
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    'worklet';
    scale.value = withSpring(1.05, {
      damping: 18,
      stiffness: 220,
      mass: 1,
    }, () => {
      scale.value = withSpring(1, {
        damping: 18,
        stiffness: 220,
        mass: 1,
      });
    });
    pressed.value = withTiming(0, { duration: 240 });
  };

  const handleHoverIn = () => {
    'worklet';
    hovered.value = withTiming(1, { duration: 160 });
  };

  const handleHoverOut = () => {
    'worklet';
    hovered.value = withTiming(0, { duration: 160 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      hovered.value,
      [0, 1],
      [0.05, 0.08]
    );

    return {
      transform: [{ scale: scale.value }],
      shadowOpacity,
      borderColor: pressed.value > 0.5 ? '#007BFF' : '#E0E7FF',
    };
  });

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: pressed.value > 0.5 ? '#F8FAFF' : '#FFFFFF',
    };
  });

  const iconStyle = useAnimatedStyle(() => {
    const iconScale = interpolate(
      pressed.value,
      [0, 1],
      [1, 1.1]
    );

    return {
      transform: [{ scale: iconScale }],
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      style={[
        {
          width: 160,
          height: 180,
          borderRadius: 20,
          borderWidth: 1,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 6,
          },
          shadowRadius: 10,
          elevation: 8,
        },
        animatedStyle,
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            padding: 20,
            borderRadius: 20,
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          },
          backgroundStyle,
        ]}
      >
        <Animated.View style={iconStyle}>
          <Ionicons 
            name={icon} 
            size={28} 
            color="#007BFF"
          />
        </Animated.View>
        
        <ThemedText
          style={{
            fontSize: 13,
            lineHeight: 18,
            fontWeight: '500',
            color: '#6C757D',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </ThemedText>
      </Animated.View>
    </AnimatedPressable>
  );
}
