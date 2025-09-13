import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface LoadingAnimationProps {
  size?: number;
  color?: string;
}

export function LoadingAnimation({ size = 40, color = '#2563EB' }: LoadingAnimationProps) {
  const progress1 = useSharedValue(0);
  const progress2 = useSharedValue(0);
  const progress3 = useSharedValue(0);

  useEffect(() => {
    // Создаем волновую анимацию с задержками
    progress1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 600 })
      ),
      -1,
      false
    );

    progress2.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0, { duration: 600 })
        ),
        -1,
        false
      )
    );

    progress3.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0, { duration: 600 })
        ),
        -1,
        false
      )
    );

    return () => {
      // Stop animations on unmount
      progress1.value = 0;
      progress2.value = 0;
      progress3.value = 0;
    };
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => {
    const scale = interpolate(progress1.value, [0, 1], [0.3, 1]);
    const opacity = interpolate(progress1.value, [0, 0.5, 1], [0.3, 1, 0.3]);
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const animatedStyle2 = useAnimatedStyle(() => {
    const scale = interpolate(progress2.value, [0, 1], [0.3, 1]);
    const opacity = interpolate(progress2.value, [0, 0.5, 1], [0.3, 1, 0.3]);
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const animatedStyle3 = useAnimatedStyle(() => {
    const scale = interpolate(progress3.value, [0, 1], [0.3, 1]);
    const opacity = interpolate(progress3.value, [0, 0.5, 1], [0.3, 1, 0.3]);
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const dotSize = size * 0.25;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            borderRadius: dotSize / 2,
          },
          animatedStyle1,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            borderRadius: dotSize / 2,
            marginHorizontal: size * 0.15,
          },
          animatedStyle2,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
            borderRadius: dotSize / 2,
          },
          animatedStyle3,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
