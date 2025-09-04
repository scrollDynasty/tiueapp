import { Achievement, CampusLocation, Event, Grade, News, Schedule, Student, Task } from '../types';

export const mockStudent: Student = {
  id: '1',
  name: 'Анна Иванова',
  email: 'anna.ivanova@student.university.ru',
  avatar: 'https://ui-avatars.com/api/?name=Anna+Ivanova&background=6366f1&color=fff',
  studentId: 'ST2021001',
  faculty: 'Факультет информационных технологий',
  course: 3,
  group: 'ИТ-301',
  gpa: 4.2
};

export const mockSchedule: Schedule[] = [
  {
    id: '1',
    subject: 'Алгоритмы и структуры данных',
    teacher: 'Петров А.В.',
    room: '305',
    building: 'Корпус А',
    time: '09:00-10:30',
    day: 'Понедельник',
    type: 'lecture',
    color: '#6366f1'
  },
  {
    id: '2',
    subject: 'Базы данных',
    teacher: 'Сидорова М.И.',
    room: '412',
    building: 'Корпус Б',
    time: '10:45-12:15',
    day: 'Понедельник',
    type: 'practice',
    color: '#8b5cf6'
  },
  {
    id: '3',
    subject: 'Веб-разработка',
    teacher: 'Козлов Д.С.',
    room: '201',
    building: 'Корпус А',
    time: '13:30-15:00',
    day: 'Понедельник',
    type: 'lab',
    color: '#06b6d4'
  },
  {
    id: '4',
    subject: 'Математический анализ',
    teacher: 'Новикова Е.П.',
    room: '108',
    building: 'Корпус В',
    time: '09:00-10:30',
    day: 'Вторник',
    type: 'lecture',
    color: '#10b981'
  },
  {
    id: '5',
    subject: 'Операционные системы',
    teacher: 'Волков И.А.',
    room: '315',
    building: 'Корпус А',
    time: '10:45-12:15',
    day: 'Вторник',
    type: 'seminar',
    color: '#f59e0b'
  }
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Хакатон "IT Future 2025"',
    description: 'Трёхдневный хакатон для студентов IT-направлений. Призовой фонд 500,000 рублей.',
    date: '2025-09-15',
    time: '10:00',
    location: 'Корпус А, конференц-зал',
    category: 'conference',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a814c963?w=300',
    isRegistered: true,
    maxParticipants: 200,
    currentParticipants: 156
  },
  {
    id: '2',
    title: 'Концерт студенческой группы',
    description: 'Выступление рок-группы "Code Breakers" в актовом зале университета.',
    date: '2025-09-10',
    time: '19:00',
    location: 'Актовый зал',
    category: 'social',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
    isRegistered: false,
    maxParticipants: 300,
    currentParticipants: 89
  },
  {
    id: '3',
    title: 'Турнир по футболу',
    description: 'Межфакультетский турнир по футболу. Регистрация команд до 8 сентября.',
    date: '2025-09-12',
    time: '14:00',
    location: 'Спортивный комплекс',
    category: 'sport',
    image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=300',
    isRegistered: true,
    maxParticipants: 16,
    currentParticipants: 12
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Курсовая работа по алгоритмам',
    description: 'Реализация алгоритма сортировки слиянием с анализом сложности',
    subject: 'Алгоритмы и структуры данных',
    dueDate: '2025-09-20',
    priority: 'high',
    completed: false,
    type: 'project'
  },
  {
    id: '2',
    title: 'Лабораторная работа №3',
    description: 'Создание REST API с использованием Node.js и Express',
    subject: 'Веб-разработка',
    dueDate: '2025-09-08',
    priority: 'medium',
    completed: true,
    type: 'homework'
  },
  {
    id: '3',
    title: 'Подготовка к экзамену',
    description: 'Повторить темы: производные, интегралы, дифференциальные уравнения',
    subject: 'Математический анализ',
    dueDate: '2025-09-25',
    priority: 'high',
    completed: false,
    type: 'exam'
  }
];

export const mockGrades: Grade[] = [
  {
    id: '1',
    subject: 'Алгоритмы и структуры данных',
    grade: 5,
    maxGrade: 5,
    date: '2025-08-30',
    type: 'test',
    teacher: 'Петров А.В.'
  },
  {
    id: '2',
    subject: 'Базы данных',
    grade: 4,
    maxGrade: 5,
    date: '2025-08-28',
    type: 'homework',
    teacher: 'Сидорова М.И.'
  },
  {
    id: '3',
    subject: 'Веб-разработка',
    grade: 5,
    maxGrade: 5,
    date: '2025-09-01',
    type: 'project',
    teacher: 'Козлов Д.С.'
  },
  {
    id: '4',
    subject: 'Математический анализ',
    grade: 4,
    maxGrade: 5,
    date: '2025-08-25',
    type: 'exam',
    teacher: 'Новикова Е.П.'
  }
];

export const mockNews: News[] = [
  {
    id: '1',
    title: 'Новая библиотека открыта для студентов',
    content: 'С 1 сентября начала работу новая современная библиотека в корпусе Г. Доступно более 50,000 книг и 100 мест для занятий.',
    author: 'Администрация университета',
    date: '2025-09-01',
    category: 'announcement',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    isImportant: true
  },
  {
    id: '2',
    title: 'Стипендиальная программа для отличников',
    content: 'Объявлен конкурс на получение повышенной стипендии для студентов с высокой успеваемостью.',
    author: 'Деканат',
    date: '2025-08-30',
    category: 'academic',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300',
    isImportant: false
  }
];

export const mockCampusLocations: CampusLocation[] = [
  {
    id: '1',
    name: 'Корпус А',
    description: 'Главный учебный корпус',
    coordinates: { latitude: 55.7558, longitude: 37.6176 },
    category: 'building',
    openHours: '08:00-20:00'
  },
  {
    id: '2',
    name: 'Библиотека',
    description: 'Центральная библиотека университета',
    coordinates: { latitude: 55.7560, longitude: 37.6180 },
    category: 'library',
    openHours: '09:00-21:00'
  },
  {
    id: '3',
    name: 'Столовая "Вкусно"',
    description: 'Главная столовая кампуса',
    coordinates: { latitude: 55.7555, longitude: 37.6170 },
    category: 'cafeteria',
    openHours: '08:00-18:00'
  }
];

export const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Отличник семестра',
    description: 'Все оценки за семестр - отлично',
    icon: 'star',
    earnedDate: '2025-06-30',
    category: 'academic'
  },
  {
    id: '2',
    title: 'Участник хакатона',
    description: 'Принял участие в университетском хакатоне',
    icon: 'code',
    earnedDate: '2025-03-15',
    category: 'academic'
  }
];
