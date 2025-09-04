import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  theme: 'light' | 'dark' | 'auto';
  language: 'ru' | 'en';
  notifications: {
    schedule: boolean;
    events: boolean;
    tasks: boolean;
    grades: boolean;
    news: boolean;
  };
  privacy: {
    shareSchedule: boolean;
    shareGrades: boolean;
    shareProfile: boolean;
  };
}

const initialState: SettingsState = {
  theme: 'auto',
  language: 'ru',
  notifications: {
    schedule: true,
    events: true,
    tasks: true,
    grades: true,
    news: false,
  },
  privacy: {
    shareSchedule: false,
    shareGrades: false,
    shareProfile: true,
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'ru' | 'en'>) => {
      state.language = action.payload;
    },
    updateNotificationSetting: (state, action: PayloadAction<{ key: keyof SettingsState['notifications']; value: boolean }>) => {
      state.notifications[action.payload.key] = action.payload.value;
    },
    updatePrivacySetting: (state, action: PayloadAction<{ key: keyof SettingsState['privacy']; value: boolean }>) => {
      state.privacy[action.payload.key] = action.payload.value;
    },
    resetSettings: (state) => {
      return initialState;
    },
  },
});

export const {
  setTheme,
  setLanguage,
  updateNotificationSetting,
  updatePrivacySetting,
  resetSettings
} = settingsSlice.actions;
export default settingsSlice.reducer;
