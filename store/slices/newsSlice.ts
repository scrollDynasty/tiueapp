import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../services/api';
import { News } from '../../types';
import { cache, cacheKeys, cacheTTL } from '../../utils/cache';

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

export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async (_, { rejectWithValue }) => {
    try {

      const cachedNews = await cache.get<News[]>(cacheKeys.news);

      if (cachedNews) {

        authApi.getNews().then(response => {
          if (response.success && response.data) {
            cache.set(cacheKeys.news, response.data, cacheTTL.short);
          }
        }).catch(() => {});

        return cachedNews;
      }

      const response = await authApi.getNews();
      if (response.success && response.data) {

        await cache.set(cacheKeys.news, response.data, cacheTTL.short);
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
    image?: any;
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

      .addCase(fetchNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.isLoading = false;

        const payload = action.payload as any;
        const newsArray = payload?.results || payload;
        state.items = Array.isArray(newsArray) ? newsArray : [];
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(createNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNews.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!Array.isArray(state.items)) {
          state.items = [];
        }
        state.items.unshift(action.payload);
      })
      .addCase(createNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

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
