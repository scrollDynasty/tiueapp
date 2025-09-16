import { getThemeColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card } from 'react-native-paper';
import { ThemedText } from '../ThemedText';

interface EventItem {
  id: number;
  title: string;
  date: string;
  image: string | null;
}

interface EventsCardProps {
  events: EventItem[];
  onEventPress?: (eventId: number) => void;
}

export const EventsCard: React.FC<EventsCardProps> = ({ events, onEventPress }) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  const styles = StyleSheet.create({
    card: {
      margin: 8,
      backgroundColor: isDarkMode ? '#1E3A8A' : '#FFFFFF',
      borderRadius: 12,
      elevation: 3,
    },
    cardContent: {
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#FFFFFF' : '#1E3A8A',
      marginBottom: 12,
    },
    eventItem: {
      marginBottom: 16,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    eventImageContainer: {
      position: 'relative',
      width: '100%',
      height: 180,
    },
    eventImage: {
      width: '100%',
      height: '100%',
      backgroundColor: isDarkMode ? '#334155' : '#E2E8F0',
    },
    eventImagePlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: isDarkMode ? '#3B82F6' : '#E2E8F0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    eventOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      padding: 12,
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
      flex: 1,
      marginRight: 8,
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    eventDate: {
      fontSize: 14,
      color: '#FFFFFF',
      fontWeight: '600',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <ThemedText style={styles.title}>События</ThemedText>
        {events.map((event) => (
          <TouchableOpacity 
            key={event.id} 
            style={styles.eventItem}
            onPress={() => onEventPress?.(event.id)}
          >
            <View style={styles.eventImageContainer}>
              {event.image ? (
                <Image 
                  source={{ uri: event.image }} 
                  style={styles.eventImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.eventImagePlaceholder}>
                  <Ionicons 
                    name="calendar-outline" 
                    size={40} 
                    color={isDarkMode ? '#FFFFFF' : '#64748B'} 
                  />
                </View>
              )}
              <View style={styles.eventOverlay}>
                <ThemedText style={styles.eventTitle} numberOfLines={2}>
                  {event.title}
                </ThemedText>
                <ThemedText style={styles.eventDate}>
                  {formatDate(event.date)}
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        ))
      }
    </Card.Content>
    </Card>
  );
};
