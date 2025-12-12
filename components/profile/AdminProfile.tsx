import { ThemedText } from '@/components/ThemedText';
import { getThemeColors } from '@/constants/Colors';
import { Colors, Radius, Shadows, Spacing, Typography } from '@/constants/DesignTokens';
import { useTheme } from '@/contexts/ThemeContext';
import { useAppSelector } from '@/hooks/redux';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, View } from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';

interface AdminProfileProps {
  user: any;
  onLogout: () => void;
}

export const AdminProfile = React.memo(({ user, onLogout }: AdminProfileProps) => {

  const { items: newsItems } = useAppSelector((state) => state.news);
  const { items: eventsItems } = useAppSelector((state) => state.events);
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const { isSmallScreen, spacing, fontSize, isVerySmallScreen } = useResponsive();

  const displayInfo = React.useMemo(() => ({
    name: `${user.first_name} ${user.last_name}`.trim() || user.username,
    subtitle: 'Системный администратор',
  }), [user.first_name, user.last_name, user.username]);

  const handleNewsPress = React.useCallback(() => {
    router.push('../../admin/news' as any);
  }, []);

  const handleEventsPress = React.useCallback(() => {
    router.push('../../admin/events' as any);
  }, []);

  const handleUsersPress = React.useCallback(() => {
    router.push('../../admin/users' as any);
  }, []);

  const handleSchedulePress = React.useCallback(() => {
    Alert.alert('Расписание', 'Управление расписанием будет доступно в следующих версиях');
  }, []);

  const handleSettingsPress = React.useCallback(() => {
    Alert.alert('Настройки', 'Системные настройки будут доступны в следующих версиях');
  }, []);

  const handleLogsPress = React.useCallback(() => {
    Alert.alert('Логи', 'Просмотр логов будет доступен в следующих версиях');
  }, []);

  const handleLogoutPress = React.useCallback(() => {
    onLogout();
  }, [onLogout]);

  return (
    <View style={{ flex: 1 }}>
      {}
      <Animated.View entering={SlideInRight.duration(400)} style={{ marginTop: isVerySmallScreen ? -spacing.md : isSmallScreen ? -spacing.lg : -Spacing.l, marginHorizontal: isVerySmallScreen ? -spacing.md : isSmallScreen ? -spacing.lg : -Spacing.l, marginBottom: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : Spacing.l }}>
        <LinearGradient
          colors={[colors.primary, '#5B8DF7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : Spacing.l,
            paddingVertical: isVerySmallScreen ? spacing.lg : isSmallScreen ? spacing.xl : Spacing.xl,
            borderBottomLeftRadius: isVerySmallScreen ? 20 : isSmallScreen ? 22 : 24,
            borderBottomRightRadius: isVerySmallScreen ? 20 : isSmallScreen ? 22 : 24,
            ...Shadows.card,
          }}
        >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m }}>
          <View
            style={{
              width: isVerySmallScreen ? 48 : isSmallScreen ? 52 : 56,
              height: isVerySmallScreen ? 48 : isSmallScreen ? 52 : 56,
              borderRadius: isVerySmallScreen ? 24 : isSmallScreen ? 26 : 28,
              backgroundColor: 'rgba(255,255,255,0.15)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <Ionicons name="settings" size={isVerySmallScreen ? 24 : isSmallScreen ? 26 : 28} color="white" />
          </View>

          <View style={{ flex: 1 }}>
            <ThemedText
              style={{
                ...Typography.displayH1,
                color: 'white',
                marginBottom: 4,
                fontSize: isVerySmallScreen ? fontSize.body : isSmallScreen ? 20 : 22,
                lineHeight: isVerySmallScreen ? 20 : isSmallScreen ? 26 : 28,
              }}
            >
              {displayInfo.name}
            </ThemedText>
            <ThemedText
              style={{
                ...Typography.body,
                color: 'rgba(255,255,255,0.85)',
                fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? fontSize.body : Typography.body.fontSize,
              }}
            >
              {displayInfo.subtitle}
            </ThemedText>
          </View>

          <View style={{
            backgroundColor: isDarkMode ? `${colors.primary}25` : colors.surface,
            paddingHorizontal: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
            paddingVertical: isVerySmallScreen ? 4 : isSmallScreen ? spacing.xs : Spacing.xs,
            borderRadius: isVerySmallScreen ? 12 : isSmallScreen ? 14 : 16,
          }}>
            <ThemedText style={{
              ...Typography.caption,
              color: colors.primary,
              fontSize: isVerySmallScreen ? 9 : isSmallScreen ? 10 : 11,
            }}>
              ADMIN
            </ThemedText>
          </View>
        </View>

        {}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          paddingHorizontal: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
          paddingVertical: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
          borderRadius: isVerySmallScreen ? 12 : isSmallScreen ? 14 : 16,
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={{
              ...Typography.displayH1,
              color: 'white',
              fontSize: isVerySmallScreen ? fontSize.title : isSmallScreen ? 18 : 20,
            }}>
              {newsItems.length}
            </ThemedText>
            <ThemedText style={{
              ...Typography.caption,
              color: 'rgba(255,255,255,0.8)',
              fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? 11 : Typography.caption.fontSize,
            }}>
              Новостей
            </ThemedText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={{
              ...Typography.displayH1,
              color: 'white',
              fontSize: isVerySmallScreen ? fontSize.title : isSmallScreen ? 18 : 20,
            }}>
              {eventsItems.length}
            </ThemedText>
            <ThemedText style={{
              ...Typography.caption,
              color: 'rgba(255,255,255,0.8)',
              fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? 11 : Typography.caption.fontSize,
            }}>
              Событий
            </ThemedText>
          </View>
          <View style={{ alignItems: 'center' }}>
            <ThemedText style={{
              ...Typography.displayH1,
              color: 'white',
              fontSize: isVerySmallScreen ? fontSize.title : isSmallScreen ? 18 : 20,
            }}>
              1
            </ThemedText>
            <ThemedText style={{
              ...Typography.caption,
              color: 'rgba(255,255,255,0.8)',
              fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? 11 : Typography.caption.fontSize,
            }}>
              Админов
            </ThemedText>
          </View>
        </View>
        </LinearGradient>
      </Animated.View>

      {}
      <Animated.View entering={FadeInDown.duration(500).delay(200)}>
        <ThemedText style={{
          ...Typography.titleH2,
          color: colors.text,
          marginBottom: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
          fontSize: isVerySmallScreen ? fontSize.title : isSmallScreen ? 17 : 18,
        }}>
          Управление контентом
        </ThemedText>

        <View style={{
          gap: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.m,
          marginBottom: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : Spacing.l,
        }}>
          {}
          <Pressable
            onPress={handleNewsPress}
            style={{
              backgroundColor: colors.surface,
              borderRadius: Radius.card,
              padding: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.l,
              flexDirection: 'row',
              alignItems: 'center',
              ...Shadows.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{
              width: isVerySmallScreen ? 40 : isSmallScreen ? 44 : 48,
              height: isVerySmallScreen ? 40 : isSmallScreen ? 44 : 48,
              borderRadius: isVerySmallScreen ? 20 : isSmallScreen ? 22 : 24,
              backgroundColor: isDarkMode ? `${colors.primary}25` : `${colors.primary}15`,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
            }}>
              <Ionicons name="newspaper-outline" size={isVerySmallScreen ? 20 : isSmallScreen ? 22 : 24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{
                ...Typography.titleH2,
                color: colors.text,
                marginBottom: 4,
                fontSize: isVerySmallScreen ? fontSize.body : isSmallScreen ? fontSize.title : Typography.titleH2.fontSize,
              }}>
                Управление новостями
              </ThemedText>
              <ThemedText style={{
                ...Typography.body,
                color: colors.textSecondary,
                fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? fontSize.body : 14,
              }}>
                {newsItems.length} активных новостей
              </ThemedText>
            </View>
            <View style={{
              backgroundColor: colors.surfaceSecondary,
              paddingHorizontal: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
              paddingVertical: isVerySmallScreen ? 2 : isSmallScreen ? 4 : Spacing.xs,
              borderRadius: isVerySmallScreen ? 8 : isSmallScreen ? 10 : Radius.icon,
              marginRight: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
            }}>
              <ThemedText style={{
                ...Typography.caption,
                color: colors.textSecondary,
                fontSize: isVerySmallScreen ? 9 : isSmallScreen ? 10 : Typography.caption.fontSize,
              }}>
                {newsItems.length}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={isVerySmallScreen ? 16 : isSmallScreen ? 18 : 20} color={colors.textSecondary} />
          </Pressable>

          {}
          <Pressable
            onPress={handleEventsPress}
            style={{
              backgroundColor: colors.surface,
              borderRadius: Radius.card,
              padding: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.l,
              flexDirection: 'row',
              alignItems: 'center',
              ...Shadows.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{
              width: isVerySmallScreen ? 40 : isSmallScreen ? 44 : 48,
              height: isVerySmallScreen ? 40 : isSmallScreen ? 44 : 48,
              borderRadius: isVerySmallScreen ? 20 : isSmallScreen ? 22 : 24,
              backgroundColor: isDarkMode ? `${colors.warning}25` : `${colors.warning}15`,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
            }}>
              <Ionicons name="calendar-outline" size={isVerySmallScreen ? 20 : isSmallScreen ? 22 : 24} color={colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{
                ...Typography.titleH2,
                color: colors.text,
                marginBottom: 4,
                fontSize: isVerySmallScreen ? fontSize.body : isSmallScreen ? fontSize.title : Typography.titleH2.fontSize,
              }}>
                Управление событиями
              </ThemedText>
              <ThemedText style={{
                ...Typography.body,
                color: colors.textSecondary,
                fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? fontSize.body : 14,
              }}>
                {eventsItems.length} запланированных событий
              </ThemedText>
            </View>
            <View style={{
              backgroundColor: '#FEF3C7',
              paddingHorizontal: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
              paddingVertical: isVerySmallScreen ? 2 : isSmallScreen ? 4 : Spacing.xs,
              borderRadius: isVerySmallScreen ? 8 : isSmallScreen ? 10 : Radius.icon,
              marginRight: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
            }}>
              <ThemedText style={{
                ...Typography.caption,
                color: '#F59E0B',
                fontSize: isVerySmallScreen ? 9 : isSmallScreen ? 10 : Typography.caption.fontSize,
              }}>
                {eventsItems.length}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={isVerySmallScreen ? 16 : isSmallScreen ? 18 : 20} color={Colors.textSecondary} />
          </Pressable>

          {}
          <Pressable
            onPress={handleSchedulePress}
            style={{
              backgroundColor: colors.surface,
              borderRadius: Radius.card,
              padding: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.l,
              flexDirection: 'row',
              alignItems: 'center',
              ...Shadows.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{
              width: isVerySmallScreen ? 40 : isSmallScreen ? 44 : 48,
              height: isVerySmallScreen ? 40 : isSmallScreen ? 44 : 48,
              borderRadius: isVerySmallScreen ? 20 : isSmallScreen ? 22 : 24,
              backgroundColor: isDarkMode ? `${colors.success}25` : `${colors.success}15`,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
            }}>
              <Ionicons name="time-outline" size={isVerySmallScreen ? 20 : isSmallScreen ? 22 : 24} color={colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{
                ...Typography.titleH2,
                color: colors.text,
                marginBottom: 4,
                fontSize: isVerySmallScreen ? fontSize.body : isSmallScreen ? fontSize.title : Typography.titleH2.fontSize,
              }}>
                Управление расписанием
              </ThemedText>
              <ThemedText style={{
                ...Typography.body,
                color: colors.textSecondary,
                fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? fontSize.body : 14,
              }}>
                Составление и редактирование
              </ThemedText>
            </View>
            <View style={{
              backgroundColor: isDarkMode ? `${colors.success}25` : `${colors.success}15`,
              paddingHorizontal: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
              paddingVertical: isVerySmallScreen ? 2 : isSmallScreen ? 4 : Spacing.xs,
              borderRadius: isVerySmallScreen ? 8 : isSmallScreen ? 10 : Radius.icon,
              marginRight: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
            }}>
              <ThemedText style={{
                ...Typography.caption,
                color: '#10B981',
                fontSize: isVerySmallScreen ? 9 : isSmallScreen ? 10 : Typography.caption.fontSize,
              }}>
                ∞
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={isVerySmallScreen ? 16 : isSmallScreen ? 18 : 20} color={colors.textSecondary} />
          </Pressable>

          {}
          <Pressable
            onPress={handleUsersPress}
            style={{
              backgroundColor: colors.surface,
              borderRadius: Radius.card,
              padding: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.l,
              flexDirection: 'row',
              alignItems: 'center',
              ...Shadows.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{
              width: isVerySmallScreen ? 40 : isSmallScreen ? 44 : 48,
              height: isVerySmallScreen ? 40 : isSmallScreen ? 44 : 48,
              borderRadius: isVerySmallScreen ? 20 : isSmallScreen ? 22 : 24,
              backgroundColor: isDarkMode ? `${colors.error}25` : `${colors.error}15`,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
            }}>
              <Ionicons name="people-outline" size={isVerySmallScreen ? 20 : isSmallScreen ? 22 : 24} color={colors.error} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{
                ...Typography.titleH2,
                color: colors.text,
                marginBottom: 4,
                fontSize: isVerySmallScreen ? fontSize.body : isSmallScreen ? fontSize.title : Typography.titleH2.fontSize,
              }}>
                Управление пользователями
              </ThemedText>
              <ThemedText style={{
                ...Typography.body,
                color: colors.textSecondary,
                fontSize: isVerySmallScreen ? fontSize.small : isSmallScreen ? fontSize.body : 14,
              }}>
                Добавление и редактирование
              </ThemedText>
            </View>
            <View style={{
              backgroundColor: isDarkMode ? `${colors.error}25` : `${colors.error}15`,
              paddingHorizontal: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
              paddingVertical: isVerySmallScreen ? 2 : isSmallScreen ? 4 : Spacing.xs,
              borderRadius: isVerySmallScreen ? 8 : isSmallScreen ? 10 : Radius.icon,
              marginRight: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
            }}>
              <ThemedText style={{
                ...Typography.caption,
                color: colors.error,
                fontSize: isVerySmallScreen ? 9 : isSmallScreen ? 10 : Typography.caption.fontSize,
              }}>
                👤
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={isVerySmallScreen ? 16 : isSmallScreen ? 18 : 20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </Animated.View>

      {}
      <Animated.View entering={FadeInDown.duration(500).delay(300)}>
        <ThemedText style={{
          ...Typography.titleH2,
          color: colors.text,
          marginBottom: isVerySmallScreen ? spacing.sm : isSmallScreen ? spacing.md : Spacing.m,
          fontSize: isVerySmallScreen ? fontSize.title : isSmallScreen ? 17 : 18,
        }}>
          Системная информация
        </ThemedText>

        <View style={{
          gap: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s,
          marginBottom: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : Spacing.l
        }}>
          <Pressable
            style={{
              backgroundColor: colors.surface,
              borderRadius: Radius.card,
              padding: Spacing.m,
              flexDirection: 'row',
              alignItems: 'center',
              ...Shadows.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={handleSettingsPress}
          >
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: isDarkMode ? `${colors.primary}25` : `${colors.primary}15`,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: Spacing.m,
            }}>
              <Ionicons name="settings-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ ...Typography.body, color: colors.text }}>
                Системные настройки
              </ThemedText>
              <ThemedText style={{ ...Typography.caption, color: colors.textSecondary }}>
                Конфигурация приложения
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>

          <Pressable
            style={{
              backgroundColor: colors.surface,
              borderRadius: Radius.card,
              padding: Spacing.m,
              flexDirection: 'row',
              alignItems: 'center',
              ...Shadows.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={handleLogsPress}
          >
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: Spacing.m,
            }}>
              <Ionicons name="document-text-outline" size={18} color={isDarkMode ? '#666' : '#999'} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ ...Typography.body, color: colors.text }}>
                Логи системы
              </ThemedText>
              <ThemedText style={{ ...Typography.caption, color: colors.textSecondary }}>
                Просмотр и анализ
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>
      </Animated.View>

      {}
      <Animated.View entering={FadeInDown.duration(500).delay(400)} style={{
        marginTop: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : Spacing.l
      }}>
        <Pressable
          onPress={handleLogoutPress}
          style={({ pressed }) => ({
            backgroundColor: pressed ? '#DC2626' : '#EF4444',
            borderRadius: isVerySmallScreen ? 10 : isSmallScreen ? 11 : 12,
            padding: isVerySmallScreen ? spacing.md : isSmallScreen ? spacing.lg : Spacing.l,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: pressed ? '#B91C1C' : '#DC2626',
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Ionicons
            name="log-out-outline"
            size={isVerySmallScreen ? 18 : isSmallScreen ? 19 : 20}
            color="white"
            style={{ marginRight: isVerySmallScreen ? spacing.xs : isSmallScreen ? spacing.sm : Spacing.s }}
          />
          <ThemedText style={{
            fontSize: isVerySmallScreen ? fontSize.body : isSmallScreen ? 15 : 16,
            color: 'white',
          }}>
            Выйти из системы
          </ThemedText>
        </Pressable>
      </Animated.View>
    </View>
  );
});

AdminProfile.displayName = 'AdminProfile';
