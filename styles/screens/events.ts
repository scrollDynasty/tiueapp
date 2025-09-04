import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { LAYOUT, SHADOWS, SIZES, SPACING, TYPOGRAPHY, wp } from '../global';

export const eventsStyles = StyleSheet.create({
  container: {
    ...LAYOUT.container,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  header: {
    backgroundColor: Colors.light.accent,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.containerHorizontal,
    borderBottomLeftRadius: SIZES.border.large,
    borderBottomRightRadius: SIZES.border.large,
  },
  headerContent: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
    ...LAYOUT.alignCenter,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: '#ffffff',
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SIZES.border.round,
    padding: SPACING.sm,
  },
  calendarContainer: {
    backgroundColor: Colors.light.surface,
    margin: SPACING.md,
    borderRadius: SIZES.border.medium,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  monthHeader: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
    ...LAYOUT.alignCenter,
    marginBottom: SPACING.md,
  },
  monthTitle: {
    ...TYPOGRAPHY.h3,
    color: Colors.light.text,
    fontWeight: '600',
  },
  monthButton: {
    padding: SPACING.sm,
    borderRadius: SIZES.border.round,
  },
  eventsContent: {
    paddingHorizontal: SPACING.containerHorizontal,
  },
  sectionHeader: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
    ...LAYOUT.alignCenter,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: Colors.light.text,
    fontWeight: '600',
  },
  filterButton: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: SIZES.border.round,
    padding: SPACING.sm,
  },
  eventCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: SIZES.border.medium,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
    borderLeftWidth: 4,
  },
  eventHeader: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
    ...LAYOUT.alignCenter,
    marginBottom: SPACING.sm,
  },
  eventDate: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: Colors.light.primary,
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.border.small,
  },
  eventType: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.border.small,
    backgroundColor: Colors.light.accent,
  },
  eventTypeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: '#ffffff',
  },
  eventTitle: {
    ...TYPOGRAPHY.h4,
    color: Colors.light.text,
    marginBottom: SPACING.xs,
  },
  eventDescription: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.textSecondary,
    marginBottom: SPACING.sm,
  },
  eventFooter: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
    ...LAYOUT.alignCenter,
  },
  eventLocation: {
    ...LAYOUT.row,
    ...LAYOUT.alignCenter,
    flex: 1,
    gap: SPACING.sm,
  },
  eventLocationText: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  eventTime: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: Colors.light.warning,
  },
  upcomingBadge: {
    backgroundColor: Colors.light.success,
  },
  todayBadge: {
    backgroundColor: Colors.light.warning,
  },
  passedBadge: {
    backgroundColor: Colors.light.textSecondary,
  },
  emptyState: {
    padding: SPACING.xl,
    ...LAYOUT.center,
  },
  emptyStateIcon: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    backgroundColor: Colors.light.backgroundSecondary,
    ...LAYOUT.center,
    marginBottom: SPACING.md,
  },
  emptyText: {
    ...TYPOGRAPHY.h4,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.md,
  },
  fab: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    backgroundColor: Colors.light.accent,
    ...LAYOUT.center,
    ...SHADOWS.medium,
  },
});
