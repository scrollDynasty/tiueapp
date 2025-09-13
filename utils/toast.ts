import { Platform, ToastAndroid, Alert } from 'react-native';

/**
 * Shows a native toast on Android or a simple Alert on iOS.
 * @param message The message to display.
 */
export const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('Уведомление', message);
  }
};
