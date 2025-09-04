import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Schedule } from '../../types';

interface ScheduleState {
  items: Schedule[];
  selectedDay: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: ScheduleState = {
  items: [],
  selectedDay: 'Понедельник',
  isLoading: false,
  error: null,
};

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    setSchedule: (state, action: PayloadAction<Schedule[]>) => {
      state.items = action.payload;
    },
    setSelectedDay: (state, action: PayloadAction<string>) => {
      state.selectedDay = action.payload;
    },
    addScheduleItem: (state, action: PayloadAction<Schedule>) => {
      state.items.push(action.payload);
    },
    updateScheduleItem: (state, action: PayloadAction<{ id: string; updates: Partial<Schedule> }>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload.updates };
      }
    },
    removeScheduleItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSchedule,
  setSelectedDay,
  addScheduleItem,
  updateScheduleItem,
  removeScheduleItem,
  setLoading,
  setError
} = scheduleSlice.actions;
export default scheduleSlice.reducer;
