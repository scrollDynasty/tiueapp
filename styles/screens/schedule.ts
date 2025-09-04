import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { LAYOUT, SHADOWS, SIZES, SPACING, TYPOGRAPHY, wp } from '../global';

export const scheduleStyles = StyleSheet.create({
  container: {
    ...LAYOUT.container,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  header: {
    backgroundColor: Colors.light.primary,
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
  weekNavigation: {
    ...LAYOUT.row,
    ...LAYOUT.center,
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  weekButton: {
    padding: SPACING.sm,
    borderRadius: SIZES.border.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  weekText: {
    ...TYPOGRAPHY.h3,
    color: '#ffffff',
    fontWeight: '600',
    minWidth: wp(30),
    textAlign: 'center',
  },
  dayTabs: {
    ...LAYOUT.row,
    backgroundColor: Colors.light.surface,
    margin: SPACING.md,
    borderRadius: SIZES.border.medium,
    padding: SPACING.xs,
    ...SHADOWS.small,
  },
  dayTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: SIZES.border.small,
    ...LAYOUT.center,
  },
  activeDayTab: {
    backgroundColor: Colors.light.primary,
    ...SHADOWS.small,
  },
  dayTabText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  activeDayTabText: {
    color: '#ffffff',
  },
  scheduleContent: {
    paddingHorizontal: SPACING.containerHorizontal,
  },
  timeSlot: {
    marginBottom: SPACING.md,
  },
  timeHeader: {
    ...LAYOUT.row,
    ...LAYOUT.alignCenter,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  timeLine: {
    height: 1,
    backgroundColor: Colors.light.border,
    flex: 1,
    marginLeft: SPACING.md,
  },
  timeText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    minWidth: wp(20),
  },
  classCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: SIZES.border.medium,
    padding: SPACING.md,
    marginLeft: wp(22),
    ...SHADOWS.small,
    borderLeftWidth: 4,
    marginBottom: SPACING.sm,
  },
  classHeader: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
    ...LAYOUT.alignCenter,
    marginBottom: SPACING.sm,
  },
  className: {
    ...TYPOGRAPHY.h4,
    color: Colors.light.text,
    flex: 1,
  },
  classType: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.border.small,
    backgroundColor: Colors.light.accent,
  },
  classTypeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: '#ffffff',
  },
  classDetails: {
    gap: SPACING.xs,
  },
  classDetail: {
    ...LAYOUT.row,
    ...LAYOUT.alignCenter,
    gap: SPACING.sm,
  },
  classDetailText: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  duration: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  emptyDay: {
    padding: SPACING.xl,
    ...LAYOUT.center,
  },
  emptyDayText: {
    ...TYPOGRAPHY.h4,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptyDaySubtext: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  // Добавляем отсутствующие стили
  title: {
    ...TYPOGRAPHY.h2,
    color: Colors.light.text,
    fontWeight: '700',
  },
  weekSelector: {
    ...LAYOUT.row,
    ...LAYOUT.center,
    paddingHorizontal: SPACING.containerHorizontal,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  weekButtonText: {
    ...TYPOGRAPHY.body2,
    color: '#ffffff',
    fontWeight: '600',
  },
  classTime: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  classSubject: {
    ...TYPOGRAPHY.h4,
    fontWeight: '600',
  },
  classTeacher: {
    ...TYPOGRAPHY.body2,
    opacity: 0.7,
  },
  emptyState: {
    padding: SPACING.xl,
    ...LAYOUT.center,
  },
  emptyText: {
    ...TYPOGRAPHY.body2,
    textAlign: 'center',
    color: Colors.light.textSecondary,
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SIZES.border.round,
    padding: SPACING.sm,
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
    backgroundColor: Colors.light.primary,
    ...LAYOUT.center,
    ...SHADOWS.medium,
  },
});
