import { StyleSheet } from 'react-native';
import { SPACING, TYPOGRAPHY } from '../global';

export const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  header: {
    padding: SPACING.md,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
  },
  sectionAction: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
  },
  scheduleItem: {
    margin: SPACING.sm,
    marginBottom: 0,
  },
  scheduleCard: {
    margin: SPACING.sm,
    marginBottom: 0,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: SPACING.sm,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  scheduleSubject: {
    ...TYPOGRAPHY.h4,
    flex: 1,
  },
  scheduleTime: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  scheduleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scheduleTeacher: {
    ...TYPOGRAPHY.body2,
    opacity: 0.7,
  },
  scheduleLocation: {
    ...TYPOGRAPHY.body2,
    opacity: 0.7,
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    marginLeft: SPACING.sm,
  },
  typeBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  taskItem: {
    margin: SPACING.sm,
    marginBottom: 0,
  },
  taskCard: {
    margin: SPACING.sm,
    marginBottom: 0,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  taskTitle: {
    ...TYPOGRAPHY.h4,
    flex: 1,
    marginRight: SPACING.sm,
  },
  taskPriority: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  taskPriorityText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: '#fff',
  },
  taskSubject: {
    ...TYPOGRAPHY.body2,
    opacity: 0.7,
    marginBottom: SPACING.xs,
  },
  taskDue: {
    ...TYPOGRAPHY.body2,
    fontWeight: '500',
  },
  taskDueDate: {
    ...TYPOGRAPHY.body2,
    fontWeight: '500',
  },
  priorityIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body2,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  actionCard: {
    flex: 1,
    minHeight: 80,
  },
  actionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
});
