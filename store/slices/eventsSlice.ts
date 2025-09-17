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
      console.log('🗑️ Deleting event with ID:', eventId);
      const response = await authApi.deleteEvent(eventId);
      console.log('🗑️ Delete response:', response);
      
      if (response.success) {
        console.log('✅ Delete successful, returning ID:', eventId);
        return eventId;
      } else {
        console.log('❌ Delete failed:', response.error);
        return rejectWithValue(response.error || 'Failed to delete event');
      }
    } catch (error) {
      console.log('💥 Delete error:', error);
      // Если это локальное событие (начинается с local_), удаляем его локально
      if (String(eventId).startsWith('local_')) {
        console.log('🏠 Local event, deleting locally');
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
        console.log('📥 Fetch events fulfilled');
        console.log('📋 Events before fetch update:', state.items.map(item => ({ id: item.id, title: item.title })));
        
        state.isLoading = false;
        // Django REST Framework возвращает данные в формате {results: [...]}
        const payload = action.payload as any;
        const eventsArray = payload?.results || payload;
        const newEvents = Array.isArray(eventsArray) ? eventsArray : [];
        
        console.log('📥 New events from server:', newEvents.map((item: any) => ({ id: item.id, title: item.title })));
        
        state.items = newEvents;
        
        console.log('📋 Events after fetch update:', state.items.map(item => ({ id: item.id, title: item.title })));
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create event
      .addCase(createEvent.pending, (state) => {
        console.log('🆕 Create event pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        console.log('🆕 Create event fulfilled with data:', action.payload);
        console.log('📋 Current events before adding:', state.items.map(item => ({ id: item.id, title: item.title })));
        
        state.isLoading = false;
        if (!Array.isArray(state.items)) {
          state.items = [];
        }
        
        // Проверяем, нет ли уже такого события в списке (по ID)
        const existingEventIndex = state.items.findIndex(item => item.id === action.payload.id);
        if (existingEventIndex !== -1) {
          console.log('⚠️ Event already exists! Replacing instead of adding');
          state.items[existingEventIndex] = action.payload;
        } else {
          console.log('✅ Adding new event to the beginning of the list');
          // Добавляем событие в начало массива для лучшего UX
          state.items.unshift(action.payload);
        }
        
        console.log('📋 Events after adding:', state.items.map(item => ({ id: item.id, title: item.title })));
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete event
      .addCase(deleteEvent.pending, (state) => {
        console.log('🔄 Delete event pending');
        // НЕ устанавливаем isLoading в true для удаления, чтобы не блокировать UI
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        console.log('✅ Delete event fulfilled with ID:', action.payload);
        console.log('📋 Current events before deletion:', state.items.map(item => ({ id: item.id, title: item.title })));
        
        // НЕ изменяем isLoading здесь, оставляем его как есть
        // state.isLoading = false;
        
        // Фильтруем события, убирая удаленное по точному совпадению ID
        if (Array.isArray(state.items)) {
          const beforeCount = state.items.length;
          const eventId = String(action.payload);
          const filteredItems = state.items.filter(item => String(item.id) !== eventId);
          
          console.log(`🔍 Filtering: looking for ID "${eventId}" to remove`);
          console.log('🔍 IDs in array:', state.items.map(item => `"${String(item.id)}"`));
          
          // Создаем полностью новый массив для обеспечения реактивности
          state.items = [...filteredItems];
          const afterCount = state.items.length;
          console.log(`Events count: ${beforeCount} → ${afterCount} (removed: ${beforeCount - afterCount})`);
          
          if (beforeCount === afterCount) {
            console.log('⚠️  WARNING: No events were removed! Check ID matching logic.');
            console.log('🔍 Available IDs:', state.items.map(item => String(item.id)));
            console.log('🔍 Looking for ID:', eventId);
          }
        }
        
        console.log('📋 Events after deletion:', state.items.map(item => ({ id: item.id, title: item.title })));
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        console.log('❌ Delete event rejected:', action.payload);
        // НЕ изменяем isLoading здесь тоже
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
