import { StyleSheet } from 'react-native';
import { LAYOUT, SPACING, TYPOGRAPHY } from '../global';

export const sectionHeaderStyles = StyleSheet.create({
  container: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
    ...LAYOUT.alignCenter,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.containerHorizontal,
  },
  
  title: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  
  actionButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  
  actionText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
  },
});
