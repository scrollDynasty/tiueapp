import * as Calendar from 'expo-calendar';
import { Alert, Platform } from 'react-native';

export interface EventDetails {
  title: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  notes?: string;
}

/**
 * Добавляет событие в календарь устройства
 * @param eventDetails - детали события
 * @returns Promise<boolean> - успешность операции
 */
export async function addEventToCalendar(eventDetails: EventDetails): Promise<boolean> {
  try {
    // Запрашиваем разрешения на доступ к календарю
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Нет доступа к календарю',
        'Для добавления события в календарь необходимо предоставить разрешение в настройках приложения.',
        [{ text: 'OK' }]
      );
      return false;
    }

    // Получаем календари устройства
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    
    // Ищем основной календарь или первый доступный
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

    // Подготавливаем данные события
    const calendarEvent = {
      title: eventDetails.title,
      startDate: eventDetails.startDate,
      endDate: eventDetails.endDate || new Date(eventDetails.startDate.getTime() + 60 * 60 * 1000), // +1 час по умолчанию
      location: eventDetails.location || '',
      notes: eventDetails.notes || '',
      timeZone: Platform.OS === 'ios' ? 'UTC' : undefined,
    };

    // Создаем событие в календаре
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

/**
 * Парсит дату и время из строк в объект Date
 * @param dateString - строка даты (например, "2025-09-30")
 * @param timeString - строка времени (например, "10:00")
 * @returns Date объект
 */
export function parseEventDateTime(dateString: string, timeString: string): Date {
  try {
    // Парсим дату
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // месяцы в JS начинаются с 0
    const day = parseInt(dateParts[2], 10);

    // Парсим время
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    return new Date(year, month, day, hours, minutes);
  } catch (error) {
    console.error('Ошибка при парсинге даты/времени:', error);
    return new Date(); // Возвращаем текущую дату как fallback
  }
}

/**
 * Форматирует дату для отображения в красивом виде
 * @param date - объект Date
 * @returns отформатированная строка даты
 */
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
