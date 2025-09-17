import { Colors } from '@/constants/Colors';
import { Dimensions, Platform, StyleSheet } from 'react-native';

// Получаем размеры экрана
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive breakpoints
export const BREAKPOINTS = {
  sm: 320,
  md: 375,
  lg: 414,
  xl: 768,
} as const;

// Функции для адаптивного дизайна
export const wp = (percentage: number) => {
  const value = (percentage * SCREEN_WIDTH) / 100;
  return Math.round(value);
};

export const hp = (percentage: number) => {
  const value = (percentage * SCREEN_HEIGHT) / 100;
  return Math.round(value);
};

// Адаптивные размеры шрифтов
export const responsiveFontSize = (size: number) => {
  if (SCREEN_WIDTH < BREAKPOINTS.sm) return size * 0.85;
  if (SCREEN_WIDTH < BREAKPOINTS.md) return size * 0.9;
  if (SCREEN_WIDTH < BREAKPOINTS.lg) return size;
  return size * 1.1;
};

// Адаптивные отступы
export const SPACING = {
  xs: wp(1),
  sm: wp(2),
  md: wp(4),
  lg: wp(6),
  xl: wp(8),
  xxl: wp(12),
  // Фиксированные отступы для элементов UI
  containerHorizontal: wp(5),
  containerVertical: hp(2),
  cardPadding: wp(4),
  sectionSpacing: hp(3),
} as const;

export const SIZES = {
  border: {
    small: 8,
    medium: 12,
    large: 16,
    round: 24,
  },
  button: {
    small: hp(5),
    medium: hp(6),
    large: hp(7),
  },
  input: {
    height: hp(6),
    borderRadius: 12,
  },
  icon: {
    small: responsiveFontSize(16),
    medium: responsiveFontSize(24),
    large: responsiveFontSize(32),
  },
  avatar: {
    small: wp(10),
    medium: wp(12),
    large: wp(20),
  },
  card: {
    minHeight: hp(12),
    borderRadius: 16,
  },
  header: {
    height: hp(8),
  },
  tab: {
    height: hp(8),
  },
} as const;

export const TYPOGRAPHY = {
  h1: {
    fontSize: responsiveFontSize(28),
    fontWeight: 'bold' as const,
    lineHeight: responsiveFontSize(36),
  },
  h2: {
    fontSize: responsiveFontSize(24),
    fontWeight: 'bold' as const,
    lineHeight: responsiveFontSize(32),
  },
  h3: {
    fontSize: responsiveFontSize(20),
    fontWeight: '600' as const,
    lineHeight: responsiveFontSize(28),
  },
  h4: {
    fontSize: responsiveFontSize(18),
    fontWeight: '600' as const,
    lineHeight: responsiveFontSize(24),
  },
  body1: {
    fontSize: responsiveFontSize(16),
    fontWeight: '400' as const,
    lineHeight: responsiveFontSize(24),
  },
  body2: {
    fontSize: responsiveFontSize(14),
    fontWeight: '400' as const,
    lineHeight: responsiveFontSize(20),
  },
  caption: {
    fontSize: responsiveFontSize(12),
    fontWeight: '400' as const,
    lineHeight: responsiveFontSize(16),
  },
  button: {
    fontSize: responsiveFontSize(16),
    fontWeight: '600' as const,
    lineHeight: responsiveFontSize(24),
  },
} as const;

// Современные тени для разных платформ - оптимизированы для Android
export const SHADOWS = {
  small: {
    // Для web используем boxShadow
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      android: {
        // Минимальные тени для Android
        elevation: 2,
        shadowColor: 'transparent', // Убираем iOS тени на Android
      },
      default: {
        // iOS - оставляем красивые тени
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  medium: {
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
      },
      android: {
        // Умеренные тени для Android
        elevation: 3,
        shadowColor: 'transparent',
      },
      default: {
        // iOS - красивые тени
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      },
    }),
  },
  large: {
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
      },
      android: {
        // Средние тени для Android
        elevation: 4,
        shadowColor: 'transparent',
      },
      default: {
        // iOS - красивые тени
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 10,
      },
    }),
  },
};

// Глобальные стили
export const createGlobalStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  padding: {
    padding: SPACING.md,
  },
  paddingHorizontal: {
    paddingHorizontal: SPACING.md,
  },
  paddingVertical: {
    paddingVertical: SPACING.md,
  },
  margin: {
    margin: SPACING.md,
  },
  marginHorizontal: {
    marginHorizontal: SPACING.md,
  },
  marginVertical: {
    marginVertical: SPACING.md,
  },
  // Современные карточки с красивыми тенями
  card: {
    backgroundColor: colors.card,
    borderRadius: SIZES.border.large,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
    ...SHADOWS.small,
  },
  elevatedCard: {
    backgroundColor: colors.card,
    borderRadius: SIZES.border.large,
    padding: SPACING.xl,
    marginVertical: SPACING.md,
    ...SHADOWS.medium,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: SIZES.border.large,
    padding: SPACING.xl,
    marginVertical: SPACING.lg,
    ...SHADOWS.large,
  },
  // Современные кнопки с градиентами
  button: {
    height: SIZES.button.medium,
    borderRadius: SIZES.border.large,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    ...SHADOWS.small,
  },
  buttonLarge: {
    height: SIZES.button.large,
    borderRadius: SIZES.border.large,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    ...SHADOWS.medium,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: '#fff',
  },
  input: {
    height: SIZES.input.height,
    borderRadius: SIZES.input.borderRadius,
    paddingHorizontal: SPACING.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...TYPOGRAPHY.body1,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: SPACING.sm,
  },
  avatar: {
    width: SIZES.avatar.medium,
    height: SIZES.avatar.medium,
    borderRadius: SIZES.avatar.medium / 2,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: '#fff',
    fontWeight: '600',
  },
});

// Утилиты для адаптивного дизайна
export const LAYOUT = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  spaceEvenly: {
    justifyContent: 'space-evenly',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  flex3: {
    flex: 3,
  },
  // Адаптивные контейнеры
  containerPadding: {
    paddingHorizontal: SPACING.containerHorizontal,
    paddingVertical: SPACING.containerVertical,
  },
  screenPadding: {
    paddingHorizontal: SPACING.containerHorizontal,
  },
  sectionSpacing: {
    marginBottom: SPACING.sectionSpacing,
  },
  cardSpacing: {
    marginBottom: SPACING.md,
  },
});

// Responsive helpers
export const RESPONSIVE = {
  // Width percentages
  w10: wp(10),
  w20: wp(20),
  w25: wp(25),
  w30: wp(30),
  w40: wp(40),
  w50: wp(50),
  w60: wp(60),
  w70: wp(70),
  w75: wp(75),
  w80: wp(80),
  w90: wp(90),
  w100: wp(100),
  
  // Height percentages
  h10: hp(10),
  h20: hp(20),
  h25: hp(25),
  h30: hp(30),
  h40: hp(40),
  h50: hp(50),
  h60: hp(60),
  h70: hp(70),
  h75: hp(75),
  h80: hp(80),
  h90: hp(90),
  h100: hp(100),
  
  // Screen dimensions
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  
  // Is small screen?
  isSmallScreen: SCREEN_WIDTH < BREAKPOINTS.md,
  isLargeScreen: SCREEN_WIDTH > BREAKPOINTS.lg,
};

// Современные анимации и интерактивность
export const ANIMATIONS = {
  // Мягкие переходы
  transition: {
    duration: 200,
    useNativeDriver: true,
  },
  // Пружинные анимации
  spring: {
    tension: 100,
    friction: 8,
    useNativeDriver: true,
  },
  // Плавные появления
  fadeIn: {
    opacity: 1,
    duration: 300,
    useNativeDriver: true,
  },
  // Масштабирование при нажатии
  pressScale: {
    scale: 0.98,
    duration: 100,
    useNativeDriver: true,
  },
};

// Современные стили интерактивности
export const INTERACTIVE = {
  // Кнопки с эффектами нажатия
  touchable: {
    activeOpacity: 0.8,
  },
  // Карточки с подъемом при нажатии
  elevateOnPress: {
    activeOpacity: 0.95,
  },
  // Плавные переходы для веб
  ...(Platform.OS === 'web' && {
    smooth: {
      transition: 'all 0.2s ease-in-out',
    },
  }),
};
