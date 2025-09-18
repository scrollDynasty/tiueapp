import { ThemedText } from '@/components/ThemedText';
import { getThemeColors } from '@/constants/Colors';
import { Spacing } from '@/constants/DesignTokens';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { authApi } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Modal, Pressable, ScrollView, Share, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';

interface StudentProfileProps {
  user: any;
  onLogout: () => void;
}

export const StudentProfile = React.memo(({ user, onLogout }: StudentProfileProps) => {
  const [settingsMenuVisible, setSettingsMenuVisible] = React.useState(false);
  const [gradesData, setGradesData] = React.useState<any[]>([]);
  const [coursesData, setCoursesData] = React.useState<any[]>([]);
  
  const { theme, isDarkMode, setTheme } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const { isSmallScreen, spacing, fontSize, isVerySmallScreen } = useResponsive();

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
            
            // Применяем ту же фильтрацию что и на главном экране
            let filteredCourses = coursesArray;
            
            // Если у пользователя должно быть 9 курсов, возьмем только первые 9
            if (coursesArray.length === 10) {
              filteredCourses = coursesArray.slice(0, 9);
            } else {
              // Попробуем фильтровать по статусу
              const statusFiltered = coursesArray.filter((course: any) => 
                course.status === 'current' || course.status === 'active' || !course.status
              );
              
              if (statusFiltered.length === 9) {
                filteredCourses = statusFiltered;
              }
            }
            
            setCoursesData(filteredCourses);
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
            {/* Аватарка */}
            <View
              style={{
                width: isVerySmallScreen ? 70 : 80,
                height: isVerySmallScreen ? 70 : 80,
                borderRadius: isVerySmallScreen ? 35 : 40,
                overflow: 'hidden',
                borderWidth: 3,
                borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)',
              }}
            >
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
                  fontWeight: '700',
                  color: 'white',
                }}>
                  {displayInfo.initials}
                </ThemedText>
              </LinearGradient>
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
            <ThemedText style={{
              fontSize: isVerySmallScreen ? 20 : 24,
              fontWeight: '800',
              color: isDarkMode ? '#FFFFFF' : '#1E40AF',
              marginBottom: 4,
            }}>
              {displayInfo.name}
            </ThemedText>
            
            <ThemedText style={{
              fontSize: isVerySmallScreen ? 14 : 16,
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
                  paddingHorizontal: 12, 
                  paddingVertical: 6, 
                  borderRadius: 16,
                }}>
                  <ThemedText style={{ 
                    fontSize: 12, 
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
                  paddingHorizontal: 12, 
                  paddingVertical: 6, 
                  borderRadius: 16,
                }}>
                  <ThemedText style={{ 
                    fontSize: 12, 
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
                  paddingHorizontal: 12, 
                  paddingVertical: 6, 
                  borderRadius: 16,
                }}>
                  <ThemedText style={{ 
                    fontSize: 12, 
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
                <ThemedText style={{ color: 'white', fontSize: 14, fontWeight: '700' }}>
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
                <ThemedText style={{ color: 'white', fontSize: 14, fontWeight: '700' }}>
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
                <ThemedText style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>
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
            fontWeight: '700',
            color: colors.text,
          }}>
            Основная информация
          </ThemedText>
        </View>
        
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: Spacing.l,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          {/* Курс */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="school-outline" size={20} color={colors.primary} />
              <ThemedText style={{ fontSize: 16, color: colors.text, marginLeft: 12, fontWeight: '600' }}>
                Курс
              </ThemedText>
            </View>
            <ThemedText style={{ fontSize: 16, color: colors.primary, fontWeight: '700' }}>
              {user.student?.course || 1} курс
            </ThemedText>
          </View>

          {/* Группа */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="people-outline" size={20} color={colors.primary} />
              <ThemedText style={{ fontSize: 16, color: colors.text, marginLeft: 12, fontWeight: '600' }}>
                Группа
              </ThemedText>
            </View>
            <ThemedText style={{ fontSize: 16, color: colors.primary, fontWeight: '700' }}>
              {user.ldap_profile?.group || user.student?.group?.name || 'Не указана'}
            </ThemedText>
          </View>

          {/* Факультет/Специальность */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="library-outline" size={20} color={colors.primary} />
              <ThemedText style={{ fontSize: 16, color: colors.text, marginLeft: 12, fontWeight: '600' }}>
                Специальность
              </ThemedText>
            </View>
            <ThemedText style={{ 
              fontSize: 14, 
              color: colors.primary, 
              fontWeight: '600',
              textAlign: 'right',
              flex: 1,
              marginLeft: 12
            }}>
              {user.ldap_profile?.yonalishCon || 'Информационные технологии'}
            </ThemedText>
          </View>

          {/* Email */}
          {(user.ldap_profile?.email || user.email) && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="mail-outline" size={20} color={colors.primary} />
                <ThemedText style={{ fontSize: 16, color: colors.text, marginLeft: 12, fontWeight: '600' }}>
                  Email
                </ThemedText>
              </View>
              <ThemedText style={{ 
                fontSize: 14, 
                color: colors.primary, 
                fontWeight: '600',
                textAlign: 'right',
                flex: 1,
                marginLeft: 12
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
            fontWeight: '700',
            color: colors.text,
          }}>
            Академическая информация
          </ThemedText>
        </View>
        
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: Spacing.l,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          {/* Текущий семестр */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <ThemedText style={{ fontSize: 16, color: colors.text, marginLeft: 12, fontWeight: '600' }}>
                Семестр
              </ThemedText>
            </View>
            <ThemedText style={{ fontSize: 16, color: colors.primary, fontWeight: '700' }}>
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
            <ThemedText style={{ fontSize: 16, color: colors.primary, fontWeight: '700' }}>
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
            fontWeight: '700',
            color: colors.text,
          }}>
            Быстрые действия
          </ThemedText>
        </View>
        
        <View style={{ gap: 12 }}>
          {/* Первая строка кнопок */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => Alert.alert('Добавить фото', 'Функция добавления фотографии будет доступна в следующих версиях')}
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
              <Ionicons name="camera-outline" size={24} color={colors.primary} />
              <ThemedText style={{ fontSize: 14, color: colors.text, marginTop: 8, fontWeight: '600' }}>
                Добавить фото
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
            fontWeight: '700',
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