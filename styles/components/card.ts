import { StyleSheet } from 'react-native';
import { SHADOWS, SIZES, SPACING } from '../global';

export const cardStyles = StyleSheet.create({
  card: {
    borderRadius: SIZES.border.medium,
    overflow: 'hidden',
  },
  gradient: {
    padding: SPACING.md,
    margin: SPACING.sm,
    borderRadius: SIZES.border.medium,
  },
  shadow: {
    ...SHADOWS.small,
  },
});

export const statCardStyles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 12,
  },
});
