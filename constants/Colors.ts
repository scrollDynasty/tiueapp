const primaryLight = '#4F46E5';
const primaryDark = '#818CF8';
const secondaryLight = '#EC4899';
const secondaryDark = '#F472B6';

export const Colors = {
  light: {
    text: '#1F2937',
    textSecondary: '#6B7280',
    background: '#F9FAFB',
    backgroundSecondary: '#F3F4F6',
    surface: '#FFFFFF',
    surfaceSecondary: '#F3F4F6',
    primary: primaryLight,
    secondary: secondaryLight,
    accent: '#10B981',
    success: '#059669',
    warning: '#F59E0B',
    error: '#DC2626',
    tint: primaryLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: primaryLight,
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    card: '#FFFFFF',
    notification: '#DC2626',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    text: '#F1F5F9',
    textSecondary: '#E2E8F0',
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    primary: '#6366F1',
    secondary: '#EC4899',
    accent: '#10B981',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    tint: '#6366F1',
    icon: '#E2E8F0',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#6366F1',
    border: '#475569',
    borderLight: '#64748B',
    card: '#1E293B',
    notification: '#EF4444',
    shadow: 'rgba(0, 0, 0, 0.4)',
  },
};

export const getThemeColors = (isDarkMode: boolean) => {
  return isDarkMode ? Colors.dark : Colors.light;
};

export const Gradients = {
  primary: ['#4F46E5', '#7C3AED'] as [string, string],
  secondary: ['#EC4899', '#F472B6'] as [string, string],
  accent: ['#10B981', '#34D399'] as [string, string],
  success: ['#059669', '#10B981'] as [string, string],
  warning: ['#F59E0B', '#FBBF24'] as [string, string],
  sunset: ['#F97316', '#FB923C'] as [string, string],
  ocean: ['#0EA5E9', '#06B6D4'] as [string, string],
  purple: ['#7C3AED', '#A855F7'] as [string, string],
  pink: ['#EC4899', '#F472B6'] as [string, string],
  emerald: ['#059669', '#10B981'] as [string, string],
  royal: ['#4F46E5', '#EC4899'] as [string, string],
  vibrant: ['#F59E0B', '#EC4899'] as [string, string],
};
