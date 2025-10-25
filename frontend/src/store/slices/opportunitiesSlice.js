import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import opportunitiesService from '../../services/opportunitiesService';

// Async thunks
export const fetchOpportunities = createAsyncThunk(
  'opportunities/fetchOpportunities',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await opportunitiesService.getOpportunities(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar oportunidades');
    }
  }
);

export const fetchOpportunityById = createAsyncThunk(
  'opportunities/fetchOpportunityById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await opportunitiesService.getOpportunityById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar oportunidade');
    }
  }
);

export const createOpportunity = createAsyncThunk(
  'opportunities/createOpportunity',
  async (opportunityData, { rejectWithValue }) => {
    try {
      const response = await opportunitiesService.createOpportunity(opportunityData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar oportunidade');
    }
  }
);

export const updateOpportunity = createAsyncThunk(
  'opportunities/updateOpportunity',
  async ({ id, opportunityData }, { rejectWithValue }) => {
    try {
      const response = await opportunitiesService.updateOpportunity(id, opportunityData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar oportunidade');
    }
  }
);

export const deleteOpportunity = createAsyncThunk(
  'opportunities/deleteOpportunity',
  async (id, { rejectWithValue }) => {
    try {
      await opportunitiesService.deleteOpportunity(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao deletar oportunidade');
    }
  }
);

export const applyToOpportunity = createAsyncThunk(
  'opportunities/applyToOpportunity',
  async ({ opportunityId, applicationData }, { rejectWithValue }) => {
    try {
      const response = await opportunitiesService.applyToOpportunity(opportunityId, applicationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao se candidatar à oportunidade');
    }
  }
);

export const withdrawApplication = createAsyncThunk(
  'opportunities/withdrawApplication',
  async (opportunityId, { rejectWithValue }) => {
    try {
      await opportunitiesService.withdrawApplication(opportunityId);
      return opportunityId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao cancelar candidatura');
    }
  }
);

const initialState = {
  opportunities: [],
  currentOpportunity: null,
  myApplications: [],
  isLoading: false,
  error: null,
  filters: {
    category: '',
    location: '',
    dateRange: '',
    skills: [],
    availability: '',
    type: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

const opportunitiesSlice = createSlice({
  name: 'opportunities',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        location: '',
        dateRange: '',
        skills: [],
        availability: '',
        type: '',
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOpportunity: (state) => {
      state.currentOpportunity = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Opportunities
      .addCase(fetchOpportunities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOpportunities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.opportunities = action.payload.opportunities || action.payload;
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchOpportunities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch Opportunity by ID
      .addCase(fetchOpportunityById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOpportunityById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOpportunity = action.payload;
        state.error = null;
      })
      .addCase(fetchOpportunityById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Opportunity
      .addCase(createOpportunity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOpportunity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.opportunities.unshift(action.payload);
        state.error = null;
      })
      .addCase(createOpportunity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Opportunity
      .addCase(updateOpportunity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOpportunity.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.opportunities.findIndex(opp => opp.id === action.payload.id);
        if (index !== -1) {
          state.opportunities[index] = action.payload;
        }
        if (state.currentOpportunity?.id === action.payload.id) {
          state.currentOpportunity = action.payload;
        }
        state.error = null;
      })
      .addCase(updateOpportunity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Opportunity
      .addCase(deleteOpportunity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOpportunity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.opportunities = state.opportunities.filter(opp => opp.id !== action.payload);
        if (state.currentOpportunity?.id === action.payload) {
          state.currentOpportunity = null;
        }
        state.error = null;
      })
      .addCase(deleteOpportunity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Apply to Opportunity
      .addCase(applyToOpportunity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyToOpportunity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myApplications.push(action.payload);
        state.error = null;
      })
      .addCase(applyToOpportunity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Withdraw Application
      .addCase(withdrawApplication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(withdrawApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myApplications = state.myApplications.filter(app => app.opportunityId !== action.payload);
        state.error = null;
      })
      .addCase(withdrawApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  setPagination,
  clearError,
  clearCurrentOpportunity,
} = opportunitiesSlice.actions;

export default opportunitiesSlice.reducer;
