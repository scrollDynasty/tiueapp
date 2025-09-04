import { Colors } from '@/constants/DesignTokens';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface PullToRefreshAnimationProps {
  progress: number; // 0 to 1
  refreshing: boolean;
}

export function PullToRefreshAnimation({ progress, refreshing }: PullToRefreshAnimationProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (refreshing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      rotation.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 });
    }
  }, [refreshing, rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    const dropScale = interpolate(progress, [0, 1], [0.8, 1.2]);
    const dropOpacity = interpolate(progress, [0, 0.5, 1], [0.3, 0.7, 1]);

    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: refreshing ? scale.value : dropScale },
      ],
      opacity: refreshing ? 1 : dropOpacity,
    };
  });

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
      }}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={refreshing ? "sync" : "water"}
          size={24}
          color={Colors.brandPrimary}
        />
      </Animated.View>
    </View>
  );
}
