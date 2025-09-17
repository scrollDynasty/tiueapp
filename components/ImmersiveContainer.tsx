import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



interface ImmersiveContainerProps {
  children: React.ReactNode;
  backgroundColor?: string;
  includeStatusBar?: boolean;
  includeNavigationBar?: boolean;
}

export const ImmersiveContainer: React.FC<ImmersiveContainerProps> = ({ 
  children, 
  backgroundColor = '#fff',
  includeStatusBar = false,
  includeNavigationBar = true 
}) => {
  const insets = useSafeAreaInsets();
  
  // Убираем все отступы для табов - они сами позиционируются
  const getBottomPadding = () => {
    return 0; // Полностью убираем отступы снизу
  };

  const getTopPadding = () => {
    if (Platform.OS === 'android') {
      // Для Android минимизируем отступы - используем только статус бар если нужен
      return includeStatusBar ? Math.max(insets.top, 0) : 0;
    }
    
    // iOS - исправляем проблему с Dynamic Island
    if (Platform.OS === 'ios') {
      // Dynamic Island устройства (iPhone 14 Pro/Max и новее)
      if (insets.top >= 55) {
        console.log('🏝️ Dynamic Island detected in ImmersiveContainer:', insets.top);
         return 0; // Минимальный отступ 10px для Dynamic Island
      }
      // Обычные устройства iOS с челкой
      if (insets.top >= 44) {
        return 0; // Минимальный отступ 10px для старых устройств
      }
      // Старые устройства iOS
      return 0; // Минимальный отступ 10px для старых устройств
    }
    
    return insets.top;
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor,
        paddingTop: getTopPadding(),
        paddingBottom: getBottomPadding(),
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
