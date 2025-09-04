import { store } from '@/store';
import { Event, Grade, News, Schedule, Student, Task } from './index';

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Селекторы с типизацией
export const selectStudent = (state: RootState) => state.student as { profile: Student | null; isLoading: boolean; error: string | null };
export const selectSchedule = (state: RootState) => state.schedule as { items: Schedule[]; selectedDay: string; isLoading: boolean; error: string | null };
export const selectScheduleItems = (state: RootState) => (state.schedule as { items: Schedule[]; selectedDay: string; isLoading: boolean; error: string | null }).items;
export const selectSelectedDay = (state: RootState) => (state.schedule as { items: Schedule[]; selectedDay: string; isLoading: boolean; error: string | null }).selectedDay;
export const selectTasks = (state: RootState) => state.tasks as { items: Task[]; filter: 'all' | 'pending' | 'completed'; isLoading: boolean; error: string | null };
export const selectTasksItems = (state: RootState) => (state.tasks as { items: Task[]; filter: 'all' | 'pending' | 'completed'; isLoading: boolean; error: string | null }).items;
export const selectTasksFilter = (state: RootState) => (state.tasks as { items: Task[]; filter: 'all' | 'pending' | 'completed'; isLoading: boolean; error: string | null }).filter;
export const selectEvents = (state: RootState) => state.events as { items: Event[]; filter: string; isLoading: boolean; error: string | null };
export const selectEventsItems = (state: RootState) => (state.events as { items: Event[]; filter: string; isLoading: boolean; error: string | null }).items;
export const selectGrades = (state: RootState) => state.grades as { items: Grade[]; selectedSubject: string | null; isLoading: boolean; error: string | null; gpa: number };
export const selectGradesItems = (state: RootState) => (state.grades as { items: Grade[]; selectedSubject: string | null; isLoading: boolean; error: string | null; gpa: number }).items;
export const selectNews = (state: RootState) => state.news as { items: News[]; filter: string; isLoading: boolean; error: string | null };
export const selectNewsItems = (state: RootState) => (state.news as { items: News[]; filter: string; isLoading: boolean; error: string | null }).items;
export const selectSettings = (state: RootState) => state.settings;
