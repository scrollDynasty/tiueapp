import { authApi } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DebugScreen() {
  const [tokenInfo, setTokenInfo] = useState<string>('');

  const checkStoredToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userStr = await AsyncStorage.getItem('userInfo');
      
      setTokenInfo(`Token: ${token ? 'exists (' + token.substring(0, 8) + '...)' : 'null'}\nUser: ${userStr ? 'exists' : 'null'}`);
    } catch (error) {
      setTokenInfo('Error checking storage');
    }
  };

  const clearStorage = async () => {
    try {
      await authApi.clearStorage();
      Alert.alert('Success', 'Storage cleared successfully');
      setTokenInfo('Storage cleared');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear storage');
    }
  };

  const testCurrentUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      Alert.alert('API Response', JSON.stringify(response, null, 2));
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Tools</Text>
      
      <TouchableOpacity style={styles.button} onPress={checkStoredToken}>
        <Text style={styles.buttonText}>Check Stored Token</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={clearStorage}>
        <Text style={styles.buttonText}>Clear Storage</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={testCurrentUser}>
        <Text style={styles.buttonText}>Test getCurrentUser</Text>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.infoText}>{tokenInfo}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  info: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
});
