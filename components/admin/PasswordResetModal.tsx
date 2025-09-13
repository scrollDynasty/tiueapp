import { ThemedText } from '@/components/ThemedText';
import { Colors, Radius, Spacing, Typography } from '@/constants/DesignTokens';
import React from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: 'student' | 'professor' | 'admin';
  is_active: boolean;
  created_at: string;
  last_login?: string;
  faculty?: string;
  course?: number;
  group?: string;
  department?: string;
}

interface PasswordResetModalProps {
  isVisible: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onReset: (password: string) => void;
}

export const PasswordResetModal = React.memo(({ 
  isVisible, 
  user, 
  onClose, 
  onReset 
}: PasswordResetModalProps) => {
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = React.useCallback(async () => {
    if (!password.trim()) {
      Alert.alert('Ошибка', 'Введите новый пароль');
      return;
    }

    if (password.trim().length < 6) {
      Alert.alert('Ошибка', 'Пароль должен содержать не менее 6 символов');
      return;
    }

    try {
      setIsLoading(true);
      await onReset(password.trim());
      setPassword('');
      onClose();
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Ошибка', 'Не удалось сбросить пароль');
    } finally {
      setIsLoading(false);
    }
  }, [password, onReset, onClose]);

  const handleClose = React.useCallback(() => {
    setPassword('');
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ThemedText style={styles.modalTitle}>
            Сброс пароля
          </ThemedText>
          
          {user && (
            <ThemedText style={styles.userInfo}>
              {user.first_name} {user.last_name} ({user.email})
            </ThemedText>
          )}

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Новый пароль</ThemedText>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Введите новый пароль"
              placeholderTextColor={Colors.textSecondary}
              autoFocus
            />
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <ThemedText style={styles.cancelButtonText}>
                Отмена
              </ThemedText>
            </Pressable>

            <Pressable
              style={[styles.button, styles.resetButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.surface} style={styles.loadingIndicator} />
              ) : null}
              <ThemedText style={styles.resetButtonText}>
                {isLoading ? 'Сброс...' : 'Сбросить'}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
});

PasswordResetModal.displayName = 'PasswordResetModal';

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.l,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.l,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    ...Typography.titleH2,
    color: Colors.textPrimary,
    marginBottom: Spacing.m,
    textAlign: 'center',
  },
  userInfo: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.l,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: Spacing.l,
  },
  label: {
    ...Typography.caption,
    color: Colors.textPrimary,
    marginBottom: Spacing.s,
  },
  input: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: Radius.icon,
    padding: Spacing.m,
    color: Colors.textPrimary,
    ...Typography.body,
    borderWidth: 1,
    borderColor: Colors.strokeSoft,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.m,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.m,
    borderRadius: Radius.icon,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: Colors.surfaceSubtle,
  },
  resetButton: {
    backgroundColor: Colors.brandPrimary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  resetButtonText: {
    ...Typography.body,
    color: Colors.surface,
  },
  loadingIndicator: {
    marginRight: Spacing.s,
  },
});