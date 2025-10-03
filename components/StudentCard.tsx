import { ThemedText } from '@/components/ThemedText';
import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { memo } from 'react';
import { Image, Platform, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Student {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  student?: {
    group?: {
      name: string;
    };
    department?: string;
  };
}

interface StudentCardProps {
  student: Student;
  index: number;
}

// Мемоизированная карточка студента для оптимизации
const StudentCard = memo(({ student, index }: StudentCardProps) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const { fontSize, spacing, isVerySmallScreen } = useResponsive();

  const handlePress = () => {
    router.push({
      pathname: '/student-profile/[id]',
      params: {
        id: student.id,
        username: student.username,
        email: student.email,
        first_name: student.first_name,
        last_name: student.last_name,
        avatar: student.avatar || '',
        student: JSON.stringify(student.student || {})
      }
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(400)}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.md,
        marginBottom: spacing.sm,
        shadowColor: Platform.OS === 'android' ? 'transparent' : colors.primary,
        shadowOffset: { width: 0, height: Platform.OS === 'android' ? 2 : 4 },
        shadowOpacity: Platform.OS === 'android' ? 0 : 0.1,
        shadowRadius: Platform.OS === 'android' ? 0 : 8,
        elevation: Platform.OS === 'android' ? 2 : 4,
        borderWidth: 1,
        borderColor: isDarkMode ? `${colors.primary}20` : 'rgba(99, 102, 241, 0.1)',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Аватар */}
        <View style={{
          width: isVerySmallScreen ? 50 : 60,
          height: isVerySmallScreen ? 50 : 60,
          borderRadius: isVerySmallScreen ? 25 : 30,
          marginRight: spacing.md,
          overflow: 'hidden',
          borderWidth: 2,
          borderColor: `${colors.primary}30`,
        }}>
          {student.avatar ? (
            <Image
              source={{ uri: student.avatar }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
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
                fontSize: isVerySmallScreen ? 18 : 22,
                fontWeight: '500',
                color: 'white',
              }}>
                {student.first_name[0] || student.username[0] || '?'}
              </ThemedText>
            </LinearGradient>
          )}
        </View>

        {/* Информация о студенте */}
        <View style={{ flex: 1 }}>
          <ThemedText style={{
            fontSize: fontSize.body,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
          }}>
            {student.first_name} {student.last_name}
          </ThemedText>
          
          <ThemedText style={{
            fontSize: fontSize.small,
            color: colors.textSecondary,
            marginBottom: 2,
          }}>
            @{student.username}
          </ThemedText>
          
          {student.student?.group && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <LinearGradient
                colors={[`${colors.primary}20`, `${colors.primary}10`]}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <ThemedText style={{
                  fontSize: fontSize.small - 2,
                  color: colors.primary,
                  fontWeight: '500',
                }}>
                  {student.student.group.name}
                </ThemedText>
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Кнопка действий */}
        <TouchableOpacity
          onPress={handlePress}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: `${colors.primary}15`,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: `${colors.primary}30`,
          }}
        >
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  // Оптимизация: обновляем только если изменились данные студента
  return prevProps.student.id === nextProps.student.id &&
         prevProps.student.avatar === nextProps.student.avatar &&
         prevProps.student.first_name === nextProps.student.first_name &&
         prevProps.student.last_name === nextProps.student.last_name;
});

StudentCard.displayName = 'StudentCard';

export default StudentCard;
