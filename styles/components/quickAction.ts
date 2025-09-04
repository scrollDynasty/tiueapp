import { StyleSheet } from 'react-native';
import { hp, LAYOUT, SHADOWS, SIZES, SPACING, TYPOGRAPHY, wp } from '../global';

export const quickActionStyles = StyleSheet.create({
  container: {
    borderRadius: SIZES.border.large,
    overflow: 'hidden',
    flex: 1,
    minHeight: hp(14),
    ...SHADOWS.medium,
  },
  
  gradient: {
    flex: 1,
    borderRadius: SIZES.border.large,
  },
  
  content: {
    flex: 1,
    ...LAYOUT.center,
    padding: SPACING.lg,
  },
  
  iconContainer: {
    width: wp(16),
    height: wp(16),
    borderRadius: wp(8),
    ...LAYOUT.center,
    marginBottom: SPACING.md,
  },
  
  title: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
