import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import evaluationService from '../../services/evaluationService';

// Async thunks
export const fetchEvaluations = createAsyncThunk(
  'evaluation/fetchEvaluations',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await evaluationService.getEvaluations(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar avaliações');
    }
  }
);

export const createEvaluation = createAsyncThunk(
  'evaluation/createEvaluation',
  async (evaluationData, { rejectWithValue }) => {
    try {
      const response = await evaluationService.createEvaluation(evaluationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar avaliação');
    }
  }
);

export const updateEvaluation = createAsyncThunk(
  'evaluation/updateEvaluation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await evaluationService.updateEvaluation(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar avaliação');
    }
  }
);

export const deleteEvaluation = createAsyncThunk(
  'evaluation/deleteEvaluation',
  async (evaluationId, { rejectWithValue }) => {
    try {
      await evaluationService.deleteEvaluation(evaluationId);
      return evaluationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao excluir avaliação');
    }
  }
);

export const reportEvaluation = createAsyncThunk(
  'evaluation/reportEvaluation',
  async ({ evaluationId, reportData }, { rejectWithValue }) => {
    try {
      const response = await evaluationService.reportEvaluation(evaluationId, reportData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao reportar avaliação');
    }
  }
);

export const getEvaluationStats = createAsyncThunk(
  'evaluation/getEvaluationStats',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await evaluationService.getEvaluationStats(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar estatísticas');
    }
  }
);

export const moderateEvaluation = createAsyncThunk(
  'evaluation/moderateEvaluation',
  async ({ evaluationId, moderationData }, { rejectWithValue }) => {
    try {
      const response = await evaluationService.moderateEvaluation(evaluationId, moderationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao moderar avaliação');
    }
  }
);

export const approveEvaluation = createAsyncThunk(
  'evaluation/approveEvaluation',
  async (evaluationId, { rejectWithValue }) => {
    try {
      const response = await evaluationService.approveEvaluation(evaluationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao aprovar avaliação');
    }
  }
);

export const rejectEvaluation = createAsyncThunk(
  'evaluation/rejectEvaluation',
  async ({ evaluationId, reason }, { rejectWithValue }) => {
    try {
      const response = await evaluationService.rejectEvaluation(evaluationId, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao rejeitar avaliação');
    }
  }
);

const initialState = {
  evaluations: [],
  selectedEvaluation: null,
  stats: null,
  isLoading: false,
  error: null,
  filters: {
    rating: 'all',
    dateRange: 'all',
    type: 'all',
    status: 'all',
    search: ''
  }
};

const evaluationSlice = createSlice({
  name: 'evaluation',
  initialState,
  reducers: {
    setSelectedEvaluation: (state, action) => {
      state.selectedEvaluation = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetEvaluation: (state) => {
      return { ...initialState };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Evaluations
      .addCase(fetchEvaluations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvaluations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.evaluations = action.payload;
        state.error = null;
      })
      .addCase(fetchEvaluations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Evaluation
      .addCase(createEvaluation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvaluation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.evaluations.unshift(action.payload);
        state.error = null;
      })
      .addCase(createEvaluation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Evaluation
      .addCase(updateEvaluation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEvaluation.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.evaluations.findIndex(eval => eval.id === action.payload.id);
        if (index !== -1) {
          state.evaluations[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateEvaluation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Evaluation
      .addCase(deleteEvaluation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEvaluation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.evaluations = state.evaluations.filter(eval => eval.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteEvaluation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Report Evaluation
      .addCase(reportEvaluation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reportEvaluation.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.evaluations.findIndex(eval => eval.id === action.payload.evaluationId);
        if (index !== -1) {
          state.evaluations[index].status = 'REPORTED';
          state.evaluations[index].reports = action.payload.reports;
        }
        state.error = null;
      })
      .addCase(reportEvaluation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Evaluation Stats
      .addCase(getEvaluationStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEvaluationStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(getEvaluationStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Moderate Evaluation
      .addCase(moderateEvaluation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(moderateEvaluation.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.evaluations.findIndex(eval => eval.id === action.payload.evaluationId);
        if (index !== -1) {
          state.evaluations[index].status = action.payload.status;
          state.evaluations[index].moderation = action.payload.moderation;
        }
        state.error = null;
      })
      .addCase(moderateEvaluation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Approve Evaluation
      .addCase(approveEvaluation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveEvaluation.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.evaluations.findIndex(eval => eval.id === action.payload.evaluationId);
        if (index !== -1) {
          state.evaluations[index].status = 'APPROVED';
          state.evaluations[index].moderation = action.payload.moderation;
        }
        state.error = null;
      })
      .addCase(approveEvaluation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reject Evaluation
      .addCase(rejectEvaluation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectEvaluation.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.evaluations.findIndex(eval => eval.id === action.payload.evaluationId);
        if (index !== -1) {
          state.evaluations[index].status = 'REJECTED';
          state.evaluations[index].moderation = action.payload.moderation;
        }
        state.error = null;
      })
      .addCase(rejectEvaluation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setSelectedEvaluation,
  setFilters,
  clearError,
  resetEvaluation
} = evaluationSlice.actions;

export default evaluationSlice.reducer;
