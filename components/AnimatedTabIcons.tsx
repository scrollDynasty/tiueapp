import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface AnimatedTabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  onPress?: () => void;
}

export function AnimatedTabIcon({ name, focused, onPress }: AnimatedTabIconProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(focused ? 1 : 0.6);
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    // Плавная анимация без резких скачков
    scale.value = withSpring(focused ? 1.1 : 1, {
      damping: 15,
      stiffness: 300,
      mass: 0.8,
    });
    
    opacity.value = withTiming(focused ? 1 : 0.6, {
      duration: 200,
    });
    
    translateY.value = withSpring(focused ? -2 : 0, {
      damping: 20,
      stiffness: 400,
      mass: 0.5,
    });
  }, [focused]);

  const handlePress = () => {
    'worklet';
    // Легкая анимация нажатия
    scale.value = withSpring(0.95, {
      damping: 20,
      stiffness: 400,
      mass: 0.5,
    }, () => {
      scale.value = withSpring(focused ? 1.1 : 1, {
        damping: 15,
        stiffness: 300,
        mass: 0.8,
      });
    });
    
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      runOnJS(onPress)();
    }
  };

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ],
      opacity: opacity.value,
    };
  });

  const indicatorStyle = useAnimatedStyle(() => {
    const width = interpolate(opacity.value, [0.6, 1], [0, 20]);
    const scaleX = interpolate(opacity.value, [0.6, 1], [0, 1]);

    return {
      width,
      transform: [{ scaleX }],
      opacity: interpolate(opacity.value, [0.6, 1], [0, 1]),
    };
  });

  return (
    <Pressable onPress={handlePress} style={{ alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 44 }}>
      <Animated.View style={iconAnimatedStyle}>
        <Ionicons
          name={name}
          size={24}
          color={focused ? '#007BFF' : '#94A3B8'}
        />
      </Animated.View>
      
      {/* Простой индикатор */}
      {focused && (
        <View
          style={{
            height: 2,
            width: 20,
            backgroundColor: '#007BFF',
            borderRadius: 1,
            marginTop: 4,
          }}
        />
      )}
    </Pressable>
  );
}

// Специальные иконки для каждой вкладки
export function HomeTabIcon({ focused, onPress }: { focused: boolean; onPress?: () => void }) {
  return (
    <AnimatedTabIcon
      name={focused ? "home" : "home-outline"}
      focused={focused}
      onPress={onPress}
    />
  );
}

export function SearchTabIcon({ focused, onPress }: { focused: boolean; onPress?: () => void }) {
  return (
    <AnimatedTabIcon
      name={focused ? "search" : "search-outline"}
      focused={focused}
      onPress={onPress}
    />
  );
}

export function MessagesTabIcon({ focused, onPress }: { focused: boolean; onPress?: () => void }) {
  return (
    <AnimatedTabIcon
      name={focused ? "chatbubbles" : "chatbubbles-outline"}
      focused={focused}
      onPress={onPress}
    />
  );
}

export function ScheduleTabIcon({ focused, onPress }: { focused: boolean; onPress?: () => void }) {
  return (
    <AnimatedTabIcon
      name={focused ? "calendar" : "calendar-outline"}
      focused={focused}
      onPress={onPress}
    />
  );
}

export function SettingsTabIcon({ focused, onPress }: { focused: boolean; onPress?: () => void }) {
  return (
    <AnimatedTabIcon
      name={focused ? "settings" : "settings-outline"}
      focused={focused}
      onPress={onPress}
    />
  );
}
