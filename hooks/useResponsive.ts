import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  
  // Определяем размер экрана
  const isSmallScreen = width < 375;
  const isMediumScreen = width >= 375 && width < 414;
  const isLargeScreen = width >= 414;
  
  // Размеры карточек в зависимости от экрана
  const cardGap = isSmallScreen ? 8 : isMediumScreen ? 10 : 12;
  const horizontalPadding = isSmallScreen ? 12 : isMediumScreen ? 16 : 20;
  
  // Размеры карточек для главной страницы (2x2 grid)
  const cardWidth = (width - (horizontalPadding * 2) - cardGap) / 2;
  const cardHeight = isSmallScreen ? 140 : isMediumScreen ? 150 : 160;
  
  // Адаптивная типографика
  const fontSize = {
    small: isSmallScreen ? 12 : 13,
    body: isSmallScreen ? 14 : 16,
    title: isSmallScreen ? 18 : 20,
    header: isSmallScreen ? 24 : 28,
  };
  
  const spacing = {
    xs: isSmallScreen ? 4 : 6,
    sm: isSmallScreen ? 8 : 10,
    md: isSmallScreen ? 12 : 16,
    lg: isSmallScreen ? 16 : 24,
    xl: isSmallScreen ? 24 : 32,
  };
  
  return {
    width,
    height,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    cardGap,
    horizontalPadding,
    cardWidth,
    cardHeight,
    fontSize,
    spacing,
  };
}
