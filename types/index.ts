export type UserRole = 'student' | 'professor' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Связанные объекты
  student?: {
    group?: {
      name: string;
      course?: number;
    };
    course?: number;
    average_grade?: number;
  };
  professor?: {
    department?: string;
    title?: string;
  };
  admin?: {
    permissions?: string[];
  };
}

export interface Student extends User {
  role: 'student';
  studentId: string;
  faculty: string;
  course: number;
  group: Group;
  gpa: number;
}

export interface Professor extends User {
  role: 'professor';
  employeeId: string;
  department: string;
  title: string;
  subjects: string[];
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

export interface Group {
  id: string;
  name: string;
  faculty: string;
  course: number;
  students: string[]; // student IDs
  schedule: Schedule[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Schedule {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  building: string;
  time: string;
  day: string;
  type: 'lecture' | 'practice' | 'lab' | 'seminar';
  color: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: 'university' | 'club' | 'conference' | 'social' | 'sport';
  image?: string;
  isRegistered: boolean;
  maxParticipants?: number;
  currentParticipants: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  type: 'homework' | 'project' | 'exam' | 'presentation';
}

export interface Grade {
  id: string;
  subject: string;
  grade: number;
  maxGrade: number;
  date: string;
  type: 'exam' | 'test' | 'homework' | 'project';
  teacher: string;
}

export interface NewsEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
}

export interface News {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  author: string;
  date: string;
  category: 'announcement' | 'news' | 'academic' | 'events';
  icon: 'school-outline' | 'trophy-outline' | 'people-outline' | 'megaphone-outline' | 'calendar-outline';
  image?: string;
  events?: NewsEvent[];
  isImportant: boolean;
}

export interface CampusLocation {
  id: string;
  name: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  category: 'building' | 'library' | 'cafeteria' | 'parking' | 'dorm' | 'sport';
  floor?: number;
  openHours?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: string;
  category: 'academic' | 'social' | 'sport' | 'volunteer';
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: 'student' | 'professor' | 'admin';
  is_active: boolean;
  created_at: string;
  last_login?: string;
  faculty?: string;
  course?: number;
  group?: string;
  department?: string;
}
