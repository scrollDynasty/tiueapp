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

export const UserFormModal = React.memo(({ 
  isVisible, 
  editingUser, 
  onClose, 
  onSave 
}: UserFormModalProps) => {
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<'student' | 'professor' | 'admin'>('student');
  const [faculty, setFaculty] = React.useState('');
  const [course, setCourse] = React.useState('');
  const [group, setGroup] = React.useState('');
  const [department, setDepartment] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // Заполнение формы при редактировании
  React.useEffect(() => {
    if (editingUser) {
      setFirstName(editingUser.first_name);
      setLastName(editingUser.last_name);
      setUsername(editingUser.username);
      setEmail(editingUser.email);
      setRole(editingUser.role);
      setFaculty(editingUser.faculty || '');
      setCourse(editingUser.course?.toString() || '');
      setGroup(editingUser.group || '');
      setDepartment(editingUser.department || '');
      setPassword(''); // Пароль не заполняем при редактировании
    } else {
      clearForm();
    }
  }, [editingUser]);

  const clearForm = React.useCallback(() => {
    setFirstName('');
    setLastName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('student');
    setFaculty('');
    setCourse('');
    setGroup('');
    setDepartment('');
  }, []);

  const validateForm = React.useCallback(() => {
    if (!firstName.trim()) {
      Alert.alert('Ошибка', 'Введите имя');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Ошибка', 'Введите фамилию');
      return false;
    }
    if (!username.trim()) {
      Alert.alert('Ошибка', 'Введите имя пользователя');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Ошибка', 'Введите email');
      return false;
    }
    if (!editingUser && !password.trim()) {
      Alert.alert('Ошибка', 'Введите пароль');
      return false;
    }
    if (!editingUser && password.trim().length < 6) {
      Alert.alert('Ошибка', 'Пароль должен содержать не менее 6 символов');
      return false;
    }

    // Валидация специфичных полей
    if (role === 'student') {
      if (!faculty.trim()) {
        Alert.alert('Ошибка', 'Введите факультет для студента');
        return false;
      }
      if (!course.trim()) {
        Alert.alert('Ошибка', 'Введите курс для студента');
        return false;
      }
      if (!group.trim()) {
        Alert.alert('Ошибка', 'Введите группу для студента');
        return false;
      }
    }

    if (role === 'professor' && !department.trim()) {
      Alert.alert('Ошибка', 'Введите кафедру для преподавателя');
      return false;
    }

    return true;
  }, [firstName, lastName, username, email, password, role, faculty, course, group, department, editingUser]);

  const handleSave = React.useCallback(async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      const userData: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        role,
      };

      if (!editingUser) {
        userData.password = password.trim();
      }

      // Добавляем специфичные поля
      if (role === 'student') {
        userData.faculty = faculty.trim();
        userData.course = parseInt(course.trim()) || 1;
        userData.group = group.trim();
      } else if (role === 'professor') {
        userData.department = department.trim();
      }

      await onSave(userData);
      clearForm();
      onClose();
    } catch (error) {
      console.error('Form save error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, firstName, lastName, username, email, password, role, faculty, course, group, department, editingUser, onSave, clearForm, onClose]);

  const handleClose = React.useCallback(() => {
    clearForm();
    onClose();
  }, [clearForm, onClose]);

  const renderRoleSpecificFields = React.useCallback(() => {
    if (role === 'student') {
      return (
        <>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Факультет *</ThemedText>
            <TextInput
              style={styles.input}
              value={faculty}
              onChangeText={setFaculty}
              placeholder="Введите факультет"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <ThemedText style={styles.label}>Курс *</ThemedText>
              <TextInput
                style={styles.input}
                value={course}
                onChangeText={setCourse}
                placeholder="1"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <ThemedText style={styles.label}>Группа *</ThemedText>
              <TextInput
                style={styles.input}
                value={group}
                onChangeText={setGroup}
                placeholder="ИТ-21"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>
        </>
      );
    }

    if (role === 'professor') {
      return (
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Кафедра *</ThemedText>
          <TextInput
            style={styles.input}
            value={department}
            onChangeText={setDepartment}
            placeholder="Введите кафедру"
            placeholderTextColor={Colors.textSecondary}
          />
        </View>
      );
    }

    return null;
  }, [role, faculty, course, group, department]);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </Pressable>
          <ThemedText style={styles.title}>
            {editingUser ? 'Редактировать пользователя' : 'Новый пользователь'}
          </ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <ThemedText style={styles.label}>Имя *</ThemedText>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Иван"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
            <View style={styles.halfInput}>
              <ThemedText style={styles.label}>Фамилия *</ThemedText>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Иванов"
                placeholderTextColor={Colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Имя пользователя *</ThemedText>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="ivan.ivanov"
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email *</ThemedText>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="ivan.ivanov@university.edu"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {!editingUser && (
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Пароль *</ThemedText>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Минимум 6 символов"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Роль *</ThemedText>
            <View style={styles.roleSelector}>
              {(['student', 'professor', 'admin'] as const).map((r) => (
                <Pressable
                  key={r}
                  style={[
                    styles.roleOption,
                    role === r && styles.selectedRole
                  ]}
                  onPress={() => setRole(r)}
                >
                  <ThemedText style={[
                    styles.roleText,
                    role === r && styles.selectedRoleText
                  ]}>
                    {r === 'student' ? 'Студент' : r === 'professor' ? 'Преподаватель' : 'Администратор'}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          {renderRoleSpecificFields()}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading && (
              <ActivityIndicator size="small" color={Colors.surface} style={styles.loadingIndicator} />
            )}
            <ThemedText style={styles.saveButtonText}>
              {isLoading ? 'Сохранение...' : editingUser ? 'Сохранить изменения' : 'Создать пользователя'}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
});

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