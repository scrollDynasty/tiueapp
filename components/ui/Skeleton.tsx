import React, { memo, useEffect } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Easing,
  runOnUI,
  cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeColors } from '@/constants/Colors';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  children?: React.ReactNode;
}

// Мемоизированный компонент для минимизации ререндеров
export const Skeleton = memo(({
  width = '100%',
  height = 20,
  borderRadius,
  style,
  variant = 'rectangular',
  animation = 'pulse',
  children,
}: SkeletonProps) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const animationValue = useSharedValue(0);

  // Вычисляем borderRadius на основе варианта
  const getBorderRadius = () => {
    if (borderRadius !== undefined) return borderRadius;
    switch (variant) {
      case 'circular':
        return typeof height === 'number' ? height / 2 : 100;
      case 'rounded':
        return 8;
      case 'text':
        return 4;
      default:
        return 0;
    }
  };

  useEffect(() => {
    if (animation === 'none') return;

    // Запускаем анимацию в нативном потоке для лучшей производительности
    runOnUI(() => {
      'worklet';
      if (animation === 'pulse') {
        animationValue.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 800, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
      } else if (animation === 'wave') {
        animationValue.value = withRepeat(
          withTiming(1, { duration: 1500, easing: Easing.linear }),
          -1,
          false
        );
      }
    })();

    return () => {
      // Очищаем анимацию при unmount
      runOnUI(() => {
        'worklet';
        cancelAnimation(animationValue);
      })();
    };
  }, [animation]);

  // Базовые цвета для скелетона
  const baseColor = isDarkMode ? '#374151' : '#E5E7EB';
  const highlightColor = isDarkMode ? '#4B5563' : '#F3F4F6';

  // Анимированные стили для pulse эффекта
  const pulseAnimatedStyle = useAnimatedStyle(() => {
    if (animation !== 'pulse') return {};
    
    const opacity = interpolate(
      animationValue.value,
      [0, 1],
      [1, 0.6]
    );

    return {
      opacity,
    };
  });

  // Анимированные стили для wave эффекта
  const waveAnimatedStyle = useAnimatedStyle(() => {
    if (animation !== 'wave') return {};
    
    const translateX = interpolate(
      animationValue.value,
      [0, 1],
      [-200, 200]
    );

    return {
      transform: [{ translateX }],
    };
  });

  const containerStyle: ViewStyle = {
    width,
    height,
    borderRadius: getBorderRadius(),
    backgroundColor: baseColor,
    overflow: 'hidden',
    ...style,
  };

  // Рендерим children если они есть (для скелетона контейнера)
  if (children) {
    return (
      <View style={containerStyle}>
        {children}
      </View>
    );
  }

  return (
    <Animated.View style={[containerStyle, pulseAnimatedStyle]}>
      {animation === 'wave' && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            waveAnimatedStyle,
          ]}
        >
          <LinearGradient
            colors={[
              'transparent',
              highlightColor,
              'transparent',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
});

Skeleton.displayName = 'Skeleton';

// Компонент для группы скелетонов
interface SkeletonGroupProps {
  count?: number;
  gap?: number;
  direction?: 'horizontal' | 'vertical';
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const SkeletonGroup = memo(({
  count = 3,
  gap = 8,
  direction = 'vertical',
  children,
  style,
}: SkeletonGroupProps) => {
  const containerStyle: ViewStyle = {
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    gap,
    ...style,
  };

  if (children) {
    return <View style={containerStyle}>{children}</View>;
  }

  return (
    <View style={containerStyle}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} />
      ))}
    </View>
  );
});

SkeletonGroup.displayName = 'SkeletonGroup';

// Специализированные скелетоны для часто используемых компонентов
export const SkeletonCard = memo(({ style }: { style?: ViewStyle }) => (
  <View style={[styles.card, style]}>
    <Skeleton height={200} variant="rounded" style={{ marginBottom: 12 }} />
    <SkeletonGroup gap={6}>
      <Skeleton height={20} width="80%" />
      <Skeleton height={16} width="100%" />
      <Skeleton height={16} width="90%" />
    </SkeletonGroup>
  </View>
));

SkeletonCard.displayName = 'SkeletonCard';

export const SkeletonListItem = memo(({ style }: { style?: ViewStyle }) => (
  <View style={[styles.listItem, style]}>
    <Skeleton width={48} height={48} variant="circular" />
    <View style={styles.listItemContent}>
      <Skeleton height={18} width="70%" style={{ marginBottom: 4 }} />
      <Skeleton height={14} width="90%" />
    </View>
  </View>
));

SkeletonListItem.displayName = 'SkeletonListItem';

// Скелетон для статистики
export const SkeletonStat = memo(({ style }: { style?: ViewStyle }) => (
  <View style={[styles.stat, style]}>
    <Skeleton height={32} width="60%" style={{ marginBottom: 8 }} />
    <Skeleton height={20} width="40%" />
  </View>
));

SkeletonStat.displayName = 'SkeletonStat';

// Оптимизированный контейнер для скелетонов
export const SkeletonContainer = memo(({ 
  children, 
  isLoading,
  style,
  renderSkeleton,
}: {
  children: React.ReactNode;
  isLoading: boolean;
  style?: ViewStyle;
  renderSkeleton?: () => React.ReactNode;
}) => {
  // Используем нативный рендеринг для быстрого переключения
  if (isLoading) {
    return (
      <View style={style}>
        {renderSkeleton ? renderSkeleton() : <Skeleton />}
      </View>
    );
  }

  return <>{children}</>;
});

SkeletonContainer.displayName = 'SkeletonContainer';

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  listItemContent: {
    flex: 1,
  },
  stat: {
    padding: 16,
    alignItems: 'center',
  },
});

// Экспортируем оптимизированный хук для использования скелетонов
export const useSkeletonAnimation = (enabled: boolean = true) => {
  const animationValue = useSharedValue(0);

  useEffect(() => {
    if (!enabled) return;

    runOnUI(() => {
      'worklet';
      animationValue.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        true
      );
    })();

    return () => {
      runOnUI(() => {
        'worklet';
        cancelAnimation(animationValue);
      })();
    };
  }, [enabled]);

  return animationValue;
};