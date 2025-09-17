import { getMediaBaseUrl } from '@/config/environment';
import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ThemedText } from '../ThemedText';

const { width } = Dimensions.get('window');

interface EventItem {
  id: string | number;
  title: string;
  date: string;
  image: string | null;
  location?: string;
  time?: string;
}

interface EventsCardProps {
  events: EventItem[];
  onEventPress?: (eventId: string | number) => void;
  containerStyle?: object;
  horizontalPadding?: number;
}

export const EventsCard: React.FC<EventsCardProps> = ({ events, onEventPress, containerStyle, horizontalPadding = 16 }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const { fontSize, spacing, isExtraSmallScreen, isVerySmallScreen } = useResponsive();
  const [failedImages, setFailedImages] = React.useState<Set<string | number>>(new Set());

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) {
        return { day: '??', month: '???', year: '????' };
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return { day: '??', month: '???', year: '????' };
      }
      return {
        day: date.getDate().toString().padStart(2, '0'),
        month: date.toLocaleDateString('ru-RU', { month: 'short' }),
        year: date.getFullYear().toString(),
      };
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return { day: '??', month: '???', year: '????' };
    }
  };

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: horizontalPadding,
      marginBottom: spacing.xl,
      ...containerStyle,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    headerIcon: {
      width: isExtraSmallScreen ? 28 : isVerySmallScreen ? 30 : 32,
      height: isExtraSmallScreen ? 28 : isVerySmallScreen ? 30 : 32,
      borderRadius: isExtraSmallScreen ? 14 : isVerySmallScreen ? 15 : 16,
      backgroundColor: colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isExtraSmallScreen ? 8 : 12,
    },
    headerTitle: {
      fontSize: fontSize.title,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    viewAllButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: colors.primary + '15',
    },
    viewAllText: {
      fontSize: fontSize.small,
      fontWeight: '600',
      color: colors.primary,
    },
    eventsContainer: {
      gap: spacing.sm,
    },
    eventCard: {
      borderRadius: 16,
      backgroundColor: colors.surface,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.xs,
      height: isExtraSmallScreen ? 120 : isVerySmallScreen ? 140 : 160,
      position: 'relative',
    },
    eventImageBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
    },
    eventOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    eventContent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      padding: spacing.md,
    },
    eventTitleContainer: {
      flex: 1,
      marginRight: spacing.sm,
    },
    eventTitle: {
      fontSize: fontSize.body,
      fontWeight: '700',
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    eventSubInfo: {
      fontSize: fontSize.small,
      color: '#FFFFFF',
      marginTop: 2,
      opacity: 0.9,
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    dateNumber: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 8,
      minWidth: isExtraSmallScreen ? 40 : 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateNumberText: {
      fontSize: isExtraSmallScreen ? 16 : isVerySmallScreen ? 18 : 20,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    imagePlaceholder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.backgroundSecondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noImageCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      minHeight: isExtraSmallScreen ? 80 : 100,
    },
    noImageDateContainer: {
      width: isExtraSmallScreen ? 50 : 60,
      height: isExtraSmallScreen ? 50 : 60,
      backgroundColor: colors.primary,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    noImageContent: {
      flex: 1,
    },
    noImageTitle: {
      fontSize: fontSize.body,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    noImageLocation: {
      fontSize: fontSize.small,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    noImageTime: {
      fontSize: fontSize.small,
      color: colors.primary,
      fontWeight: '500',
    },
    emptyState: {
      padding: spacing.xl,
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyIcon: {
      width: isExtraSmallScreen ? 50 : 60,
      height: isExtraSmallScreen ? 50 : 60,
      borderRadius: isExtraSmallScreen ? 25 : 30,
      backgroundColor: colors.backgroundSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    emptyTitle: {
      fontSize: fontSize.body,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    emptySubtitle: {
      fontSize: fontSize.small,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  if (!events || !Array.isArray(events) || events.length === 0) {
    return (
      <Animated.View entering={FadeInDown.delay(400)} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="calendar" size={isExtraSmallScreen ? 14 : 16} color={colors.primary} />
          </View>
          <ThemedText style={styles.headerTitle}>События</ThemedText>
        </View>
        
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="calendar-outline" size={isExtraSmallScreen ? 22 : 28} color={colors.textSecondary} />
          </View>
          <ThemedText style={styles.emptyTitle}>Событий пока нет</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Скоро здесь появятся предстоящие события университета
          </ThemedText>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.delay(400)} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="calendar" size={isExtraSmallScreen ? 14 : 16} color={colors.primary} />
        </View>
        <ThemedText style={styles.headerTitle}>События</ThemedText>
        <TouchableOpacity style={styles.viewAllButton}>
          <ThemedText style={styles.viewAllText}>Все</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.eventsContainer}>
        {events.slice(0, 3).filter(item => item && item.id && item.title && item.date).map((item, index) => {
          const dateInfo = formatDate(item.date);
          
          return (
            <Animated.View 
              key={item.id} 
              entering={FadeInDown.delay(500 + index * 100)}
            >
              <TouchableOpacity
                style={styles.eventCard}
                onPress={() => onEventPress?.(item.id)}
                activeOpacity={0.8}
              >
                {/* Карточка с изображением */}
                {item.image && !failedImages.has(item.id) ? (
                  <>
                    {/* Фоновое изображение */}
                    <Image
                      source={{
                        uri: item.image.startsWith('http')
                          ? item.image
                          : `${getMediaBaseUrl()}${item.image.startsWith('/') ? item.image : '/' + item.image}`
                      }}
                      style={styles.eventImageBackground}
                      contentFit="cover"
                      transition={200}
                      onError={() => {
                        console.warn('Failed to load event image:', item.image);
                        setFailedImages(prev => new Set([...prev, item.id]));
                      }}
                    />
                    
                    {/* Темный оверлей для лучшей читаемости текста */}
                    <View style={styles.eventOverlay} />
                    
                    {/* Контент поверх изображения */}
                    <View style={styles.eventContent}>
                      {/* Название события слева внизу */}
                      <View style={styles.eventTitleContainer}>
                        <ThemedText style={styles.eventTitle} numberOfLines={2}>
                          {item.title}
                        </ThemedText>
                        {(item.location || item.time) && (
                          <ThemedText style={styles.eventSubInfo} numberOfLines={1}>
                            {item.location && `${item.location}`}
                            {item.location && item.time && ' • '}
                            {item.time && `🕐 ${item.time}`}
                          </ThemedText>
                        )}
                      </View>
                      
                      {/* Дата справа */}
                      <View style={styles.dateNumber}>
                        <ThemedText style={styles.dateNumberText}>
                          {dateInfo.day}
                        </ThemedText>
                      </View>
                    </View>
                  </>
                ) : (
                  /* Карточка без изображения - обычный дизайн */
                  <View style={styles.noImageCard}>
                    <View style={styles.noImageDateContainer}>
                      <ThemedText style={styles.dateNumberText}>
                        {dateInfo.day}
                      </ThemedText>
                    </View>
                    
                    <View style={styles.noImageContent}>
                      <ThemedText style={styles.noImageTitle} numberOfLines={2}>
                        {item.title}
                      </ThemedText>
                      {item.location && (
                        <ThemedText style={styles.noImageLocation} numberOfLines={1}>
                          {item.location}
                        </ThemedText>
                      )}
                      {item.time && (
                        <ThemedText style={styles.noImageTime}>
                          🕐 {item.time}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
};
