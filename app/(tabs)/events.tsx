import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useColorScheme } from '@/hooks/useColorScheme';
import { toggleEventRegistration } from '@/store/slices/eventsSlice';
import { Event } from '@/types';
import { selectEventsItems } from '@/types/redux';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES = [
  { key: 'all', label: 'Все', icon: 'grid-outline' },
  { key: 'university', label: 'Университет', icon: 'school-outline' },
  { key: 'club', label: 'Клубы', icon: 'people-outline' },
  { key: 'conference', label: 'Конференции', icon: 'megaphone-outline' },
  { key: 'social', label: 'Социальные', icon: 'heart-outline' },
  { key: 'sport', label: 'Спорт', icon: 'fitness-outline' },
];

export default function EventsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const dispatch = useAppDispatch();
  
  const events = useAppSelector(selectEventsItems);
  const [filter, setFilter] = useState('all');
  
  const filteredEvents = events.filter((event: Event) => {
    if (filter === 'all') return true;
    return event.category === filter;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'university': return colors.primary;
      case 'club': return colors.secondary;
      case 'conference': return colors.accent;
      case 'social': return colors.error;
      case 'sport': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'university': return 'Университет';
      case 'club': return 'Клубы';
      case 'conference': return 'Конференция';
      case 'social': return 'Социальное';
      case 'sport': return 'Спорт';
      default: return 'Событие';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>События</ThemedText>
        <TouchableOpacity style={[styles.searchButton, { backgroundColor: colors.surfaceSecondary }]}>
          <Ionicons name="search" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryButton,
              {
                backgroundColor: filter === category.key ? colors.primary : colors.surfaceSecondary,
              }
            ]}
            onPress={() => setFilter(category.key)}
          >
            <Ionicons 
              name={category.icon as keyof typeof Ionicons.glyphMap} 
              size={16} 
              color={filter === category.key ? '#fff' : colors.text} 
            />
            <ThemedText
              style={[
                styles.categoryText,
                {
                  color: filter === category.key ? '#fff' : colors.text,
                  fontWeight: filter === category.key ? '600' : '400',
                }
              ]}
            >
              {category.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Events List */}
      <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
        <View style={styles.eventsContainer}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event: Event) => (
              <Card key={event.id} style={styles.eventCard}>
                <View style={styles.eventItem}>
                  {/* Event Image */}
                  {event.image && (
                    <Image 
                      source={{ uri: event.image }}
                      style={styles.eventImage}
                      resizeMode="cover"
                    />
                  )}
                  
                  <View style={styles.eventContent}>
                    {/* Event Header */}
                    <View style={styles.eventHeader}>
                      <View style={styles.eventInfo}>
                        <ThemedText style={[styles.eventTitle, { color: colors.text }]}>
                          {event.title}
                        </ThemedText>
                        <View style={styles.eventMeta}>
                          <View style={[
                            styles.categoryBadge,
                            { backgroundColor: `${getCategoryColor(event.category)}20` }
                          ]}>
                            <ThemedText style={[
                              styles.categoryBadgeText,
                              { color: getCategoryColor(event.category) }
                            ]}>
                              {getCategoryLabel(event.category)}
                            </ThemedText>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.eventDate}>
                        <ThemedText style={[styles.dateText, { color: colors.primary }]}>
                          {formatDate(event.date)}
                        </ThemedText>
                        <ThemedText style={[styles.timeText, { color: colors.textSecondary }]}>
                          {formatTime(event.time)}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Event Description */}
                    <ThemedText style={[styles.eventDescription, { color: colors.textSecondary }]}>
                      {event.description}
                    </ThemedText>

                    {/* Event Details */}
                    <View style={styles.eventDetails}>
                      <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                        <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                          {event.location}
                        </ThemedText>
                      </View>
                      
                      {event.maxParticipants && (
                        <View style={styles.detailRow}>
                          <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
                          <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                            {event.currentParticipants} / {event.maxParticipants} участников
                          </ThemedText>
                        </View>
                      )}
                    </View>

                    {/* Registration Button */}
                    <TouchableOpacity
                      style={[
                        styles.registerButton,
                        {
                          backgroundColor: event.isRegistered 
                            ? colors.backgroundSecondary 
                            : colors.primary,
                          borderColor: event.isRegistered ? colors.primary : colors.primary,
                          borderWidth: event.isRegistered ? 1 : 0,
                        }
                      ]}
                      onPress={() => dispatch(toggleEventRegistration(event.id))}
                    >
                      <Ionicons 
                        name={event.isRegistered ? "checkmark-circle-outline" : "add-circle-outline"} 
                        size={20} 
                        color={event.isRegistered ? colors.primary : '#fff'} 
                      />
                      <ThemedText
                        style={[
                          styles.registerButtonText,
                          { color: event.isRegistered ? colors.primary : '#fff' }
                        ]}
                      >
                        {event.isRegistered ? 'Записан' : 'Записаться'}
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
                <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
                  Событий нет
                </ThemedText>
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                  В выбранной категории пока нет событий
                </ThemedText>
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoryContent: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    marginLeft: 6,
  },
  eventsList: {
    flex: 1,
  },
  eventsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  eventCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  eventItem: {
    flex: 1,
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  eventContent: {
    padding: 16,
    gap: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventInfo: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  eventDate: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 14,
    marginTop: 2,
  },
  eventDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  eventDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyCard: {
    padding: 32,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
