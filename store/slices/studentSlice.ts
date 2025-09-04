import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Student } from '../../types';

interface StudentState {
  profile: Student | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: StudentState = {
  profile: null,
  isLoading: false,
  error: null,
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Student>) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<Student>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
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

export const { setProfile, updateProfile, setLoading, setError } = studentSlice.actions;
export default studentSlice.reducer;
