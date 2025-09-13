import { ThemedText } from '@/components/ThemedText';
import { Colors, Radius, Spacing, Typography } from '@/constants/DesignTokens';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

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

interface UserFormModalProps {
  isVisible: boolean;
  editingUser: UserProfile | null;
  onClose: () => void;
  onSave: (userData: any) => Promise<void>;
}

// Определяем тип для ref
interface UserFormModalRef {
  // Добавьте методы, которые должны быть доступны через ref
  resetForm?: () => void;
  focusFirstInput?: () => void;
}

const UserFormModal = React.forwardRef<UserFormModalRef, UserFormModalProps>(
  ({ isVisible, editingUser, onClose, onSave }, ref) => {
    // Имплементируем ref методы
    React.useImperativeHandle(ref, () => ({
      resetForm: () => {
        // логика сброса формы
      },
      focusFirstInput: () => {
        // логика фокуса на первый input
      },
    }));

    // Остальная логика компонента
    return (
      <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </Pressable>
            <ThemedText style={styles.title}>
              {editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
            </ThemedText>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView style={styles.content}>
            {/* Форма будет здесь */}
          </ScrollView>
          
          <View style={styles.footer}>
            <Pressable style={styles.saveButton} onPress={() => onSave({})}>
              <ThemedText style={styles.saveButtonText}>Сохранить</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }
);

UserFormModal.displayName = 'UserFormModal';

export default UserFormModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.strokeSoft,
  },
  closeButton: {
    padding: Spacing.s,
  },
  title: {
    ...Typography.titleH2,
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: Spacing.l,
  },
  inputContainer: {
    marginBottom: Spacing.l,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.m,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    ...Typography.caption,
    color: Colors.textPrimary,
    marginBottom: Spacing.s,
    fontWeight: '600',
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
  roleSelector: {
    flexDirection: 'row',
    gap: Spacing.s,
  },
  roleOption: {
    flex: 1,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.s,
    borderRadius: Radius.icon,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.strokeSoft,
  },
  selectedRole: {
    backgroundColor: Colors.brandPrimary,
    borderColor: Colors.brandPrimary,
  },
  roleText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  selectedRoleText: {
    color: Colors.surface,
  },
  footer: {
    padding: Spacing.l,
    borderTopWidth: 1,
    borderTopColor: Colors.strokeSoft,
  },
  saveButton: {
    backgroundColor: Colors.brandPrimary,
    borderRadius: Radius.icon,
    paddingVertical: Spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...Typography.body,
    color: Colors.surface,
    fontWeight: '600',
  },
  loadingIndicator: {
    marginRight: Spacing.s,
  },
});