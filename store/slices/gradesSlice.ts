import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Grade } from '../../types';

interface GradesState {
  items: Grade[];
  selectedSubject: string | null;
  isLoading: boolean;
  error: string | null;
  gpa: number;
}

// Мемоизированный расчет GPA для избежания избыточных вычислений
const calculateGPA = (grades: Grade[]): number => {
  if (grades.length === 0) return 0;
  const total = grades.reduce((sum, grade) => sum + (grade.grade / grade.maxGrade) * 5, 0);
  return Math.round((total / grades.length) * 100) / 100;
};

// Кэш для GPA чтобы избежать пересчета при одинаковых данных
let gpaCache: { grades: Grade[], gpa: number } | null = null;

const getCachedGPA = (grades: Grade[]): number => {
  if (gpaCache && JSON.stringify(gpaCache.grades) === JSON.stringify(grades)) {
    return gpaCache.gpa;
  }
  const gpa = calculateGPA(grades);
  gpaCache = { grades: [...grades], gpa };
  return gpa;
};

const initialState: GradesState = {
  items: [],
  selectedSubject: null,
  isLoading: false,
  error: null,
  gpa: 0,
};

const gradesSlice = createSlice({
  name: 'grades',
  initialState,
  reducers: {
    setGrades: (state, action: PayloadAction<Grade[]>) => {
      state.items = action.payload;
      state.gpa = getCachedGPA(action.payload);
    },
    setSelectedSubject: (state, action: PayloadAction<string | null>) => {
      state.selectedSubject = action.payload;
    },
    addGrade: (state, action: PayloadAction<Grade>) => {
      state.items.push(action.payload);
      state.gpa = getCachedGPA(state.items);
    },
    updateGrade: (state, action: PayloadAction<{ id: string; updates: Partial<Grade> }>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload.updates };
        state.gpa = getCachedGPA(state.items);
      }
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
  setGrades,
  setSelectedSubject,
  addGrade,
  updateGrade,
  setLoading,
  setError
} = gradesSlice.actions;
export default gradesSlice.reducer;
