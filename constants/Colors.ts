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
    text: '#F9FAFB',          // Gray-50
    textSecondary: '#D1D5DB',  // Gray-300
    background: '#111827',     // Gray-900
    backgroundSecondary: '#1F2937', // Gray-800
    surface: '#1F2937',        // Gray-800
    surfaceSecondary: '#374151', // Gray-700
    primary: primaryDark,
    secondary: secondaryDark,
    accent: '#34D399',         // Emerald-400
    success: '#10B981',        // Emerald-500
    warning: '#FBBF24',        // Amber-400
    error: '#F87171',          // Red-400
    tint: primaryDark,
    icon: '#D1D5DB',
    tabIconDefault: '#9CA3AF', // Gray-400
    tabIconSelected: primaryDark,
    border: '#374151',         // Gray-700
    borderLight: '#4B5563',    // Gray-600
    card: '#1F2937',
    notification: '#F87171',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
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
