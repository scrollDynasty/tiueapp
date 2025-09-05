import { ThemedText } from '@/components/ThemedText';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Интерфейс пользователя
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

export default function UsersManagementScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  // Состояние для создания пользователя
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

  // Состояние для управления пользователями
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterRole, setFilterRole] = React.useState<'all' | 'student' | 'professor' | 'admin'>('all');
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserProfile | null>(null);

  // Моковые данные пользователей (в реальном приложении будут из API)
  const [users, setUsers] = React.useState<UserProfile[]>([
    {
      id: '1',
      first_name: 'Иван',
      last_name: 'Петров',
      username: 'ivan_petrov',
      email: 'ivan@university.edu',
      role: 'student',
      is_active: true,
      created_at: '2024-01-15',
      faculty: 'Информационные технологии',
      course: 2,
      group: 'ИТ-21',
    },
    {
      id: '2', 
      first_name: 'Мария',
      last_name: 'Иванова',
      username: 'maria_ivanova',
      email: 'maria@university.edu',
      role: 'professor',
      is_active: true,
      created_at: '2023-09-01',
      department: 'Кафедра программирования',
    },
    {
      id: '3',
      first_name: 'Анна',
      last_name: 'Сидорова',
      username: 'anna_admin',
      email: 'anna@university.edu',
      role: 'admin',
      is_active: true,
      created_at: '2023-01-01',
      last_login: '2024-12-01',
    },
  ]);

  // Фильтрация пользователей
  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, filterRole]);

  // Компонент карточки пользователя
  const UserCard = ({ 
    user, 
    onEdit,
    onToggleStatus, 
    onDelete,
    animationDelay = 0 
  }: { 
    user: UserProfile; 
    onEdit: (user: UserProfile) => void;
    onToggleStatus: (userId: string) => void;
    onDelete: (userId: string) => void;
    animationDelay?: number;
  }) => (
    <Animated.View entering={FadeInDown.delay(animationDelay)}>
      <View style={{
        backgroundColor: Colors.surface,
        borderRadius: Radius.card,
        padding: Spacing.m,
        marginBottom: Spacing.s,
        borderLeftWidth: 4,
        borderLeftColor: user.role === 'admin' ? '#EF4444' : user.role === 'professor' ? '#3B82F6' : '#10B981',
        ...Shadows.card,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
              <ThemedText style={{ ...Typography.titleH2, color: Colors.textPrimary, fontSize: 16 }}>
                {user.first_name} {user.last_name}
              </ThemedText>
              {!user.is_active && (
                <View style={{
                  backgroundColor: '#FEE2E2',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 10,
                  marginLeft: 8,
                }}>
                  <ThemedText style={{ fontSize: 10, color: '#DC2626', fontWeight: '600' }}>
                    НЕАКТИВЕН
                  </ThemedText>
                </View>
              )}
            </View>
            
            <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: 2 }}>
              @{user.username} • {user.email}
            </ThemedText>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
              <View style={{
                backgroundColor: user.role === 'admin' ? '#FEE2E2' : user.role === 'professor' ? '#DBEAFE' : '#D1FAE5',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}>
                <ThemedText style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: user.role === 'admin' ? '#DC2626' : user.role === 'professor' ? '#2563EB' : '#059669',
                }}>
                  {user.role === 'admin' ? 'Администратор' : user.role === 'professor' ? 'Преподаватель' : 'Студент'}
                </ThemedText>
              </View>
            </View>

            {/* Дополнительная информация в зависимости от роли */}
            {user.role === 'student' && (user.faculty || user.group) && (
              <ThemedText style={{ ...Typography.caption, color: Colors.textSecondary }}>
                {user.faculty && `${user.faculty}`}
                {user.course && ` • ${user.course} курс`}
                {user.group && ` • группа ${user.group}`}
              </ThemedText>
            )}
            
            {user.role === 'professor' && user.department && (
              <ThemedText style={{ ...Typography.caption, color: Colors.textSecondary }}>
                {user.department}
              </ThemedText>
            )}
          </View>

          {/* Кнопки управления */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {/* Переключатель активности */}
            <Pressable
              onPress={() => onToggleStatus(user.id)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: user.is_active ? '#D1FAE5' : '#FEE2E2',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons 
                name={user.is_active ? 'checkmark' : 'close'} 
                size={18} 
                color={user.is_active ? '#059669' : '#DC2626'} 
              />
            </Pressable>

            {/* Кнопка редактирования */}
            <Pressable
              onPress={() => onEdit(user)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#DBEAFE',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="create-outline" size={18} color="#2563EB" />
            </Pressable>

            {/* Кнопка удаления */}
            <Pressable
              onPress={() => onDelete(user.id)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#FEE2E2',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  // Проверяем права доступа
  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.l }}>
          <Ionicons name="shield-outline" size={64} color={Colors.textSecondary} />
          <ThemedText style={{ ...Typography.titleH2, color: Colors.textSecondary, marginTop: Spacing.l }}>
            Доступ запрещен
          </ThemedText>
          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: Colors.brandPrimary,
              paddingHorizontal: Spacing.l,
              paddingVertical: Spacing.m,
              borderRadius: Radius.card,
              marginTop: Spacing.l,
            }}
          >
            <ThemedText style={{ ...Typography.body, color: Colors.surface }}>
              Назад
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Функция очистки формы
  const clearForm = () => {
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
    setEditingUser(null);
  };

  const handleCreateUser = async () => {
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim()) {
      Alert.alert('Ошибка', 'Заполните все обязательные поля');
      return;
    }

    if (!editingUser && !password.trim()) {
      Alert.alert('Ошибка', 'Введите пароль для нового пользователя');
      return;
    }

    setIsLoading(true);
    
    try {
      const userData: Partial<UserProfile> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        role: role,
        is_active: true,
        faculty: role === 'student' ? faculty : undefined,
        course: role === 'student' && course ? parseInt(course) : undefined,
        group: role === 'student' ? group : undefined,
        department: role === 'professor' ? department : undefined,
      };

      if (editingUser) {
        // Обновление существующего пользователя
        setUsers(prev => prev.map(u => 
          u.id === editingUser.id 
            ? { ...u, ...userData } as UserProfile
            : u
        ));
        Alert.alert('Успешно', 'Пользователь обновлен');
      } else {
        // Создание нового пользователя
        const newUser: UserProfile = {
          ...userData,
          id: Date.now().toString(),
          created_at: new Date().toISOString().split('T')[0],
        } as UserProfile;
        
        setUsers(prev => [...prev, newUser]);
        Alert.alert('Успешно', 'Пользователь создан');
      }
      
      clearForm();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error managing user:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить пользователя');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role);
    setFaculty(user.faculty || '');
    setCourse(user.course?.toString() || '');
    setGroup(user.group || '');
    setDepartment(user.department || '');
    setPassword(''); // Не показываем пароль при редактировании
    setShowCreateForm(true);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, is_active: !u.is_active }
        : u
    ));
  };

  const handleDeleteUser = (userId: string) => {
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите удалить этого пользователя?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => setUsers(prev => prev.filter(u => u.id !== userId))
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surfaceSubtle }}>
      <ScrollView contentContainerStyle={{ padding: Spacing.l }}>
        {/* Заголовок */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.l }}>
            <Pressable
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: Colors.surface,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: Spacing.m,
                ...Shadows.card,
              }}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.brandPrimary} />
            </Pressable>
            
            <View style={{ flex: 1 }}>
              <ThemedText style={{ ...Typography.displayH1, color: Colors.textPrimary }}>
                Управление пользователями
              </ThemedText>
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary }}>
                {users.length} пользователей в системе
              </ThemedText>
            </View>

            {/* Кнопка добавления пользователя */}
            <Pressable
              onPress={() => {
                setShowCreateForm(!showCreateForm);
                if (showCreateForm) {
                  clearForm();
                }
              }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: Colors.brandPrimary,
                justifyContent: 'center',
                alignItems: 'center',
                ...Shadows.card,
              }}
            >
              <Ionicons 
                name={showCreateForm ? "close" : "add"} 
                size={24} 
                color={Colors.surface} 
              />
            </Pressable>
          </View>
        </Animated.View>

        {/* Форма создания пользователя */}
        {showCreateForm && (
          <Animated.View entering={FadeInDown.duration(500).delay(200)}>
            <ThemedText style={{ ...Typography.titleH2, color: Colors.textPrimary, marginBottom: Spacing.m }}>
              {editingUser ? 'Редактировать пользователя' : 'Создать нового пользователя'}
            </ThemedText>
          
          <View style={{
            backgroundColor: Colors.surface,
            borderRadius: Radius.card,
            padding: Spacing.l,
            marginBottom: Spacing.l,
            ...Shadows.card,
          }}>
            {/* Имя и фамилия */}
            <View style={{ flexDirection: 'row', gap: Spacing.m, marginBottom: Spacing.m }}>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
                  Имя
                </ThemedText>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Введите имя"
                  style={{
                    backgroundColor: Colors.surfaceSubtle,
                    borderRadius: Radius.icon,
                    padding: Spacing.m,
                    fontSize: 16,
                    color: Colors.textPrimary,
                    borderWidth: 1,
                    borderColor: Colors.strokeSoft,
                  }}
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
                  Фамилия
                </ThemedText>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Введите фамилию"
                  style={{
                    backgroundColor: Colors.surfaceSubtle,
                    borderRadius: Radius.icon,
                    padding: Spacing.m,
                    fontSize: 16,
                    color: Colors.textPrimary,
                    borderWidth: 1,
                    borderColor: Colors.strokeSoft,
                  }}
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
            </View>

            {/* Username */}
            <View style={{ marginBottom: Spacing.m }}>
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
                Имя пользователя
              </ThemedText>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Введите имя пользователя"
                autoCapitalize="none"
                style={{
                  backgroundColor: Colors.surfaceSubtle,
                  borderRadius: Radius.icon,
                  padding: Spacing.m,
                  fontSize: 16,
                  color: Colors.textPrimary,
                  borderWidth: 1,
                  borderColor: Colors.strokeSoft,
                }}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            {/* Email */}
            <View style={{ marginBottom: Spacing.m }}>
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
                Email
              </ThemedText>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Введите email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  backgroundColor: Colors.surfaceSubtle,
                  borderRadius: Radius.icon,
                  padding: Spacing.m,
                  fontSize: 16,
                  color: Colors.textPrimary,
                  borderWidth: 1,
                  borderColor: Colors.strokeSoft,
                }}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            {/* Пароль */}
            <View style={{ marginBottom: Spacing.m }}>
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
                Пароль
              </ThemedText>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Введите пароль"
                secureTextEntry
                style={{
                  backgroundColor: Colors.surfaceSubtle,
                  borderRadius: Radius.icon,
                  padding: Spacing.m,
                  fontSize: 16,
                  color: Colors.textPrimary,
                  borderWidth: 1,
                  borderColor: Colors.strokeSoft,
                }}
                placeholderTextColor={Colors.textSecondary}
              />
            </View>

            {/* Роль */}
            <View style={{ marginBottom: Spacing.l }}>
              <ThemedText style={{ ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.s }}>
                Роль пользователя
              </ThemedText>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.surfaceSubtle,
                borderRadius: Radius.icon,
                padding: Spacing.m,
                borderWidth: 1,
                borderColor: Colors.strokeSoft,
              }}>
                <ThemedText style={{ ...Typography.body, color: Colors.textPrimary, flex: 1 }}>
                  {role === 'admin' ? 'Администратор' : 'Студент'}
                </ThemedText>
                <Switch 
                  value={role === 'admin'} 
                  onValueChange={(value) => setRole(value ? 'admin' : 'student')}
                  trackColor={{ false: Colors.strokeSoft, true: Colors.brandPrimary }}
                  thumbColor={role === 'admin' ? Colors.surface : Colors.textSecondary}
                />
              </View>
            </View>

            {/* Кнопка создания */}
            <Pressable
              onPress={handleCreateUser}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? Colors.strokeSoft : Colors.brandPrimary,
                paddingVertical: Spacing.m,
                borderRadius: Radius.card,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              {isLoading && (
                <ActivityIndicator 
                  size="small" 
                  color={Colors.textSecondary} 
                  style={{ marginRight: Spacing.s }} 
                />
              )}
              <ThemedText style={{ 
                ...Typography.body, 
                color: isLoading ? Colors.textSecondary : Colors.surface, 
                fontWeight: '600' 
              }}>
                {isLoading ? 'Создаем...' : 'Создать пользователя'}
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>
        )}

        {/* Поиск и фильтры */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.surface,
            borderRadius: Radius.card,
            padding: Spacing.m,
            marginBottom: Spacing.l,
            ...Shadows.card,
          }}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} style={{ marginRight: Spacing.s }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Поиск пользователей..."
              style={{
                flex: 1,
                fontSize: 16,
                color: Colors.textPrimary,
              }}
              placeholderTextColor={Colors.textSecondary}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Фильтр по ролям */}
        <Animated.View entering={FadeInDown.duration(500).delay(500)}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: Spacing.l }}
            contentContainerStyle={{ paddingHorizontal: 2 }}
          >
            {['all', 'student', 'professor', 'admin'].map((filter) => (
              <Pressable
                key={filter}
                onPress={() => setFilterRole(filter as any)}
                style={{
                  backgroundColor: filterRole === filter ? Colors.brandPrimary : Colors.surface,
                  paddingHorizontal: Spacing.l,
                  paddingVertical: Spacing.s,
                  borderRadius: Radius.card,
                  marginRight: Spacing.s,
                  ...Shadows.card,
                }}
              >
                <ThemedText style={{
                  ...Typography.body,
                  color: filterRole === filter ? Colors.surface : Colors.textPrimary,
                  fontWeight: filterRole === filter ? '600' : 'normal',
                }}>
                  {filter === 'all' ? 'Все' : 
                   filter === 'student' ? 'Студенты' :
                   filter === 'professor' ? 'Преподаватели' : 'Администраторы'}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Список пользователей */}
        <Animated.View entering={FadeInDown.duration(500).delay(600)}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: Spacing.m,
          }}>
            <ThemedText style={{ ...Typography.titleH2, color: Colors.textPrimary }}>
              Пользователи системы
            </ThemedText>
            <ThemedText style={{ ...Typography.body, color: Colors.textSecondary }}>
              {filteredUsers.length} из {users.length}
            </ThemedText>
          </View>

          {filteredUsers.length === 0 ? (
            <View style={{
              backgroundColor: Colors.surface,
              borderRadius: Radius.card,
              padding: Spacing.xl,
              alignItems: 'center',
              ...Shadows.card,
            }}>
              <Ionicons name="people-outline" size={48} color={Colors.textSecondary} />
              <ThemedText style={{ 
                ...Typography.titleH2, 
                color: Colors.textSecondary, 
                marginTop: Spacing.m,
                textAlign: 'center'
              }}>
                {searchQuery || filterRole !== 'all' ? 'Пользователи не найдены' : 'Пока нет пользователей'}
              </ThemedText>
              <ThemedText style={{ 
                ...Typography.body, 
                color: Colors.textSecondary, 
                marginTop: Spacing.s,
                textAlign: 'center'
              }}>
                {searchQuery || filterRole !== 'all' 
                  ? 'Попробуйте изменить критерии поиска' 
                  : 'Создайте первого пользователя с помощью кнопки выше'}
              </ThemedText>
            </View>
          ) : (
            <View style={{ gap: Spacing.m }}>
              {filteredUsers.map((user, index) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={handleEditUser}
                  onToggleStatus={handleToggleUserStatus}
                  onDelete={handleDeleteUser}
                  animationDelay={index * 100}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

