import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.items = action.payload;
    },
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
    addEvent: (state, action: PayloadAction<Event>) => {
      state.items.push(action.payload);
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
  setEvents,
  setFilter,
  toggleEventRegistration,
  addEvent,
  setLoading,
  setError
} = eventsSlice.actions;
export default eventsSlice.reducer;
