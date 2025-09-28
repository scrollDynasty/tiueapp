import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  ActivityIndicator,
  Platform,
  PixelRatio,
} from 'react-native';
import { Image, ImageContentFit, ImageSource } from 'expo-image';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { getThemeColors } from '@/constants/Colors';
import { Skeleton } from './ui/Skeleton';

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface OptimizedImageProps {
  source: ImageSource | string | number;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  contentFit?: ImageContentFit;
  priority?: 'low' | 'normal' | 'high';
  placeholder?: string | number;
  blurhash?: string;
  transition?: number;
  onLoad?: () => void;
  onError?: (error: any) => void;
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';
  recyclingKey?: string;
  allowDownscaling?: boolean;
  responsivePolicy?: 'live' | 'initial' | 'static';
  showSkeleton?: boolean;
  skeletonProps?: {
    animation?: 'pulse' | 'wave' | 'none';
    variant?: 'rectangular' | 'rounded';
  };
  lazy?: boolean;
  threshold?: number;
}

// Кэш для blurhash placeholder'ов
const blurhashCache = new Map<string, string>();

// Генератор оптимальных размеров изображений
const getOptimalImageSize = (width: number, height: number) => {
  const pixelRatio = PixelRatio.get();
  const optimalWidth = Math.ceil(width * pixelRatio);
  const optimalHeight = Math.ceil(height * pixelRatio);
  
  // Ограничиваем максимальный размер для производительности
  const maxSize = Platform.select({
    web: 2048,
    default: 1024,
  });
  
  return {
    width: Math.min(optimalWidth, maxSize),
    height: Math.min(optimalHeight, maxSize),
  };
};

export const OptimizedImage = memo(({
  source,
  style,
  containerStyle,
  contentFit = 'cover',
  priority = 'normal',
  placeholder,
  blurhash,
  transition = 200,
  onLoad,
  onError,
  cachePolicy = 'memory-disk',
  recyclingKey,
  allowDownscaling = true,
  responsivePolicy = 'live',
  showSkeleton = true,
  skeletonProps = {},
  lazy = true,
  threshold = 200,
}: OptimizedImageProps) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const opacity = useSharedValue(0);

  // Определяем источник изображения
  const imageSource = useMemo(() => {
    if (typeof source === 'string') {
      return { uri: source };
    }
    return source;
  }, [source]);

  // Анимированные стили для плавного появления
  const animatedImageStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Обработчик успешной загрузки
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    opacity.value = withTiming(1, { duration: transition });
    onLoad?.();
  }, [transition, onLoad]);

  // Обработчик ошибки загрузки
  const handleError = useCallback((error: any) => {
    setIsLoading(false);
    setHasError(true);
    opacity.value = withTiming(1, { duration: transition });
    onError?.(error);
  }, [transition, onError]);

  // Стили изображения с оптимизацией размеров
  const imageStyles = useMemo(() => {
    const flatStyle = StyleSheet.flatten(style);
    const { width, height } = flatStyle || {};
    
    if (typeof width === 'number' && typeof height === 'number') {
      const optimal = getOptimalImageSize(width, height);
      return [
        flatStyle,
        {
          width: optimal.width,
          height: optimal.height,
        },
      ];
    }
    
    return style;
  }, [style]);

  // Конфигурация для expo-image
  const imageConfig = {
    style: imageStyles,
    contentFit,
    priority,
    cachePolicy,
    recyclingKey,
    allowDownscaling,
    responsivePolicy,
    transition: { duration: transition },
    onLoad: handleLoad,
    onError: handleError,
    ...(placeholder && { placeholder }),
    ...(blurhash && { 
      placeholder: blurhash,
      placeholderContentFit: contentFit,
    }),
  };

  // Рендер скелетона или ошибки
  const renderPlaceholder = () => {
    if (hasError) {
      return (
        <View style={[styles.placeholder, imageStyles]}>
          <View style={styles.errorContainer}>
            <Animated.Text 
              entering={FadeIn} 
              style={[styles.errorText, { color: colors.textSecondary }]}
            >
              Failed to load image
            </Animated.Text>
          </View>
        </View>
      );
    }

    if (showSkeleton && isLoading) {
      return (
        <Skeleton
          style={imageStyles}
          animation={skeletonProps.animation || 'pulse'}
          variant={skeletonProps.variant || 'rectangular'}
        />
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {renderPlaceholder()}
      <AnimatedImage
        {...imageConfig}
        source={imageSource}
        style={[imageStyles, animatedImageStyle, { position: 'absolute' }]}
      />
    </View>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Компонент для групповой загрузки изображений с приоритетом
interface ImagePreloaderProps {
  images: Array<string | ImageSource>;
  onAllLoaded?: () => void;
  priority?: 'low' | 'normal' | 'high';
}

export const ImagePreloader = memo(({ 
  images, 
  onAllLoaded,
  priority = 'normal' 
}: ImagePreloaderProps) => {
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    if (loadedCount === images.length && onAllLoaded) {
      onAllLoaded();
    }
  }, [loadedCount, images.length, onAllLoaded]);

  const handleImageLoad = useCallback(() => {
    setLoadedCount(prev => prev + 1);
  }, []);

  // Предзагружаем изображения в фоне
  useEffect(() => {
    images.forEach((image) => {
      const source = typeof image === 'string' ? { uri: image } : image;
      Image.prefetch(source, priority);
    });
  }, [images, priority]);

  return null;
});

ImagePreloader.displayName = 'ImagePreloader';

// Хук для предзагрузки изображений
export const useImagePreload = (images: Array<string | ImageSource>, priority: 'low' | 'normal' | 'high' = 'normal') => {
  const [isPreloading, setIsPreloading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let loadedCount = 0;
    const totalImages = images.length;

    if (totalImages === 0) {
      setIsPreloading(false);
      return;
    }

    const preloadImage = async (image: string | ImageSource) => {
      try {
        const source = typeof image === 'string' ? { uri: image } : image;
        await Image.prefetch(source, priority);
        loadedCount++;
        setProgress(loadedCount / totalImages);
        
        if (loadedCount === totalImages) {
          setIsPreloading(false);
        }
      } catch (error) {
        // Продолжаем загрузку даже при ошибке
        loadedCount++;
        setProgress(loadedCount / totalImages);
        
        if (loadedCount === totalImages) {
          setIsPreloading(false);
        }
      }
    };

    images.forEach(preloadImage);
  }, [images, priority]);

  return { isPreloading, progress };
};

// Компонент для прогрессивной загрузки изображений
export const ProgressiveImage = memo(({
  thumbnailSource,
  source,
  ...props
}: OptimizedImageProps & { thumbnailSource?: string | ImageSource }) => {
  const [loadingFullSize, setLoadingFullSize] = useState(true);

  return (
    <View style={props.containerStyle}>
      {thumbnailSource && loadingFullSize && (
        <OptimizedImage
          {...props}
          source={thumbnailSource}
          priority="high"
          showSkeleton={false}
          style={[props.style, StyleSheet.absoluteFillObject]}
        />
      )}
      <OptimizedImage
        {...props}
        source={source}
        onLoad={() => {
          setLoadingFullSize(false);
          props.onLoad?.();
        }}
        style={props.style}
      />
    </View>
  );
});

ProgressiveImage.displayName = 'ProgressiveImage';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  placeholder: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
  },
});