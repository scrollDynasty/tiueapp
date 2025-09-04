import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { hp, LAYOUT, SHADOWS, SIZES, SPACING, TYPOGRAPHY, wp } from '../global';

export const dashboardStyles = StyleSheet.create({
  container: {
    ...LAYOUT.container,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  header: {
    ...LAYOUT.containerPadding,
    paddingTop: SPACING.lg,
  },
  greeting: {
    ...TYPOGRAPHY.h2,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body2,
    opacity: 0.7,
  },
  headerRow: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
    ...LAYOUT.alignCenter,
  },
  avatar: {
    width: SIZES.avatar.medium,
    height: SIZES.avatar.medium,
    borderRadius: SIZES.avatar.medium / 2,
    ...LAYOUT.center,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: TYPOGRAPHY.body1.fontSize,
  },
  statsContainer: {
    ...LAYOUT.row,
    paddingHorizontal: SPACING.containerHorizontal,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statsRow: {
    ...LAYOUT.row,
    paddingHorizontal: SPACING.containerHorizontal,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.containerHorizontal,
  },
  sectionHeader: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
    marginBottom: SPACING.md,
    paddingHorizontal: 0,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: Colors.light.text,
  },
  sectionAction: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  scheduleItem: {
    marginHorizontal: SPACING.containerHorizontal,
    marginBottom: SPACING.sm,
  },
  scheduleCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: SIZES.border.medium,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  scheduleRow: {
    ...LAYOUT.row,
    ...LAYOUT.alignCenter,
  },
  colorIndicator: {
    width: wp(1),
    height: hp(5),
    borderRadius: SIZES.border.small,
    marginRight: SPACING.sm,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleHeader: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
    marginBottom: SPACING.xs,
  },
  scheduleSubject: {
    ...TYPOGRAPHY.h4,
    flex: 1,
    color: Colors.light.text,
  },
  scheduleTime: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.border.small,
    backgroundColor: Colors.light.primary,
    color: '#ffffff',
  },
  scheduleDetails: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
  },
  scheduleTeacher: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.textSecondary,
  },
  scheduleLocation: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.textSecondary,
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.border.small,
    marginLeft: SPACING.sm,
    backgroundColor: Colors.light.accent,
  },
  typeBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: '#ffffff',
  },
  taskItem: {
    marginHorizontal: SPACING.containerHorizontal,
    marginBottom: SPACING.sm,
  },
  taskCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: SIZES.border.medium,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  taskRow: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
    ...LAYOUT.alignStart,
  },
  taskInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  taskHeader: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
    ...LAYOUT.alignStart,
    marginBottom: SPACING.xs,
  },
  taskTitle: {
    ...TYPOGRAPHY.h4,
    flex: 1,
    marginRight: SPACING.sm,
    color: Colors.light.text,
  },
  taskPriority: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.border.small,
    minWidth: wp(15),
    ...LAYOUT.center,
  },
  taskPriorityText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: '#ffffff',
  },
  taskSubject: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.textSecondary,
    marginBottom: SPACING.xs,
  },
  taskDue: {
    ...TYPOGRAPHY.body2,
    fontWeight: '500',
    color: Colors.light.text,
  },
  taskDueDate: {
    ...TYPOGRAPHY.body2,
    fontWeight: '500',
    color: Colors.light.warning,
  },
  priorityIndicator: {
    width: wp(1),
    height: hp(5),
    borderRadius: SIZES.border.small,
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
  actionsGrid: {
    ...LAYOUT.row,
    paddingHorizontal: SPACING.containerHorizontal,
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  actionCard: {
    flex: 1,
    minHeight: hp(10),
    backgroundColor: Colors.light.surface,
    borderRadius: SIZES.border.medium,
    ...SHADOWS.small,
  },
  actionContent: {
    ...LAYOUT.center,
    flex: 1,
    padding: SPACING.md,
  },
  actionText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    marginTop: SPACING.xs,
    color: Colors.light.text,
    textAlign: 'center',
  },
});
