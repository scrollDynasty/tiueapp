import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const responsiveValues = useMemo(() => {

    const isExtraSmall = width < 320;
    const isSmall = width < 375;
    const isMedium = width >= 375 && width < 414;
    const isLarge = width >= 414;

    const padding = isExtraSmall ? 8 : isSmall ? 12 : isMedium ? 16 : 20;
    const gap = isExtraSmall ? 6 : isSmall ? 8 : 10;

    const cardWidth = (width - (padding * 2) - gap) / 2;
    const cardHeight = isExtraSmall ? 90 : isSmall ? 105 : isMedium ? 125 : 140;

    const typography = {
      xs: isExtraSmall ? 8 : isSmall ? 9 : 10,
      sm: isExtraSmall ? 10 : isSmall ? 11 : 12,
      md: isExtraSmall ? 12 : isSmall ? 13 : 14,
      lg: isExtraSmall ? 14 : isSmall ? 15 : isMedium ? 16 : 18,
      xl: isExtraSmall ? 16 : isSmall ? 18 : isMedium ? 20 : 24,
      xxl: isExtraSmall ? 20 : isSmall ? 22 : isMedium ? 24 : 28,
    };

    const spacing = {
      xs: isExtraSmall ? 2 : isSmall ? 4 : 6,
      sm: isExtraSmall ? 6 : isSmall ? 8 : 10,
      md: isExtraSmall ? 10 : isSmall ? 12 : 16,
      lg: isExtraSmall ? 14 : isSmall ? 16 : 20,
      xl: isExtraSmall ? 20 : isSmall ? 24 : 28,
      xxl: isExtraSmall ? 28 : isSmall ? 32 : 36,
    };

    const borderRadius = {
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
    };

    return {

      width,
      height,
      isExtraSmall,
      isSmall,
      isMedium,
      isLarge,

      padding,
      gap,
      cardWidth,
      cardHeight,

      typography,

      spacing,

      borderRadius,

      horizontalPadding: padding,
      cardGap: gap,
      isVerySmallScreen: isSmall,
      isSmallScreen: isSmall,
      isExtraSmallScreen: isExtraSmall,
      fontSize: {
        small: typography.sm,
        body: typography.md,
        title: typography.lg,
        header: typography.xl,
        large: typography.xxl,
      },
    };
  }, [width, height]);

  return responsiveValues;
}
