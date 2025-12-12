import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../services/api';
import { Event } from '../../types';
import { cache, cacheKeys, cacheTTL } from '../../utils/cache';

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

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {

      const cachedEvents = await cache.get<Event[]>(cacheKeys.events);

      if (cachedEvents) {

        authApi.getEvents().then(response => {
          if (response.success && response.data) {
            cache.set(cacheKeys.events, response.data, cacheTTL.short);
          }
        }).catch(() => {});

        return cachedEvents;
      }

      const response = await authApi.getEvents();
      if (response.success && response.data) {

        await cache.set(cacheKeys.events, response.data, cacheTTL.short);
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
    image?: any;
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

    addEvent: (state, action: PayloadAction<Event>) => {
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

      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {

        state.isLoading = false;

        const payload = action.payload as any;
        const eventsArray = payload?.results || payload;
        const newEvents = Array.isArray(eventsArray) ? eventsArray : [];

        state.items = newEvents;

      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!Array.isArray(state.items)) {
          state.items = [];
        }

        const existingEventIndex = state.items.findIndex(item => item.id === action.payload.id);
        if (existingEventIndex !== -1) {
          state.items[existingEventIndex] = action.payload;
        } else {

          state.items.unshift(action.payload);
        }

      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteEvent.pending, (state) => {

        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {

        if (Array.isArray(state.items)) {
          const beforeCount = state.items.length;
          const eventId = String(action.payload);
          const filteredItems = state.items.filter(item => String(item.id) !== eventId);

          state.items = [...filteredItems];
          const afterCount = state.items.length;

          if (beforeCount === afterCount) {
          }
        }

      })
      .addCase(deleteEvent.rejected, (state, action) => {

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
