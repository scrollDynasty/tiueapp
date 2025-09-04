import { Animation, Colors } from '@/constants/DesignTokens';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface AnimatedTabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  onPress: () => void;
}

export function AnimatedTabIcon({ name, focused, onPress }: AnimatedTabIconProps) {
  const scale = useSharedValue(focused ? 1 : 0.8);
  const activeValue = useSharedValue(focused ? 1 : 0);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.12 : 1, Animation.spring);
    activeValue.value = withSpring(focused ? 1 : 0, Animation.spring);
  }, [focused, scale, activeValue]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    onPress();
  };

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const indicatorStyle = useAnimatedStyle(() => {
    const width = interpolate(activeValue.value, [0, 1], [0, 24]);
    const opacity = interpolate(activeValue.value, [0, 1], [0, 1]);

    return {
      width,
      opacity,
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(activeValue.value, [0, 1], [0, 0.25]);

    return {
      shadowOpacity,
    };
  });

  return (
    <Pressable onPress={handlePress} style={{ alignItems: 'center', flex: 1 }}>
      <Animated.View
        style={[
          {
            padding: 12,
            borderRadius: 20,
          },
          shadowStyle,
          {
            shadowColor: Colors.brandPrimary,
            shadowOffset: { width: 0, height: 6 },
            shadowRadius: 16,
          },
        ]}
      >
        <Animated.View style={iconAnimatedStyle}>
          <Ionicons
            name={name}
            size={24}
            color={focused ? Colors.brandPrimary : Colors.tabInactive}
          />
        </Animated.View>
        
        {/* Активный индикатор снизу */}
        <Animated.View
          style={[
            {
              height: 2,
              backgroundColor: Colors.brandPrimary,
              borderRadius: 1,
              marginTop: 4,
            },
            indicatorStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

// Специальные анимации для каждой иконки
export function HomeTabIcon({ focused, onPress }: { focused: boolean; onPress: () => void }) {
  return (
    <AnimatedTabIcon
      name={focused ? "home" : "home-outline"}
      focused={focused}
      onPress={onPress}
    />
  );
}

export function SearchTabIcon({ focused, onPress }: { focused: boolean; onPress: () => void }) {
  return (
    <AnimatedTabIcon
      name={focused ? "search" : "search-outline"}
      focused={focused}
      onPress={onPress}
    />
  );
}

export function MessagesTabIcon({ focused, onPress }: { focused: boolean; onPress: () => void }) {
  return (
    <AnimatedTabIcon
      name={focused ? "chatbubbles" : "chatbubbles-outline"}
      focused={focused}
      onPress={onPress}
    />
  );
}

export function ScheduleTabIcon({ focused, onPress }: { focused: boolean; onPress: () => void }) {
  return (
    <AnimatedTabIcon
      name={focused ? "calendar" : "calendar-outline"}
      focused={focused}
      onPress={onPress}
    />
  );
}

export function SettingsTabIcon({ focused, onPress }: { focused: boolean; onPress: () => void }) {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (focused) {
      rotation.value = withSpring(90, Animation.spring, () => {
        rotation.value = withSpring(0, { ...Animation.spring, damping: 25 });
      });
    }
  }, [focused, rotation]);

  const rotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <Pressable onPress={onPress} style={{ alignItems: 'center', flex: 1 }}>
      <Animated.View
        style={[
          {
            padding: 12,
            borderRadius: 20,
          },
          focused && {
            shadowColor: Colors.brandPrimary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
          },
        ]}
      >
        <Animated.View style={[rotationStyle, { transform: [{ scale: focused ? 1.12 : 1 }] }]}>
          <Ionicons
            name={focused ? "settings" : "settings-outline"}
            size={24}
            color={focused ? Colors.brandPrimary : Colors.tabInactive}
          />
        </Animated.View>
        
        {focused && (
          <View
            style={{
              height: 2,
              width: 24,
              backgroundColor: Colors.brandPrimary,
              borderRadius: 1,
              marginTop: 4,
            }}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}
