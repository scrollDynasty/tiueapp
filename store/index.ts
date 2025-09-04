import eventsReducer from '@/store/slices/eventsSlice';
import gradesReducer from '@/store/slices/gradesSlice';
import newsReducer from '@/store/slices/newsSlice';
import scheduleReducer from '@/store/slices/scheduleSlice';
import settingsReducer from '@/store/slices/settingsSlice';
import studentReducer from '@/store/slices/studentSlice';
import tasksReducer from '@/store/slices/tasksSlice';
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    student: studentReducer,
    schedule: scheduleReducer,
    events: eventsReducer,
    tasks: tasksReducer,
    grades: gradesReducer,
    news: newsReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
