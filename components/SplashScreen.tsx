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

let LottieView: any;
if (Platform.OS === 'web') {

  LottieView = null;
} else {
  LottieView = require('lottie-react-native').default;
}

export function SplashScreen() {
  return null;

}

