import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  runOnJS,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from './ThemedText';
// Условный импорт для веб-платформы
let LottieView: any;
if (Platform.OS === 'web') {
  // Для веб используем простую анимацию вместо Lottie
  LottieView = null;
} else {
  LottieView = require('lottie-react-native').default;
}

interface SplashScreenProps {
  onAnimationFinish: () => void;
}

export function SplashScreen({ onAnimationFinish }: SplashScreenProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const { isVerySmallScreen, fontSize, spacing } = useResponsive();
  const animationRef = useRef<any>(null);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Через 3 секунды начинаем исчезать и вызываем callback
    // Увеличили время чтобы анимация успела проиграться полностью
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(onAnimationFinish)();
        }
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [onAnimationFinish, opacity]);

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor="transparent" 
        translucent 
      />
      
      {/* Градиентный фон */}
      <LinearGradient
        colors={isDarkMode 
          ? ['#0F172A', '#1E293B', '#334155']
          : ['#FAFAFA', '#F8FAFC', '#EEF2F7']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity,
            }
          ]}
        >
          {/* Анимация - Lottie для мобильных, альтернатива для веб */}
          <View style={styles.animationContainer}>
            {Platform.OS !== 'web' && LottieView ? (
              <LottieView
                ref={animationRef}
                source={require('../Educatin.json')}
                style={[
                  styles.animation,
                  {
                    width: isVerySmallScreen ? 200 : 300,
                    height: isVerySmallScreen ? 200 : 300,
                  }
                ]}
                loop={true}
                speed={1}
                autoPlay={true}
                resizeMode="contain"
              />
            ) : (
              // Альтернативная анимация для веб
              <Animated.View 
                entering={FadeInDown.duration(1000)}
                style={[
                  styles.webAnimation,
                  {
                    width: isVerySmallScreen ? 200 : 300,
                    height: isVerySmallScreen ? 200 : 300,
                  }
                ]}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primary + '80']}
                  style={styles.logoCircle}
                >
                  <ThemedText style={[
                    styles.logoText,
                    { fontSize: isVerySmallScreen ? 48 : 64 }
                  ]}>
                    T
                  </ThemedText>
                </LinearGradient>
              </Animated.View>
            )}
          </View>

          {/* Текст под анимацией */}
          <Animated.View 
            entering={FadeInDown.delay(1000).duration(800)}
            style={styles.textContainer}
          >
            <ThemedText style={[
              styles.title,
              {
                fontSize: isVerySmallScreen ? fontSize.title + 4 : fontSize.title + 8,
                color: colors.text,
                marginBottom: spacing.sm,
              }
            ]}>
              TIUE Education
            </ThemedText>
            
            <ThemedText style={[
              styles.subtitle,
              {
                fontSize: fontSize.body,
                color: colors.textSecondary,
              }
            ]}>
              Добро пожаловать в будущее образования
            </ThemedText>
          </Animated.View>

          {/* Индикатор загрузки */}
          <Animated.View 
            entering={FadeInDown.delay(1500).duration(600)}
            style={styles.loadingContainer}
          >
            <View style={[
              styles.loadingDots,
              { backgroundColor: colors.primary + '30' }
            ]}>
              <View style={[
                styles.dot,
                { backgroundColor: colors.primary }
              ]} />
              <View style={[
                styles.dot,
                { backgroundColor: colors.primary }
              ]} />
              <View style={[
                styles.dot,
                { backgroundColor: colors.primary }
              ]} />
            </View>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  animationContainer: {
    marginBottom: 40,
  },
  animation: {
    alignSelf: 'center',
  },
  webAnimation: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoText: {
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
