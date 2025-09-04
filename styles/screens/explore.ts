import { StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { hp, LAYOUT, SHADOWS, SIZES, SPACING, TYPOGRAPHY, wp } from '../global';

export const exploreStyles = StyleSheet.create({
  container: {
    ...LAYOUT.container,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  header: {
    backgroundColor: Colors.light.success,
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
  searchButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SIZES.border.round,
    padding: SPACING.sm,
  },
  searchContainer: {
    backgroundColor: Colors.light.surface,
    margin: SPACING.md,
    borderRadius: SIZES.border.medium,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  searchInput: {
    ...LAYOUT.row,
    ...LAYOUT.alignCenter,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: SIZES.border.medium,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInputText: {
    ...TYPOGRAPHY.body1,
    color: Colors.light.text,
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.containerHorizontal,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
    ...LAYOUT.alignCenter,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: Colors.light.text,
    fontWeight: '600',
  },
  seeAllButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  seeAllText: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  categoriesGrid: {
    ...LAYOUT.row,
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryCard: {
    width: (wp(100) - SPACING.containerHorizontal * 2 - SPACING.sm) / 2,
    backgroundColor: Colors.light.surface,
    borderRadius: SIZES.border.medium,
    padding: SPACING.md,
    ...LAYOUT.center,
    ...SHADOWS.small,
    minHeight: hp(12),
  },
  categoryIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    ...LAYOUT.center,
    marginBottom: SPACING.sm,
  },
  categoryTitle: {
    ...TYPOGRAPHY.body1,
    color: Colors.light.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryCount: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  newsCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: SIZES.border.medium,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  newsImage: {
    width: '100%',
    height: hp(20),
    backgroundColor: Colors.light.backgroundSecondary,
  },
  newsContent: {
    padding: SPACING.md,
  },
  newsDate: {
    ...TYPOGRAPHY.caption,
    color: Colors.light.textSecondary,
    marginBottom: SPACING.xs,
  },
  newsTitle: {
    ...TYPOGRAPHY.h4,
    color: Colors.light.text,
    marginBottom: SPACING.sm,
  },
  newsDescription: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.textSecondary,
    marginBottom: SPACING.sm,
  },
  newsFooter: {
    ...LAYOUT.row,
    ...LAYOUT.spaceBetween,
    ...LAYOUT.alignCenter,
  },
  newsCategory: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SIZES.border.small,
  },
  newsCategoryText: {
    ...TYPOGRAPHY.caption,
    color: '#ffffff',
    fontWeight: '600',
  },
  newsAuthor: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.textSecondary,
  },
  quickActionsGrid: {
    ...LAYOUT.row,
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickActionCard: {
    width: (wp(100) - SPACING.containerHorizontal * 2 - SPACING.sm * 2) / 3,
    backgroundColor: Colors.light.surface,
    borderRadius: SIZES.border.medium,
    padding: SPACING.md,
    ...LAYOUT.center,
    ...SHADOWS.small,
    aspectRatio: 1,
  },
  quickActionIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    ...LAYOUT.center,
    marginBottom: SPACING.sm,
  },
  quickActionTitle: {
    ...TYPOGRAPHY.body2,
    color: Colors.light.text,
    fontWeight: '600',
    textAlign: 'center',
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
});
