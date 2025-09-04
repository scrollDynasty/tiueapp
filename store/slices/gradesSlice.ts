import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mockGrades } from '../../data/mockData';
import { Grade } from '../../types';

interface GradesState {
  items: Grade[];
  selectedSubject: string | null;
  isLoading: boolean;
  error: string | null;
  gpa: number;
}

const calculateGPA = (grades: Grade[]): number => {
  if (grades.length === 0) return 0;
  const total = grades.reduce((sum, grade) => sum + (grade.grade / grade.maxGrade) * 5, 0);
  return Math.round((total / grades.length) * 100) / 100;
};

const initialState: GradesState = {
  items: mockGrades,
  selectedSubject: null,
  isLoading: false,
  error: null,
  gpa: calculateGPA(mockGrades),
};

const gradesSlice = createSlice({
  name: 'grades',
  initialState,
  reducers: {
    setGrades: (state, action: PayloadAction<Grade[]>) => {
      state.items = action.payload;
      state.gpa = calculateGPA(action.payload);
    },
    setSelectedSubject: (state, action: PayloadAction<string | null>) => {
      state.selectedSubject = action.payload;
    },
    addGrade: (state, action: PayloadAction<Grade>) => {
      state.items.push(action.payload);
      state.gpa = calculateGPA(state.items);
    },
    updateGrade: (state, action: PayloadAction<{ id: string; updates: Partial<Grade> }>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload.updates };
        state.gpa = calculateGPA(state.items);
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
