export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  studentId: string;
  faculty: string;
  course: number;
  group: string;
  gpa: number;
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

export interface News {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: 'announcement' | 'news' | 'academic' | 'events';
  image?: string;
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
