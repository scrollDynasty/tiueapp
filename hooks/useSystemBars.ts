import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useSystemBars() {
  const insets = useSafeAreaInsets();

  // Возвращаем простые безопасные отступы
  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
  };
}
