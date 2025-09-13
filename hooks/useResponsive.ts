import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  
  // Определяем размер экрана (исправлена логика breakpoints)
  const isExtraSmallScreen = width < 300; // Экстремально маленькие экраны (очень старые устройства)
  const isVerySmallScreen = width < 320; // Очень маленькие экраны (старые устройства)
  const isSmallScreen = width < 375;     // Маленькие экраны (iPhone SE, small Android)
  const isMediumScreen = width >= 375 && width < 414; // Средние экраны (iPhone 8, etc)
  const isLargeScreen = width >= 414;    // Большие экраны (iPhone Plus, Pro, большие Android)
  
  // Размеры карточек в зависимости от экрана
  const cardGap = isExtraSmallScreen ? 6 : isVerySmallScreen ? 8 : isSmallScreen ? 8 : isMediumScreen ? 10 : 12;
  const horizontalPadding = isExtraSmallScreen ? 8 : isVerySmallScreen ? 10 : isSmallScreen ? 12 : isMediumScreen ? 16 : 20;
  
  // Размеры карточек для главной страницы (2x2 grid)
  const cardWidth = (width - (horizontalPadding * 2) - cardGap) / 2;
  const cardHeight = isExtraSmallScreen ? 120 : isVerySmallScreen ? 130 : isSmallScreen ? 140 : isMediumScreen ? 150 : 160;
  
  // Адаптивная типографика
  const fontSize = {
    small: isExtraSmallScreen ? 10 : isVerySmallScreen ? 11 : isSmallScreen ? 12 : 13,
    body: isExtraSmallScreen ? 12 : isVerySmallScreen ? 13 : isSmallScreen ? 14 : 16,
    title: isExtraSmallScreen ? 16 : isVerySmallScreen ? 17 : isSmallScreen ? 18 : 20,
    header: isExtraSmallScreen ? 20 : isVerySmallScreen ? 22 : isSmallScreen ? 24 : 28,
  };

  const spacing = {
    xs: isExtraSmallScreen ? 2 : isVerySmallScreen ? 3 : isSmallScreen ? 4 : 6,
    sm: isExtraSmallScreen ? 6 : isVerySmallScreen ? 7 : isSmallScreen ? 8 : 10,
    md: isExtraSmallScreen ? 8 : isVerySmallScreen ? 10 : isSmallScreen ? 12 : 16,
    lg: isExtraSmallScreen ? 12 : isVerySmallScreen ? 14 : isSmallScreen ? 16 : 24,
    xl: isExtraSmallScreen ? 16 : isVerySmallScreen ? 20 : isSmallScreen ? 24 : 32,
  };
  
  return {
    width,
    height,
    isExtraSmallScreen,
    isVerySmallScreen,
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
