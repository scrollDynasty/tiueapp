import { StyleSheet } from 'react-native';
import { SHADOWS, SPACING, TYPOGRAPHY } from '../global';

export const eventsStyles = StyleSheet.create({
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
  addButton: {
    padding: SPACING.sm,
    borderRadius: 8,
  },
  eventCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 12,
    ...SHADOWS.small,
  },
  eventDate: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  eventTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.xs,
  },
  eventDescription: {
    ...TYPOGRAPHY.body2,
    marginBottom: SPACING.sm,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventLocation: {
    ...TYPOGRAPHY.caption,
    flex: 1,
  },
  eventType: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  eventTypeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
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
