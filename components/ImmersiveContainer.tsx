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

  const getBottomPadding = () => {
    return 0;
  };

  const getTopPadding = () => {
    if (Platform.OS === 'android') {

      return includeStatusBar ? Math.max(insets.top, 0) : 0;
    }

    if (Platform.OS === 'ios') {

      if (insets.top >= 55) {
         return 0;
      }

      if (insets.top >= 44) {
        return 0;
      }

      return 0;
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
