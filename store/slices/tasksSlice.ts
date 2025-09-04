import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mockTasks } from '../../data/mockData';
import { Task } from '../../types';

interface TasksState {
  items: Task[];
  filter: 'all' | 'pending' | 'completed';
  isLoading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  items: mockTasks,
  filter: 'all',
  isLoading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.items = action.payload;
    },
    setFilter: (state, action: PayloadAction<'all' | 'pending' | 'completed'>) => {
      state.filter = action.payload;
    },
    toggleTaskCompletion: (state, action: PayloadAction<string>) => {
      const task = state.items.find(item => item.id === action.payload);
      if (task) {
        task.completed = !task.completed;
      }
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.items.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<{ id: string; updates: Partial<Task> }>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload.updates };
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
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
  setTasks,
  setFilter,
  toggleTaskCompletion,
  addTask,
  updateTask,
  removeTask,
  setLoading,
  setError
} = tasksSlice.actions;
export default tasksSlice.reducer;
