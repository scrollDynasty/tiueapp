import { StyleSheet } from 'react-native';
import { SHADOWS, SPACING, TYPOGRAPHY } from '../global';

export const scheduleStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h1,
  },
  weekSelector: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  weekButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  weekButtonText: {
    ...TYPOGRAPHY.body2,
  },
  classCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    ...SHADOWS.small,
  },
  classTime: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  classSubject: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.xs,
  },
  classDetails: {
    ...TYPOGRAPHY.body2,
    marginBottom: SPACING.xs,
  },
  classTeacher: {
    ...TYPOGRAPHY.caption,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyText: {
    ...TYPOGRAPHY.h3,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
