import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mockNews } from '../../data/mockData';
import { News } from '../../types';

interface NewsState {
  items: News[];
  filter: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: NewsState = {
  items: mockNews,
  filter: 'all',
  isLoading: false,
  error: null,
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setNews: (state, action: PayloadAction<News[]>) => {
      state.items = action.payload;
    },
    setFilter: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
    },
    addNews: (state, action: PayloadAction<News>) => {
      state.items.unshift(action.payload);
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
  setNews,
  setFilter,
  addNews,
  setLoading,
  setError
} = newsSlice.actions;
export default newsSlice.reducer;
