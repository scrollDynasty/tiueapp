import { StyleSheet } from 'react-native';
import { SHADOWS, SPACING, TYPOGRAPHY } from '../global';

export const tasksStyles = StyleSheet.create({
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
  filterContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  filterScrollView: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    borderWidth: 1,
  },
  filterButtonText: {
    ...TYPOGRAPHY.body2,
  },
  taskCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  taskSubject: {
    ...TYPOGRAPHY.body2,
    marginBottom: SPACING.xs,
  },
  taskDue: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
  },
  priorityContainer: {
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  priorityText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
  },
  completedTask: {
    opacity: 0.6,
  },
  completedText: {
    textDecorationLine: 'line-through',
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: SPACING.xs,
  },
  taskDescription: {
    ...TYPOGRAPHY.body2,
    marginBottom: SPACING.xs,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskSubjectText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
  },
  taskDueDate: {
    ...TYPOGRAPHY.caption,
  },
  menuButton: {
    padding: SPACING.xs,
  },
  listContainer: {
    paddingBottom: SPACING.lg,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    borderRadius: 12,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...TYPOGRAPHY.body1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    ...TYPOGRAPHY.body1,
    color: '#666',
  },
  addButtonText: {
    ...TYPOGRAPHY.body1,
    color: 'white',
    fontWeight: '600',
  },
});
