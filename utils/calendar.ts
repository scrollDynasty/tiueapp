import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';

export interface EventDetails {
  title: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  notes?: string;
}

export async function addEventToCalendar(eventDetails: EventDetails): Promise<boolean> {
  try {

    const { status } = await Calendar.requestCalendarPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Нет доступа к календарю',
        'Для добавления события в календарь необходимо предоставить разрешение в настройках приложения.',
        [{ text: 'OK' }]
      );
      return false;
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

    const defaultCalendar = calendars.find(
      cal => cal.source.name === 'Default' || cal.isPrimary
    ) || calendars[0];

    if (!defaultCalendar) {
      Alert.alert(
        'Календарь недоступен',
        'На устройстве не найден календарь для добавления события.',
        [{ text: 'OK' }]
      );
      return false;
    }

    const calendarEvent = {
      title: eventDetails.title,
      startDate: eventDetails.startDate,
      endDate: eventDetails.endDate || new Date(eventDetails.startDate.getTime() + 60 * 60 * 1000),
      location: eventDetails.location || '',
      notes: eventDetails.notes || '',
      timeZone: Platform.OS === 'ios' ? 'UTC' : undefined,
    };

    const eventId = await Calendar.createEventAsync(defaultCalendar.id, calendarEvent);

    if (eventId) {
      Alert.alert(
        'Успешно добавлено',
        'Событие добавлено в ваш календарь.',
        [{ text: 'OK' }]
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error('Ошибка при добавлении события в календарь:', error);
    Alert.alert(
      'Ошибка',
      'Не удалось добавить событие в календарь. Попробуйте позже.',
      [{ text: 'OK' }]
    );
    return false;
  }
}

export function parseEventDateTime(dateString: string, timeString: string): Date {
  try {

    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);

    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    return new Date(year, month, day, hours, minutes);
  } catch (error) {
    console.error('Ошибка при парсинге даты/времени:', error);
    return new Date();
  }
}

export function formatEventDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
