import { StyleSheet } from 'react-native';
import { SHADOWS, SPACING, TYPOGRAPHY } from '../global';

export const exploreStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h1,
    marginBottom: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    ...TYPOGRAPHY.body1,
  },
  newsCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  newsImage: {
    width: '100%',
    height: 200,
  },
  newsContent: {
    padding: SPACING.md,
  },
  newsCategory: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  newsTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.sm,
  },
  newsPreview: {
    ...TYPOGRAPHY.body2,
    marginBottom: SPACING.sm,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsDate: {
    ...TYPOGRAPHY.caption,
  },
  newsAuthor: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.body1,
    marginTop: SPACING.md,
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
