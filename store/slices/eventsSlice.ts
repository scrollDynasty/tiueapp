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
  async (eventData: Omit<Event, 'id'>, { rejectWithValue }) => {
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
  async (eventId: string, { rejectWithValue }) => {
    try {
      const response = await authApi.deleteEvent(eventId);
      if (response.success) {
        return eventId;
      } else {
        return rejectWithValue(response.error || 'Failed to delete event');
      }
    } catch (error) {
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
      state.items.push(action.payload);
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
        state.items = action.payload;
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
        state.items.push(action.payload);
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
        state.items = state.items.filter(item => item.id !== action.payload);
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
