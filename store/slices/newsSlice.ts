import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../services/api';
import { News } from '../../types';

interface NewsState {
  items: News[];
  filter: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: NewsState = {
  items: [],
  filter: 'all',
  isLoading: false,
  error: null,
};

// Async thunks для работы с API
export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getNews();
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to fetch news');
      }
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const createNews = createAsyncThunk(
  'news/createNews',
  async (newsData: { 
    title: string; 
    subtitle: string; 
    content: string; 
    category: string; 
    icon: string; 
    is_important: boolean;
    image?: any; // Может быть строкой (URI) или объектом ImagePickerAsset
  }, { rejectWithValue }) => {
    try {
      const response = await authApi.createNews(newsData);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to create news');
      }
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const deleteNews = createAsyncThunk(
  'news/deleteNews',
  async (newsId: string, { rejectWithValue }) => {
    try {
      const response = await authApi.deleteNews(newsId);
      if (response.success) {
        return newsId;
      } else {
        return rejectWithValue(response.error || 'Failed to delete news');
      }
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
    },
    // Оставляем локальный addNews для offline режима
    addNews: (state, action: PayloadAction<News>) => {
      if (!Array.isArray(state.items)) {
        state.items = [];
      }
      state.items.unshift(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch news
      .addCase(fetchNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('fetchNews.fulfilled payload:', action.payload);
        // Django REST Framework возвращает данные в формате {results: [...]}
        const payload = action.payload as any;
        const newsArray = payload?.results || payload;
        state.items = Array.isArray(newsArray) ? newsArray : [];
        console.log('Updated state.items:', state.items);
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create news
      .addCase(createNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNews.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('createNews.fulfilled payload:', action.payload);
        if (!Array.isArray(state.items)) {
          state.items = [];
        }
        state.items.unshift(action.payload);
        console.log('Updated state.items after create:', state.items);
      })
      .addCase(createNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete news
      .addCase(deleteNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.isLoading = false;
        if (Array.isArray(state.items)) {
          state.items = state.items.filter(item => item.id !== action.payload);
        }
      })
      .addCase(deleteNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilter,
  addNews,
  clearError
} = newsSlice.actions;
export default newsSlice.reducer;
