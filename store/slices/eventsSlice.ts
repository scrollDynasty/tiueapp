import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../services/api';
import { Event } from '../../types';

interface EventsState {
  items: Event[];
  filter: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: EventsState = {
  items: [],
  filter: 'all',
  isLoading: false,
  error: null,
};

// Async thunks для работы с API
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getEvents();
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to fetch events');
      }
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData: { 
    title: string; 
    description: string; 
    location: string; 
    date: string; 
    time: string; 
    category: string; 
    max_participants?: number;
    image?: any; // Добавляем поддержку изображений
  }, { rejectWithValue }) => {
    try {
      const response = await authApi.createEvent(eventData);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to create event');
      }
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (eventId: string, { rejectWithValue, getState }) => {
    try {
      const response = await authApi.deleteEvent(eventId);
      if (response.success) {
        return eventId;
      } else {
        return rejectWithValue(response.error || 'Failed to delete event');
      }
    } catch (error) {
      // Если это локальное событие (начинается с local_), удаляем его локально
      if (String(eventId).startsWith('local_')) {
        return eventId;
      }
      return rejectWithValue('Network error occurred');
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<string>) => {
      state.filter = action.payload;
    },
    toggleEventRegistration: (state, action: PayloadAction<string>) => {
      if (!Array.isArray(state.items)) {
        state.items = [];
        return;
      }
      const event = state.items.find(item => item.id === action.payload);
      if (event) {
        event.isRegistered = !event.isRegistered;
        if (event.isRegistered) {
          event.currentParticipants += 1;
        } else {
          event.currentParticipants -= 1;
        }
      }
    },
    // Оставляем локальный addEvent для offline режима
    addEvent: (state, action: PayloadAction<Event>) => {
      if (!Array.isArray(state.items)) {
        state.items = [];
      }
      // Добавляем событие в начало массива для лучшего UX
      state.items.unshift(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        // Django REST Framework возвращает данные в формате {results: [...]}
        const payload = action.payload as any;
        const eventsArray = payload?.results || payload;
        state.items = Array.isArray(eventsArray) ? eventsArray : [];
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create event
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!Array.isArray(state.items)) {
          state.items = [];
        }
        // Добавляем событие в начало массива для лучшего UX
        state.items.unshift(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete event
      .addCase(deleteEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        // Фильтруем события, убирая удаленное по точному совпадению ID
        if (Array.isArray(state.items)) {
          state.items = state.items.filter(item => String(item.id) !== String(action.payload));
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilter,
  toggleEventRegistration,
  addEvent,
  clearError
} = eventsSlice.actions;
export default eventsSlice.reducer;
