/**
 * Modern color scheme for student life app with vibrant accent colors
 * Inspired by contemporary app design with better contrast and accessibility
 */

const primaryLight = '#4F46E5'; // Indigo-600
const primaryDark = '#818CF8';  // Indigo-400
const secondaryLight = '#EC4899'; // Pink-500
const secondaryDark = '#F472B6';  // Pink-400

export const Colors = {
  light: {
    text: '#1F2937',        // Gray-800
    textSecondary: '#6B7280', // Gray-500
    background: '#F9FAFB',    // Gray-50
    backgroundSecondary: '#F3F4F6', // Gray-100
    surface: '#FFFFFF',       // White
    surfaceSecondary: '#F3F4F6', // Gray-100
    primary: primaryLight,
    secondary: secondaryLight,
    accent: '#10B981',        // Emerald-500
    success: '#059669',       // Emerald-600
    warning: '#F59E0B',       // Amber-500
    error: '#DC2626',         // Red-600
    tint: primaryLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF', // Gray-400
    tabIconSelected: primaryLight,
    border: '#E5E7EB',        // Gray-200
    borderLight: '#F3F4F6',   // Gray-100
    card: '#FFFFFF',
    notification: '#DC2626',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    text: '#F1F5F9',          // Slate-100 (более яркий белый)
    textSecondary: '#E2E8F0',  // Slate-200 (более яркий серый)
    background: '#0F172A',     // Slate-900
    backgroundSecondary: '#1E293B', // Slate-800
    surface: '#1E293B',        // Slate-800
    surfaceSecondary: '#334155', // Slate-700
    primary: '#6366F1',        // Indigo-500 (более яркий в темной теме)
    secondary: '#EC4899',      // Pink-500
    accent: '#10B981',         // Emerald-500
    success: '#22C55E',        // Green-500
    warning: '#F59E0B',        // Amber-500
    error: '#EF4444',          // Red-500
    tint: '#6366F1',
    icon: '#E2E8F0',           // Slate-200 (ярче)
    tabIconDefault: '#94A3B8', // Slate-400 (ярче)
    tabIconSelected: '#6366F1',
    border: '#475569',         // Slate-600 (ярче для лучшей видимости)
    borderLight: '#64748B',    // Slate-500
    card: '#1E293B',
    notification: '#EF4444',
    shadow: 'rgba(0, 0, 0, 0.4)',
  },
};

// Функция для получения цветов текущей темы
export const getThemeColors = (isDarkMode: boolean) => {
  return isDarkMode ? Colors.dark : Colors.light;
};

export const Gradients = {
  primary: ['#4F46E5', '#7C3AED'] as [string, string],     // Indigo to Purple
  secondary: ['#EC4899', '#F472B6'] as [string, string],   // Pink gradient
  accent: ['#10B981', '#34D399'] as [string, string],      // Emerald gradient
  success: ['#059669', '#10B981'] as [string, string],     // Success green
  warning: ['#F59E0B', '#FBBF24'] as [string, string],     // Amber gradient
  sunset: ['#F97316', '#FB923C'] as [string, string],      // Orange gradient
  ocean: ['#0EA5E9', '#06B6D4'] as [string, string],       // Blue to cyan
  purple: ['#7C3AED', '#A855F7'] as [string, string],      // Purple gradient
  pink: ['#EC4899', '#F472B6'] as [string, string],        // Pink gradient
  emerald: ['#059669', '#10B981'] as [string, string],     // Emerald gradient
  royal: ['#4F46E5', '#EC4899'] as [string, string],       // Indigo to pink
  vibrant: ['#F59E0B', '#EC4899'] as [string, string],     // Amber to pink
};
