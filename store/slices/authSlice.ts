import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../services/api';
import { AuthState, LoginCredentials, User } from '../../types';

export const loginUser = createAsyncThunk<
  { user: User; token: string },
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);

      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Login failed');
      }
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const logoutUser = createAsyncThunk<void, void>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();

      await AsyncStorage.removeItem('splashShownInSession');
    } catch (error) {

      try {
        await AsyncStorage.removeItem('splashShownInSession');
      } catch (storageError) {

      }
    }
  }
);

export const checkAuthStatus = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        return response.data;
      } else {

        return rejectWithValue('Not authenticated');
      }
    } catch (error) {

      return rejectWithValue('Failed to check auth status');
    }
  }
);

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Ошибка авторизации LDAP';
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {

        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

const updateUserAvatar = (avatarUrl: string) => (dispatch: any, getState: any) => {
  const { auth } = getState();
  if (auth.user) {
    dispatch(setCredentials({
      user: { ...auth.user, avatar: avatarUrl },
      token: auth.token
    }));
  }
};

export const { clearError, setCredentials, clearCredentials } = authSlice.actions;
export { updateUserAvatar };
export default authSlice.reducer;
