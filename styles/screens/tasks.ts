import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { hp, LAYOUT, SHADOWS, SIZES, SPACING, TYPOGRAPHY, wp } from '../global';

export const tasksStyles = StyleSheet.create({
  container: {
    ...LAYOUT.container,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  header: {
    backgroundColor: Colors.light.secondary,
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
  statsContainer: {
    ...LAYOUT.row,
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SIZES.border.medium,
    padding: SPACING.md,
    ...LAYOUT.center,
  },
  statNumber: {
    ...TYPOGRAPHY.h3,
    color: '#ffffff',
    fontWeight: '700',
  },
  statLabel: {
    ...TYPOGRAPHY.body2,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  filterContainer: {
    backgroundColor: Colors.light.surface,
    margin: SPACING.md,
    borderRadius: SIZES.border.medium,
    padding: SPACING.sm,
    ...SHADOWS.small,
  },
  filterScrollView: {
    ...LAYOUT.row,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.border.round,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  activeFilterButton: {
    backgroundColor: Colors.light.secondary,
    borderColor: Colors.light.secondary,
  },
  filterButtonText: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#ffffff',
  },
  tasksContent: {
    paddingHorizontal: SPACING.containerHorizontal,
  },
  taskCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: SIZES.border.medium,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
    ...LAYOUT.row,
    ...LAYOUT.alignCenter,
  },
  checkbox: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    borderWidth: 2,
    borderColor: Colors.light.border,
    marginRight: SPACING.md,
    ...LAYOUT.center,
  },
  checkedBox: {
    backgroundColor: Colors.light.success,
    borderColor: Colors.light.success,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
    ...LAYOUT.alignStart,
    marginBottom: SPACING.xs,
  },
  taskTitle: {
    ...TYPOGRAPHY.h4,
    color: Colors.light.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.border.small,
    minWidth: wp(15),
    ...LAYOUT.center,
  },
  priorityText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: '#ffffff',
  },
  taskDescription: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.textSecondary,
    marginBottom: SPACING.xs,
  },
  taskFooter: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
    ...LAYOUT.alignCenter,
  },
  taskSubject: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  taskDue: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.warning,
    fontWeight: '500',
  },
  completedTask: {
    opacity: 0.6,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: Colors.light.textSecondary,
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
    backgroundColor: Colors.light.secondary,
    ...LAYOUT.center,
    ...SHADOWS.medium,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    ...LAYOUT.center,
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderRadius: SIZES.border.large,
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
    maxHeight: hp(80),
    width: wp(90),
  },
  modalHeader: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
    ...LAYOUT.alignCenter,
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: Colors.light.text,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: SIZES.border.medium,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...TYPOGRAPHY.body1,
    color: Colors.light.text,
    backgroundColor: Colors.light.background,
  },
  textArea: {
    height: hp(12),
    textAlignVertical: 'top',
  },
  modalButtons: {
    ...LAYOUT.row,
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: SIZES.border.medium,
    ...LAYOUT.center,
  },
  cancelButton: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  saveButton: {
    backgroundColor: Colors.light.secondary,
  },
  cancelButtonText: {
    ...TYPOGRAPHY.body1,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  saveButtonText: {
    ...TYPOGRAPHY.body1,
    color: '#ffffff',
    fontWeight: '600',
  },
  // Добавляем отсутствующие стили
  taskSubjectText: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  taskDueDate: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.warning,
    fontWeight: '500',
  },
  menuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SIZES.border.round,
    padding: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: Colors.light.text,
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: SPACING.xl,
  },
  addButtonText: {
    ...TYPOGRAPHY.body1,
    color: '#ffffff',
    fontWeight: '600',
  },
});
