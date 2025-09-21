import { ThemedText } from '@/components/ThemedText';
import { getThemeColors } from '@/constants/Colors';
import { Spacing } from '@/constants/DesignTokens';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useResponsive } from '@/hooks/useResponsive';
import { authApi } from '@/services/api';
import { setCredentials } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, Share, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';

interface StudentProfileProps {
  user: any;
  onLogout: () => void;
}

export const StudentProfile = React.memo(({ user, onLogout }: StudentProfileProps) => {
  const [settingsMenuVisible, setSettingsMenuVisible] = React.useState(false);
  const [gradesData, setGradesData] = React.useState<any[]>([]);
  const [coursesData, setCoursesData] = React.useState<any[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [currentAvatar, setCurrentAvatar] = React.useState<string | null>(user?.avatar || null);
  
  const { theme, isDarkMode, setTheme } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const { isSmallScreen, spacing, fontSize, isVerySmallScreen } = useResponsive();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  // Обновляем локальную аватарку когда пользователь изменяется
  React.useEffect(() => {
    setCurrentAvatar(user?.avatar || null);
  }, [user?.avatar]);

  // Загружаем данные студента для статистики
  React.useEffect(() => {
    const fetchStudentData = async () => {
      if (user?.role === 'student') {
        try {
          const [gradesResponse, coursesResponse] = await Promise.all([
            authApi.getGrades(),
            authApi.getCourses()
          ]);

          if (gradesResponse.success && gradesResponse.data) {
            const responseData = gradesResponse.data as any || {};
            const gradesArray = Array.isArray(responseData.data) ? responseData.data : [];
            setGradesData(gradesArray);
          }

          if (coursesResponse.success && coursesResponse.data) {
            const responseData = coursesResponse.data as any || {};
            const coursesArray = Array.isArray(responseData.data) ? responseData.data : [];
            
            // Показываем все курсы без ограничений
            setCoursesData(coursesArray);
          }
        } catch (error) {
          console.error('Error fetching student data:', error);
        }
      }
    };

    fetchStudentData();
  }, [user]);

  // Расчет GPA
  const calculateGPA = React.useCallback((grades: any[]) => {
    if (grades.length === 0) return 0;
    const total = grades.reduce((sum, grade) => {
      return sum + parseFloat(grade.final_grade || grade.grade || grade.score || 0);
    }, 0);
    return Math.round((total / grades.length) * 100) / 100;
  }, []);
  
  // Функция для получения инициалов
  const getInitials = React.useCallback((firstName?: string, lastName?: string, username?: string): string => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (username) return username.slice(0, 2).toUpperCase();
    return 'СТ';
  }, []);

  // Функция для загрузки аватара
  const pickImage = React.useCallback(async () => {
    try {
      // Запрашиваем разрешение на доступ к медиатеке
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Разрешение требуется', 'Разрешите доступ к фотографиям для загрузки аватара');
        return;
      }

      // Открываем выбор изображения
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Квадратное изображение для аватара
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Прямо загружаем аватар
        await uploadAvatar(result.assets[0]);
      }
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  }, []);

  // Функция для загрузки аватара
  const uploadAvatar = React.useCallback(async (imageAsset: ImagePicker.ImagePickerAsset) => {
    try {
      setUploadingAvatar(true);
      
      const response = await authApi.uploadAvatar(imageAsset);
      
      if (response.success && response.data?.avatar_url) {
        // Мгновенно обновляем локальную аватарку
        setCurrentAvatar(response.data.avatar_url);
        
        // Обновляем аватар в Redux store
        dispatch(setCredentials({
          user: { ...user, avatar: response.data.avatar_url },
          token: token || ''
        }));
        
        // Принудительно очищаем кеш пользователя в API для следующих запросов
        authApi.clearUserCache();
        
        Alert.alert('Успешно', 'Аватар обновлен');
      } else {
        Alert.alert('Ошибка', response.error || 'Не удалось загрузить аватар');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при загрузке аватара');
    } finally {
      setUploadingAvatar(false);
    }
  }, [dispatch]);

  
  const displayInfo = React.useMemo(() => {
    // Используем данные из LDAP профиля если они есть
    const ldapProfile = user.ldap_profile;
    const name = ldapProfile?.full_name || `${user.first_name} ${user.last_name}`.trim() || user.username;
    const groupName = ldapProfile?.group || user.student?.group?.name;
    const course = user.student?.course || 1;
    
    return {
      name,
      subtitle: groupName ? `Группа ${groupName} • ${course} курс` : 'Студент',
      roleColor: '#2563eb',
      initials: getInitials(user.first_name, user.last_name, user.username)
    };
  }, [user.first_name, user.last_name, user.username, user.student, user.ldap_profile, getInitials]);


  return (
    <>
      {/* Новый дизайн верхней части профиля */}
      <Animated.View entering={SlideInRight.duration(400)} style={{ marginTop: Spacing.m, marginBottom: Spacing.m }}>
        {/* Фоновый градиент */}
        <LinearGradient
          colors={isDarkMode 
            ? ['#1E40AF', '#3B82F6', '#60A5FA']
            : ['#EFF6FF', '#DBEAFE', '#BFDBFE']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: isVerySmallScreen ? 20 : 24,
            padding: isVerySmallScreen ? spacing.md : Spacing.l,
            marginBottom: Spacing.l,
          }}
        >
          {/* Верхняя строка с аватаром и меню */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.m }}>
            {/* Аватарка с возможностью загрузки */}
            <View
              style={{
                width: isVerySmallScreen ? 70 : 80,
                height: isVerySmallScreen ? 70 : 80,
                borderRadius: isVerySmallScreen ? 35 : 40,
                overflow: 'hidden',
                borderWidth: 3,
                borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)',
                position: 'relative',
              }}
            >
              {uploadingAvatar ? (
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <ActivityIndicator size="large" color="white" />
                </LinearGradient>
              ) : currentAvatar ? (
                <Image
                  source={{ uri: currentAvatar }}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
              ) : (
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <ThemedText style={{
                    fontSize: isVerySmallScreen ? 24 : 28,
                    fontWeight: '500',
                    color: 'white',
                  }}>
                    {displayInfo.initials}
                  </ThemedText>
                </LinearGradient>
              )}
              
              {/* Кнопка изменения аватара */}
              <Pressable
                onPress={pickImage}
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  backgroundColor: '#3B82F6',
                  borderRadius: 12,
                  padding: 4,
                  borderWidth: 2,
                  borderColor: 'white',
                }}
              >
                <Ionicons name="camera" size={14} color="white" />
              </Pressable>
            </View>
            
            {/* Меню настроек (три черточки как в Instagram) */}
            <TouchableOpacity
              onPress={() => setSettingsMenuVisible(true)}
              style={{
                padding: 8,
                borderRadius: 12,
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
              }}
            >
              <Ionicons 
                name="menu-outline" 
                size={24} 
                color={isDarkMode ? '#FFFFFF' : '#1E40AF'} 
              />
            </TouchableOpacity>
          </View>

          {/* Имя и информация */}
          <View style={{ marginBottom: Spacing.m }}>
            <ThemedText 
              numberOfLines={2}
              style={{
              fontSize: isVerySmallScreen ? 18 : 22,
              fontWeight: '600',
              color: isDarkMode ? '#FFFFFF' : '#1E40AF',
              marginBottom: 4,
              lineHeight: isVerySmallScreen ? 22 : 26,
            }}>
                {displayInfo.name}
              </ThemedText>
              
            <ThemedText 
              numberOfLines={1}
              style={{
              fontSize: isVerySmallScreen ? 13 : 15,
              color: isDarkMode ? 'rgba(255,255,255,0.8)' : '#3B82F6',
              marginBottom: 12,
            }}>
                {displayInfo.subtitle}
              </ThemedText>

            {/* Студенческая информация */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {user.ldap_profile?.yonalishCon && (
                    <View style={{ 
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)',
                  paddingHorizontal: isVerySmallScreen ? 8 : 12, 
                  paddingVertical: isVerySmallScreen ? 4 : 6, 
                  borderRadius: 16,
                  flex: 1,
                  maxWidth: isVerySmallScreen ? '45%' : 'auto',
                }}>
                  <ThemedText 
                    numberOfLines={1}
                    style={{ 
                    fontSize: isVerySmallScreen ? 10 : 12, 
                    fontWeight: '600',
                    color: isDarkMode ? '#FFFFFF' : '#1E40AF' 
                  }}>
                    {user.ldap_profile.yonalishCon}
                  </ThemedText>
                </View>
                  )}
              
              {user.ldap_profile?.group && (
                    <View style={{ 
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)',
                  paddingHorizontal: isVerySmallScreen ? 8 : 12, 
                  paddingVertical: isVerySmallScreen ? 4 : 6, 
                  borderRadius: 16,
                  flex: 1,
                  maxWidth: isVerySmallScreen ? '45%' : 'auto',
                }}>
                  <ThemedText 
                    numberOfLines={1}
                    style={{ 
                    fontSize: isVerySmallScreen ? 10 : 12, 
                    fontWeight: '600',
                    color: isDarkMode ? '#FFFFFF' : '#1E40AF' 
                  }}>
                    Группа {user.ldap_profile.group}
                  </ThemedText>
                </View>
                  )}

              {user.student?.course && (
                <View style={{ 
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)',
                  paddingHorizontal: isVerySmallScreen ? 8 : 12, 
                  paddingVertical: isVerySmallScreen ? 4 : 6, 
                  borderRadius: 16,
                  flex: 1,
                  maxWidth: isVerySmallScreen ? '45%' : 'auto',
                }}>
                  <ThemedText 
                    numberOfLines={1}
                    style={{ 
                    fontSize: isVerySmallScreen ? 10 : 12, 
                    fontWeight: '600',
                    color: isDarkMode ? '#FFFFFF' : '#1E40AF' 
                  }}>
                    {user.student.course} курс
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Академическая статистика с реальными данными */}
          <View style={{ 
            flexDirection: 'row', 
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)',
            borderRadius: 20,
            padding: Spacing.m,
            gap: 12,
          }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#10B981',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 6,
              }}>
                <ThemedText style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
                  {gradesData.length > 0 ? Math.round(calculateGPA(gradesData)) : '0'}
                </ThemedText>
              </View>
              <ThemedText style={{ 
                fontSize: 11, 
                fontWeight: '600',
                color: isDarkMode ? 'rgba(255,255,255,0.8)' : '#1E40AF', 
                textAlign: 'center' 
              }}>
                Средний балл
              </ThemedText>
            </View>
            
            <View style={{ alignItems: 'center', flex: 1 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#8B5CF6',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 6,
              }}>
                <ThemedText style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
                  {new Set(coursesData.map((course: any) => course.course_name || course.name)).size}
                </ThemedText>
              </View>
              <ThemedText style={{ 
                fontSize: 11, 
                fontWeight: '600',
                color: isDarkMode ? 'rgba(255,255,255,0.8)' : '#1E40AF', 
                textAlign: 'center' 
              }}>
                Предметов
              </ThemedText>
            </View>
            
            <View style={{ alignItems: 'center', flex: 1 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#F59E0B',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 6,
              }}>
                <ThemedText style={{ color: 'white', fontSize: 10, fontWeight: '500' }}>
                  Нет
                </ThemedText>
              </View>
              <ThemedText style={{ 
                fontSize: 11, 
                fontWeight: '600',
                color: isDarkMode ? 'rgba(255,255,255,0.8)' : '#1E40AF', 
                textAlign: 'center' 
              }}>
                Посещаемость
              </ThemedText>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Основная информация студента */}
      <Animated.View entering={FadeInDown.duration(500).delay(150)} style={{ marginBottom: Spacing.l }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
            marginBottom: Spacing.m,
        }}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}>
            <Ionicons name="school" size={16} color={colors.primary} />
          </View>
          <ThemedText style={{ 
            fontSize: isVerySmallScreen ? 16 : 18, 
            fontWeight: '500',
            color: colors.text,
          }}>
            Основная информация
          </ThemedText>
        </View>
          
          <View style={{
          backgroundColor: colors.surface,
          borderRadius: isVerySmallScreen ? 16 : 20,
          padding: isVerySmallScreen ? spacing.sm : Spacing.l,
            borderWidth: 1,
          borderColor: colors.border,
        }}>
          {/* Курс */}
          <View style={{ 
            flexDirection: isVerySmallScreen ? 'column' : 'row', 
            justifyContent: 'space-between', 
            alignItems: isVerySmallScreen ? 'flex-start' : 'center', 
            marginBottom: 16 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: isVerySmallScreen ? 4 : 0 }}>
              <Ionicons name="school-outline" size={isVerySmallScreen ? 18 : 20} color={colors.primary} />
              <ThemedText style={{ 
                fontSize: isVerySmallScreen ? 14 : 16, 
                color: colors.text, 
                marginLeft: isVerySmallScreen ? 8 : 12, 
                fontWeight: '600' 
              }}>
                Курс
                </ThemedText>
            </View>
            <ThemedText style={{ 
              fontSize: isVerySmallScreen ? 14 : 16, 
              color: colors.primary, 
              fontWeight: '500',
              marginLeft: isVerySmallScreen ? 26 : 0
            }}>
              {user.student?.course || 1} курс
                </ThemedText>
              </View>

          {/* Группа */}
          <View style={{ 
            flexDirection: isVerySmallScreen ? 'column' : 'row', 
            justifyContent: 'space-between', 
            alignItems: isVerySmallScreen ? 'flex-start' : 'center', 
            marginBottom: 16 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: isVerySmallScreen ? 4 : 0 }}>
              <Ionicons name="people-outline" size={isVerySmallScreen ? 18 : 20} color={colors.primary} />
              <ThemedText style={{ 
                fontSize: isVerySmallScreen ? 14 : 16, 
                color: colors.text, 
                marginLeft: isVerySmallScreen ? 8 : 12, 
                fontWeight: '600' 
              }}>
                Группа
                </ThemedText>
            </View>
            <ThemedText 
              numberOfLines={1}
              style={{ 
                fontSize: isVerySmallScreen ? 14 : 16, 
                color: colors.primary, 
                fontWeight: '500',
                marginLeft: isVerySmallScreen ? 26 : 0,
                flex: isVerySmallScreen ? 1 : 0
              }}>
              {user.ldap_profile?.group || user.student?.group?.name || 'Не указана'}
                </ThemedText>
              </View>

          {/* Факультет/Специальность */}
          <View style={{ 
            flexDirection: isVerySmallScreen ? 'column' : 'row', 
            justifyContent: 'space-between', 
            alignItems: isVerySmallScreen ? 'flex-start' : 'center', 
            marginBottom: 16 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: isVerySmallScreen ? 4 : 0 }}>
              <Ionicons name="library-outline" size={isVerySmallScreen ? 18 : 20} color={colors.primary} />
              <ThemedText style={{ 
                fontSize: isVerySmallScreen ? 14 : 16, 
                color: colors.text, 
                marginLeft: isVerySmallScreen ? 8 : 12, 
                fontWeight: '600' 
              }}>
                Специальность
                </ThemedText>
            </View>
            <ThemedText 
              numberOfLines={isVerySmallScreen ? 2 : 1}
              style={{ 
              fontSize: isVerySmallScreen ? 12 : 14, 
              color: colors.primary, 
              fontWeight: '600',
              textAlign: isVerySmallScreen ? 'left' : 'right',
              flex: 1,
              marginLeft: isVerySmallScreen ? 26 : 12
            }}>
              {user.ldap_profile?.yonalishCon || 'Информационные технологии'}
                </ThemedText>
              </View>

          {/* Email */}
          {(user.ldap_profile?.email || user.email) && (
            <View style={{ 
              flexDirection: isVerySmallScreen ? 'column' : 'row', 
              justifyContent: 'space-between', 
              alignItems: isVerySmallScreen ? 'flex-start' : 'center' 
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: isVerySmallScreen ? 4 : 0 }}>
                <Ionicons name="mail-outline" size={isVerySmallScreen ? 18 : 20} color={colors.primary} />
                <ThemedText style={{ 
                  fontSize: isVerySmallScreen ? 14 : 16, 
                  color: colors.text, 
                  marginLeft: isVerySmallScreen ? 8 : 12, 
                  fontWeight: '600' 
                }}>
                  Email
                </ThemedText>
              </View>
              <ThemedText 
                numberOfLines={1}
                style={{ 
                fontSize: isVerySmallScreen ? 12 : 14, 
                color: colors.primary, 
                fontWeight: '600',
                textAlign: isVerySmallScreen ? 'left' : 'right',
                flex: 1,
                marginLeft: isVerySmallScreen ? 26 : 12
              }}>
                {user.ldap_profile?.email || user.email}
                </ThemedText>
              </View>
            )}
        </View>
      </Animated.View>

      {/* Академическая информация */}
      <Animated.View entering={FadeInDown.duration(500).delay(200)} style={{ marginBottom: Spacing.l }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: Spacing.m,
        }}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}>
            <Ionicons name="analytics" size={16} color={colors.primary} />
          </View>
          <ThemedText style={{ 
            fontSize: isVerySmallScreen ? 16 : 18, 
            fontWeight: '500',
            color: colors.text,
          }}>
            Академическая информация
                </ThemedText>
              </View>
        
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: isVerySmallScreen ? 16 : 20,
          padding: isVerySmallScreen ? spacing.sm : Spacing.l,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          {/* Текущий семестр */}
          <View style={{ 
            flexDirection: isVerySmallScreen ? 'column' : 'row', 
            justifyContent: 'space-between', 
            alignItems: isVerySmallScreen ? 'flex-start' : 'center', 
            marginBottom: 16 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: isVerySmallScreen ? 4 : 0 }}>
              <Ionicons name="calendar-outline" size={isVerySmallScreen ? 18 : 20} color={colors.primary} />
              <ThemedText style={{ 
                fontSize: isVerySmallScreen ? 14 : 16, 
                color: colors.text, 
                marginLeft: isVerySmallScreen ? 8 : 12, 
                fontWeight: '600' 
              }}>
                Семестр
                </ThemedText>
            </View>
            <ThemedText style={{ 
              fontSize: isVerySmallScreen ? 14 : 16, 
              color: colors.primary, 
              fontWeight: '500',
              marginLeft: isVerySmallScreen ? 26 : 0
            }}>
              {new Date().getMonth() >= 8 ? 'Осенний' : 'Весенний'} {new Date().getFullYear()}
                </ThemedText>
              </View>

          {/* Средний балл (GPA) */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="trophy-outline" size={20} color={colors.primary} />
              <ThemedText style={{ fontSize: 16, color: colors.text, marginLeft: 12, fontWeight: '600' }}>
                Средний балл (GPA)
                </ThemedText>
              </View>
            <ThemedText style={{ fontSize: 16, color: colors.primary, fontWeight: '500' }}>
              {gradesData.length > 0 ? calculateGPA(gradesData).toFixed(1) : 'Нет данных'}
                </ThemedText>
              </View>

          {/* Статус студента */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
              <ThemedText style={{ fontSize: 16, color: colors.text, marginLeft: 12, fontWeight: '600' }}>
                Статус
                </ThemedText>
              </View>
            <View style={{
              backgroundColor: '#10B981',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
            }}>
              <ThemedText style={{ fontSize: 12, color: 'white', fontWeight: '600' }}>
                Активный
                </ThemedText>
              </View>
          </View>
          </View>
        </Animated.View>

      {/* Основные кнопки действий */}
      <Animated.View entering={FadeInDown.duration(500).delay(300)} style={{ marginBottom: Spacing.l }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: Spacing.m,
        }}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}>
            <Ionicons name="apps" size={16} color={colors.primary} />
          </View>
          <ThemedText style={{ 
            fontSize: isVerySmallScreen ? 16 : 18, 
            fontWeight: '500',
            color: colors.text,
          }}>
            Быстрые действия
        </ThemedText>
        </View>
        
        <View style={{ gap: 12 }}>
          {/* Первая строка кнопок */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={pickImage}
              disabled={uploadingAvatar}
              style={{
                flex: 1,
                backgroundColor: uploadingAvatar ? colors.background : colors.surface,
                borderRadius: isVerySmallScreen ? 12 : 16,
                padding: isVerySmallScreen ? 12 : 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
                opacity: uploadingAvatar ? 0.6 : 1,
              }}
            >
              <Ionicons 
                name={uploadingAvatar ? "hourglass-outline" : "person-circle-outline"} 
                size={24} 
                color={colors.primary} 
              />
              <ThemedText style={{ fontSize: 14, color: colors.text, marginTop: 8, fontWeight: '600' }}>
                {uploadingAvatar ? 'Загрузка...' : 'Изменить аватар'}
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/schedule')}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: isVerySmallScreen ? 12 : 16,
                padding: isVerySmallScreen ? 12 : 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons name="calendar-outline" size={24} color={colors.primary} />
              <ThemedText style={{ fontSize: 14, color: colors.text, marginTop: 8, fontWeight: '600' }}>
                Расписание
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Вторая строка кнопок */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => Alert.alert('Связаться', 'Функция связи будет доступна в следующих версиях')}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: isVerySmallScreen ? 12 : 16,
                padding: isVerySmallScreen ? 12 : 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
              <ThemedText style={{ fontSize: 14, color: colors.text, marginTop: 8, fontWeight: '600' }}>
                Связаться
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={async () => {
                try {
                  const name = user.ldap_profile?.full_name || `${user.first_name} ${user.last_name}`.trim() || user.username;
                  const contactInfo = `${name}\nГруппа: ${user.ldap_profile?.group || 'Не указана'}\nEmail: ${user.ldap_profile?.email || user.email || 'Не указан'}`;
                  await Share.share({
                    message: contactInfo,
                    title: 'Контактная информация студента'
                  });
                } catch (error) {
                  Alert.alert('Ошибка', 'Не удалось поделиться контактом');
                }
              }}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: isVerySmallScreen ? 12 : 16,
                padding: isVerySmallScreen ? 12 : 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons name="share-outline" size={24} color={colors.primary} />
              <ThemedText style={{ fontSize: 14, color: colors.text, marginTop: 8, fontWeight: '600' }}>
                Поделиться
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Блок "Достижения" */}
      <Animated.View entering={FadeInDown.duration(500).delay(350)} style={{ marginBottom: Spacing.l }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: Spacing.m,
        }}>
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}>
            <Ionicons name="trophy" size={16} color={colors.primary} />
          </View>
          <ThemedText style={{ 
            fontSize: isVerySmallScreen ? 16 : 18, 
            fontWeight: '500',
            color: colors.text,
          }}>
            Достижения
        </ThemedText>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
          style={{ marginBottom: Spacing.m }}
        >
          {/* Академические достижения */}
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            marginRight: 12,
            alignItems: 'center',
            minWidth: 120,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#10B981',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8,
            }}>
              <Ionicons name="school" size={24} color="white" />
            </View>
            <ThemedText style={{ fontSize: 12, color: colors.text, textAlign: 'center', fontWeight: '600' }}>
              Отличная успеваемость
            </ThemedText>
          </View>

          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            marginRight: 12,
            alignItems: 'center',
            minWidth: 120,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#8B5CF6',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8,
            }}>
              <Ionicons name="ribbon" size={24} color="white" />
            </View>
            <ThemedText style={{ fontSize: 12, color: colors.text, textAlign: 'center', fontWeight: '600' }}>
              Сертификаты
            </ThemedText>
          </View>

          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            marginRight: 12,
            alignItems: 'center',
            minWidth: 120,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#F59E0B',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8,
            }}>
              <Ionicons name="people" size={24} color="white" />
            </View>
            <ThemedText style={{ fontSize: 12, color: colors.text, textAlign: 'center', fontWeight: '600' }}>
              Участие в проектах
            </ThemedText>
          </View>

          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            marginRight: 12,
            alignItems: 'center',
            minWidth: 120,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#EF4444',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 8,
            }}>
              <Ionicons name="star" size={24} color="white" />
            </View>
            <ThemedText style={{ fontSize: 12, color: colors.text, textAlign: 'center', fontWeight: '600' }}>
              Награды
            </ThemedText>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Компактная кнопка выхода */}
      <Animated.View entering={FadeInDown.duration(500).delay(400)} style={{ 
        marginTop: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : Spacing.l 
      }}>
        <Pressable
          onPress={onLogout}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#DC2626' : '#EF4444',
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Spacing.l,
            borderWidth: 1,
            borderColor: pressed ? '#B91C1C' : '#DC2626',
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Ionicons 
            name="log-out-outline" 
            size={20} 
            color="white" 
            style={{ marginRight: 8 }} 
          />
          <ThemedText style={{ 
            fontSize: 16,
            fontWeight: '600',
            color: 'white',
          }}>
            Выйти из аккаунта
          </ThemedText>
        </Pressable>
      </Animated.View>


      {/* Меню настроек (выпадающее) */}
      <Modal
        visible={settingsMenuVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSettingsMenuVisible(false)}
      >
            <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setSettingsMenuVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 100, paddingRight: 20 }}>
            <Animated.View 
              entering={FadeInDown.duration(300)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 16,
                minWidth: 200,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <TouchableOpacity
                onPress={async () => {
                  setSettingsMenuVisible(false);
                  try {
                    const name = user.ldap_profile?.full_name || `${user.first_name} ${user.last_name}`.trim() || user.username;
                    const contactInfo = `${name}\nГруппа: ${user.ldap_profile?.group || 'Не указана'}\nEmail: ${user.ldap_profile?.email || user.email || 'Не указан'}`;
                    await Share.share({
                      message: contactInfo,
                      title: 'Профиль студента'
                    });
                  } catch (error) {
                    Alert.alert('Ошибка', 'Не удалось поделиться профилем');
                  }
                }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
              >
                <Ionicons name="share-outline" size={20} color={colors.primary} />
                <ThemedText style={{ fontSize: 16, color: colors.text, marginLeft: 12 }}>
                  Поделиться профилем
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSettingsMenuVisible(false);
                  Alert.alert('QR-код', 'QR-код студента будет доступен в следующих версиях');
                }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
              >
                <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
                <ThemedText style={{ fontSize: 16, color: colors.text, marginLeft: 12 }}>
                  QR-код студента
              </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSettingsMenuVisible(false);
                  Alert.alert('Копирование', 'Контактная информация скопирована в буфер обмена');
                }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
              >
                <Ionicons name="copy-outline" size={20} color={colors.primary} />
                <ThemedText style={{ fontSize: 16, color: colors.text, marginLeft: 12 }}>
                  Скопировать контакт
              </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setSettingsMenuVisible(false);
                  Alert.alert('Избранное', 'Добавлено в избранное');
                }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
              >
                <Ionicons name="heart-outline" size={20} color={colors.primary} />
                <ThemedText style={{ fontSize: 16, color: colors.text, marginLeft: 12 }}>
                  Добавить в избранное
              </ThemedText>
              </TouchableOpacity>
            </Animated.View>
          </View>
            </Pressable>
      </Modal>

    </>
  );
});

StudentProfile.displayName = 'StudentProfile';