import { StyleSheet } from 'react-native';
import { hp, LAYOUT, SHADOWS, SIZES, SPACING, TYPOGRAPHY, wp } from '../global';

export const modernCardStyles = StyleSheet.create({
  container: {
    borderRadius: SIZES.border.large,
    overflow: 'hidden',
  },
  
  // Размеры
  small: {
    minHeight: hp(8),
    padding: SPACING.md,
  },
  medium: {
    minHeight: hp(12),
    padding: SPACING.lg,
  },
  large: {
    minHeight: hp(16),
    padding: SPACING.xl,
  },
  
  // Варианты
  default: {
    ...SHADOWS.medium,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: 'rgba(79, 70, 229, 0.2)',
    ...SHADOWS.small,
  },
  elevated: {
    ...SHADOWS.large,
  },
  
  content: {
    ...LAYOUT.row,
    ...LAYOUT.alignCenter,
    flex: 1,
  },
  
  iconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    ...LAYOUT.center,
    marginRight: SPACING.md,
  },
  
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  
  title: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    marginBottom: SPACING.xs / 2,
    letterSpacing: -0.2,
  },
  
  subtitle: {
    ...TYPOGRAPHY.body2,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  
  value: {
    ...TYPOGRAPHY.h2,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
