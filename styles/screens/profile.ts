import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { LAYOUT, SHADOWS, SIZES, SPACING, TYPOGRAPHY, wp } from '../global';

export const profileStyles = StyleSheet.create({
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
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.containerHorizontal,
    borderBottomLeftRadius: SIZES.border.large,
    borderBottomRightRadius: SIZES.border.large,
    ...LAYOUT.center,
  },
  avatar: {
    width: wp(25),
    height: wp(25),
    borderRadius: wp(12.5),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    ...LAYOUT.center,
    marginBottom: SPACING.md,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    ...TYPOGRAPHY.h1,
    color: '#ffffff',
    fontWeight: '700',
  },
  userName: {
    ...TYPOGRAPHY.h2,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  userInfo: {
    ...TYPOGRAPHY.body1,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SIZES.border.round,
    padding: SPACING.sm,
    marginTop: SPACING.md,
  },
  editButtonText: {
    ...TYPOGRAPHY.body2,
    color: '#ffffff',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: SPACING.containerHorizontal,
  },
  statsSection: {
    backgroundColor: Colors.light.surface,
    borderRadius: SIZES.border.medium,
    padding: SPACING.md,
    margin: SPACING.md,
    ...SHADOWS.small,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: Colors.light.text,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  statsContainer: {
    ...LAYOUT.row,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: SIZES.border.medium,
    padding: SPACING.md,
    ...LAYOUT.center,
  },
  statNumber: {
    ...TYPOGRAPHY.h3,
    color: Colors.light.primary,
    fontWeight: '700',
  },
  statLabel: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: Colors.light.surface,
    borderRadius: SIZES.border.medium,
    margin: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  menuItem: {
    ...LAYOUT.row,
    ...LAYOUT.alignCenter,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    ...LAYOUT.center,
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...TYPOGRAPHY.body1,
    color: Colors.light.text,
    fontWeight: '600',
  },
  menuDescription: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.textSecondary,
    marginTop: SPACING.xs,
  },
  menuChevron: {
    marginLeft: SPACING.sm,
  },
  achievementsSection: {
    backgroundColor: Colors.light.surface,
    borderRadius: SIZES.border.medium,
    margin: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  achievementsGrid: {
    ...LAYOUT.row,
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  achievementItem: {
    width: (wp(100) - SPACING.containerHorizontal * 2 - SPACING.md * 2 - SPACING.sm * 2) / 3,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: SIZES.border.medium,
    padding: SPACING.md,
    ...LAYOUT.center,
    aspectRatio: 1,
  },
  achievementIcon: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: Colors.light.success,
    ...LAYOUT.center,
    marginBottom: SPACING.sm,
  },
  achievementTitle: {
    ...TYPOGRAPHY.caption,
    color: Colors.light.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: Colors.light.error,
    borderRadius: SIZES.border.medium,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    ...LAYOUT.center,
  },
  logoutButtonText: {
    ...TYPOGRAPHY.body1,
    color: '#ffffff',
    fontWeight: '600',
  },
});
