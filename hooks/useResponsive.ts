import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  
  const responsiveValues = useMemo(() => {
    // Простые и надёжные breakpoints
    const isSmall = width < 360;      // Маленькие устройства
    const isMedium = width >= 360 && width < 414; // Средние устройства  
    const isLarge = width >= 414;     // Большие устройства
    
    // Базовые размеры
    const padding = isSmall ? 12 : isMedium ? 16 : 20;
    const gap = isSmall ? 8 : 12;
    
    // Размеры карточек для сетки 2x2 (уменьшены для лучшей адаптации)
    const cardWidth = (width - (padding * 2) - gap) / 2;
    const cardHeight = isSmall ? 100 : isMedium ? 120 : 140;
    
    // Адаптивная типографика (уменьшены размеры)
    const typography = {
      xs: isSmall ? 9 : 10,
      sm: isSmall ? 11 : 12, 
      md: isSmall ? 13 : 14,
      lg: isSmall ? 15 : isMedium ? 16 : 18,
      xl: isSmall ? 18 : isMedium ? 20 : 24,
    };

    // Адаптивные отступы
    const spacing = {
      xs: isSmall ? 4 : 6,
      sm: isSmall ? 8 : 12,
      md: isSmall ? 12 : 16,
      lg: isSmall ? 16 : 24,
      xl: isSmall ? 24 : 32,
    };

    // Радиусы скругления
    const borderRadius = {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
    };

    return {
      // Screen info
      width,
      height,
      isSmall,
      isMedium, 
      isLarge,
      
      // Layout
      padding,
      gap,
      cardWidth,
      cardHeight,
      
      // Typography
      typography,
      
      // Spacing
      spacing,
      
      // Border radius
      borderRadius,
      
      // Legacy support (для обратной совместимости)
      horizontalPadding: padding,
      cardGap: gap,
      isVerySmallScreen: isSmall,
      isSmallScreen: isSmall,
      isExtraSmallScreen: isSmall,
      fontSize: {
        small: typography.sm,
        body: typography.md,
        title: typography.lg,
        header: typography.xl,
      },
    };
  }, [width, height]);

  return responsiveValues;
}
