import { StyleSheet } from 'react-native';
import { SHADOWS, SPACING, TYPOGRAPHY } from '../global';

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  name: {
    ...TYPOGRAPHY.h1,
    marginBottom: SPACING.xs,
  },
  info: {
    ...TYPOGRAPHY.body2,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    marginBottom: SPACING.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: SPACING.xs,
    ...SHADOWS.small,
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
  },
  menuItemText: {
    ...TYPOGRAPHY.body1,
    marginLeft: SPACING.md,
    flex: 1,
  },
  gradeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  gradeSubject: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
    flex: 1,
  },
  gradeValue: {
    ...TYPOGRAPHY.h3,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
});
