// Дизайн-токены для университетского приложения
export const Colors = {
  // Основные цвета
  surface: '#FFFFFF',
  surfaceSubtle: '#F5F7FB',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  
  // Брендовые цвета
  brandPrimary: '#2563EB',
  brandPrimary10: '#EBF2FF',
  brandHover: '#1D4ED8',
  brandPressed: '#1E40AF',
  
  // Структурные цвета
  strokeSoft: '#E5EAF2',
  chipBg: '#EEF4FF',
  chipIcon: '#3B82F6',
  shadowUmbra: 'rgba(16, 24, 40, 0.06)',
  
  // Навигация
  tabInactive: '#94A3B8',
  tabActiveShadow: 'rgba(59, 130, 246, 0.25)',
  
  // Фокус и состояния
  focusRing: '#93C5FD',
  error: '#EF4444',
};

export const Radius = {
  card: 16,
  pill: 20,
  icon: 12,
};

export const Spacing = {
  xxs: 4,
  xs: 8,
  s: 12,
  m: 16,
  l: 24,
  xl: 32,
};

export const Typography = {
  displayH1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    fontFamily: 'Inter-Bold',
  },
  titleH2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
    fontFamily: 'Inter-SemiBold',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
    fontFamily: 'Inter-Medium',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
    fontFamily: 'Inter-Medium',
  },
};

export const Animation = {
  duration: {
    short: 160,
    medium: 240,
    long: 360,
  },
  spring: {
    damping: 18,
    stiffness: 220,
    mass: 1,
  },
  easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 8,
  },
  cardHover: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 12,
  },
  tab: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -6,
    },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 5,
  },
};
