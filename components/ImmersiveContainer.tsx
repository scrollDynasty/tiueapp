import React from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');

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
  
  // Для Android добавляем дополнительные отступы снизу
  // чтобы контент не перекрывался скрытой навигацией
  const getBottomPadding = () => {
    if (Platform.OS !== 'android') return insets.bottom;
    
    // Для высоких экранов (современные Android) добавляем больше отступа
    const isHighScreen = screenHeight > 800;
    const basePadding = Math.max(insets.bottom, 24);
    
    return includeNavigationBar ? (isHighScreen ? basePadding + 24 : basePadding + 16) : 0;
  };

  const getTopPadding = () => {
    if (Platform.OS !== 'android') return insets.top;
    
    return includeStatusBar ? Math.max(insets.top, 24) : 0;
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
