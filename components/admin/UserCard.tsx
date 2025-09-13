import { ThemedText } from '@/components/ThemedText';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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

interface UserCardProps {
  user: UserProfile;
  onEdit: (user: UserProfile) => void;
  onToggleStatus: (userId: string) => void;
  onDelete: (userId: string) => void;
  onResetPassword: (userId: string) => void;
  animationDelay?: number;
}

export const UserCard = React.memo(({ 
  user, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onResetPassword,
  animationDelay = 0 
}: UserCardProps) => {
  
  const handleEdit = React.useCallback(() => onEdit(user), [onEdit, user]);
  const handleToggleStatus = React.useCallback(() => onToggleStatus(user.id), [onToggleStatus, user.id]);
  const handleDelete = React.useCallback(() => onDelete(user.id), [onDelete, user.id]);
  const handleResetPassword = React.useCallback(() => onResetPassword(user.id), [onResetPassword, user.id]);

  const getRoleText = (role: string) => {
    switch (role) {
      case 'student': return 'Студент';
      case 'professor': return 'Преподаватель';
      case 'admin': return 'Администратор';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return '#10B981';
      case 'professor': return '#8B5CF6';
      case 'admin': return '#EF4444';
      default: return Colors.textSecondary;
    }
  };

  return (
    <View style={[styles.card, !user.is_active && styles.inactiveCard]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <ThemedText style={styles.userName}>
            {user.first_name} {user.last_name}
          </ThemedText>
          <ThemedText style={styles.userEmail}>
            {user.email}
          </ThemedText>
          <View style={styles.roleContainer}>
            <View style={[styles.roleChip, { backgroundColor: getRoleColor(user.role) + '15' }]}>
              <ThemedText style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                {getRoleText(user.role)}
              </ThemedText>
            </View>
            <View style={[styles.statusChip, user.is_active ? styles.activeChip : styles.inactiveChip]}>
              <ThemedText style={[styles.statusText, user.is_active ? styles.activeText : styles.inactiveText]}>
                {user.is_active ? 'Активен' : 'Заблокирован'}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Дополнительная информация для студентов и преподавателей */}
      {(user.role === 'student' || user.role === 'professor') && (
        <View style={styles.additionalInfo}>
          {user.role === 'student' && (
            <>
              {user.faculty && (
                <View style={styles.infoItem}>
                  <Ionicons name="school-outline" size={16} color={Colors.textSecondary} />
                  <ThemedText style={styles.infoText}>Факультет: {user.faculty}</ThemedText>
                </View>
              )}
              {user.course && (
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                  <ThemedText style={styles.infoText}>Курс: {user.course}</ThemedText>
                </View>
              )}
              {user.group && (
                <View style={styles.infoItem}>
                  <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
                  <ThemedText style={styles.infoText}>Группа: {user.group}</ThemedText>
                </View>
              )}
            </>
          )}
          {user.role === 'professor' && user.department && (
            <View style={styles.infoItem}>
              <Ionicons name="business-outline" size={16} color={Colors.textSecondary} />
              <ThemedText style={styles.infoText}>Кафедра: {user.department}</ThemedText>
            </View>
          )}
        </View>
      )}

      {/* Кнопки действий */}
      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
        >
          <Ionicons name="pencil" size={16} color={Colors.surface} />
          <ThemedText style={styles.editButtonText}>Редактировать</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.actionButton, user.is_active ? styles.blockButton : styles.activateButton]}
          onPress={handleToggleStatus}
        >
          <Ionicons 
            name={user.is_active ? "ban" : "checkmark-circle"} 
            size={16} 
            color={Colors.surface} 
          />
          <ThemedText style={styles.actionButtonText}>
            {user.is_active ? 'Заблокировать' : 'Активировать'}
          </ThemedText>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.passwordButton]}
          onPress={handleResetPassword}
        >
          <Ionicons name="key" size={16} color={Colors.surface} />
          <ThemedText style={styles.actionButtonText}>Пароль</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Ionicons name="trash" size={16} color={Colors.surface} />
          <ThemedText style={styles.actionButtonText}>Удалить</ThemedText>
        </Pressable>
      </View>
    </View>
  );
});

UserCard.displayName = 'UserCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.l,
    marginBottom: Spacing.m,
    ...Shadows.card,
  },
  inactiveCard: {
    opacity: 0.7,
    borderWidth: 1,
    borderColor: Colors.strokeSoft,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.m,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.titleH2,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.s,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: Spacing.s,
  },
  roleChip: {
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  roleText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  statusChip: {
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  activeChip: {
    backgroundColor: '#10B98115',
  },
  inactiveChip: {
    backgroundColor: '#EF444415',
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  activeText: {
    color: '#10B981',
  },
  inactiveText: {
    color: '#EF4444',
  },
  additionalInfo: {
    marginBottom: Spacing.m,
    gap: Spacing.xs,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.s,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    borderRadius: Radius.icon,
    flex: 1,
    minWidth: 100,
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: Colors.brandPrimary,
  },
  blockButton: {
    backgroundColor: '#EF4444',
  },
  activateButton: {
    backgroundColor: '#10B981',
  },
  passwordButton: {
    backgroundColor: '#8B5CF6',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  editButtonText: {
    ...Typography.caption,
    color: Colors.surface,
    fontWeight: '600',
  },
  actionButtonText: {
    ...Typography.caption,
    color: Colors.surface,
    fontWeight: '600',
  },
});