import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import scheduleService from '../../services/scheduleService';

// Async thunks
export const fetchActivities = createAsyncThunk(
  'schedule/fetchActivities',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await scheduleService.getActivities(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar atividades');
    }
  }
);

export const createActivity = createAsyncThunk(
  'schedule/createActivity',
  async (activityData, { rejectWithValue }) => {
    try {
      const response = await scheduleService.createActivity(activityData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar atividade');
    }
  }
);

export const updateActivity = createAsyncThunk(
  'schedule/updateActivity',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await scheduleService.updateActivity(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar atividade');
    }
  }
);

export const deleteActivity = createAsyncThunk(
  'schedule/deleteActivity',
  async (activityId, { rejectWithValue }) => {
    try {
      await scheduleService.deleteActivity(activityId);
      return activityId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao excluir atividade');
    }
  }
);

export const joinActivity = createAsyncThunk(
  'schedule/joinActivity',
  async (activityId, { rejectWithValue }) => {
    try {
      const response = await scheduleService.joinActivity(activityId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao participar da atividade');
    }
  }
);

export const leaveActivity = createAsyncThunk(
  'schedule/leaveActivity',
  async (activityId, { rejectWithValue }) => {
    try {
      const response = await scheduleService.leaveActivity(activityId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao sair da atividade');
    }
  }
);

const initialState = {
  activities: [],
  selectedDate: null,
  selectedActivity: null,
  isLoading: false,
  error: null,
  filters: {
    dateRange: null,
    status: 'all',
    type: 'all',
    search: ''
  }
};

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setSelectedActivity: (state, action) => {
      state.selectedActivity = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetSchedule: (state) => {
      return { ...initialState };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Activities
      .addCase(fetchActivities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activities = action.payload;
        state.error = null;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Activity
      .addCase(createActivity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activities.push(action.payload);
        state.error = null;
      })
      .addCase(createActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Activity
      .addCase(updateActivity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.activities.findIndex(activity => activity.id === action.payload.id);
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Activity
      .addCase(deleteActivity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activities = state.activities.filter(activity => activity.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Join Activity
      .addCase(joinActivity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.activities.findIndex(activity => activity.id === action.payload.activityId);
        if (index !== -1) {
          state.activities[index].participants = action.payload.participants;
          state.activities[index].isParticipating = true;
        }
        state.error = null;
      })
      .addCase(joinActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Leave Activity
      .addCase(leaveActivity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(leaveActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.activities.findIndex(activity => activity.id === action.payload.activityId);
        if (index !== -1) {
          state.activities[index].participants = action.payload.participants;
          state.activities[index].isParticipating = false;
        }
        state.error = null;
      })
      .addCase(leaveActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setSelectedDate,
  setSelectedActivity,
  setFilters,
  clearError,
  resetSchedule
} = scheduleSlice.actions;

export default scheduleSlice.reducer;
