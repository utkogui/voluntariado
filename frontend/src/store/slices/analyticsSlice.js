import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import analyticsService from '../../services/analyticsService';

// Async thunks
export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getGeneralMetrics(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar analytics');
    }
  }
);

export const getGeneralMetrics = createAsyncThunk(
  'analytics/getGeneralMetrics',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getGeneralMetrics(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar métricas gerais');
    }
  }
);

export const getUserMetrics = createAsyncThunk(
  'analytics/getUserMetrics',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getUserMetrics(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar métricas de usuários');
    }
  }
);

export const getOpportunityMetrics = createAsyncThunk(
  'analytics/getOpportunityMetrics',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getOpportunityMetrics(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar métricas de oportunidades');
    }
  }
);

export const getActivityMetrics = createAsyncThunk(
  'analytics/getActivityMetrics',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getActivityMetrics(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar métricas de atividades');
    }
  }
);

export const getEngagementMetrics = createAsyncThunk(
  'analytics/getEngagementMetrics',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getEngagementMetrics(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar métricas de engajamento');
    }
  }
);

export const getConversionMetrics = createAsyncThunk(
  'analytics/getConversionMetrics',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getConversionMetrics(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar métricas de conversão');
    }
  }
);

export const getRetentionMetrics = createAsyncThunk(
  'analytics/getRetentionMetrics',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getRetentionMetrics(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar métricas de retenção');
    }
  }
);

export const getSatisfactionMetrics = createAsyncThunk(
  'analytics/getSatisfactionMetrics',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getSatisfactionMetrics(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar métricas de satisfação');
    }
  }
);

export const getImpactMetrics = createAsyncThunk(
  'analytics/getImpactMetrics',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getImpactMetrics(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar métricas de impacto');
    }
  }
);

export const getTrendsData = createAsyncThunk(
  'analytics/getTrendsData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getTrendsData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de tendências');
    }
  }
);

export const getComparisonData = createAsyncThunk(
  'analytics/getComparisonData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getComparisonData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de comparação');
    }
  }
);

export const getSegmentationData = createAsyncThunk(
  'analytics/getSegmentationData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getSegmentationData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de segmentação');
    }
  }
);

export const getGeolocationData = createAsyncThunk(
  'analytics/getGeolocationData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getGeolocationData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de geolocalização');
    }
  }
);

export const getDeviceData = createAsyncThunk(
  'analytics/getDeviceData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getDeviceData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de dispositivos');
    }
  }
);

export const getChannelData = createAsyncThunk(
  'analytics/getChannelData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getChannelData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de canais');
    }
  }
);

export const getCampaignData = createAsyncThunk(
  'analytics/getCampaignData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getCampaignData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de campanhas');
    }
  }
);

export const getEventData = createAsyncThunk(
  'analytics/getEventData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getEventData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de eventos');
    }
  }
);

export const getFunnelData = createAsyncThunk(
  'analytics/getFunnelData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getFunnelData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de funil');
    }
  }
);

export const getCohortData = createAsyncThunk(
  'analytics/getCohortData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getCohortData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de coorte');
    }
  }
);

export const getABTestData = createAsyncThunk(
  'analytics/getABTestData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getABTestData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de A/B testing');
    }
  }
);

export const getPerformanceData = createAsyncThunk(
  'analytics/getPerformanceData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getPerformanceData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de performance');
    }
  }
);

export const getCostData = createAsyncThunk(
  'analytics/getCostData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getCostData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de custos');
    }
  }
);

export const getROIData = createAsyncThunk(
  'analytics/getROIData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getROIData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de ROI');
    }
  }
);

export const getLTVData = createAsyncThunk(
  'analytics/getLTVData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getLTVData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de LTV');
    }
  }
);

export const getChurnData = createAsyncThunk(
  'analytics/getChurnData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getChurnData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de churn');
    }
  }
);

export const getNPSData = createAsyncThunk(
  'analytics/getNPSData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getNPSData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de NPS');
    }
  }
);

export const getCSATData = createAsyncThunk(
  'analytics/getCSATData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getCSATData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de CSAT');
    }
  }
);

export const getCESData = createAsyncThunk(
  'analytics/getCESData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getCESData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de CES');
    }
  }
);

export const getRealTimeData = createAsyncThunk(
  'analytics/getRealTimeData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getRealTimeData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados em tempo real');
    }
  }
);

export const getAlertData = createAsyncThunk(
  'analytics/getAlertData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getAlertData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de alertas');
    }
  }
);

export const getReportData = createAsyncThunk(
  'analytics/getReportData',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getReportData(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados de relatórios');
    }
  }
);

export const generateCustomReport = createAsyncThunk(
  'analytics/generateCustomReport',
  async (reportConfig, { rejectWithValue }) => {
    try {
      const response = await analyticsService.generateCustomReport(reportConfig);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao gerar relatório personalizado');
    }
  }
);

export const exportData = createAsyncThunk(
  'analytics/exportData',
  async ({ filters, format }, { rejectWithValue }) => {
    try {
      const response = await analyticsService.exportData(filters, format);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao exportar dados');
    }
  }
);

export const getDashboardData = createAsyncThunk(
  'analytics/getDashboardData',
  async ({ dashboardId, filters }, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getDashboardData(dashboardId, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar dados do dashboard');
    }
  }
);

export const saveDashboard = createAsyncThunk(
  'analytics/saveDashboard',
  async (dashboardData, { rejectWithValue }) => {
    try {
      const response = await analyticsService.saveDashboard(dashboardData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao salvar dashboard');
    }
  }
);

export const updateDashboard = createAsyncThunk(
  'analytics/updateDashboard',
  async ({ dashboardId, dashboardData }, { rejectWithValue }) => {
    try {
      const response = await analyticsService.updateDashboard(dashboardId, dashboardData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar dashboard');
    }
  }
);

export const deleteDashboard = createAsyncThunk(
  'analytics/deleteDashboard',
  async (dashboardId, { rejectWithValue }) => {
    try {
      await analyticsService.deleteDashboard(dashboardId);
      return dashboardId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao excluir dashboard');
    }
  }
);

export const getWidgets = createAsyncThunk(
  'analytics/getWidgets',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getWidgets(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar widgets');
    }
  }
);

export const saveWidget = createAsyncThunk(
  'analytics/saveWidget',
  async (widgetData, { rejectWithValue }) => {
    try {
      const response = await analyticsService.saveWidget(widgetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao salvar widget');
    }
  }
);

export const updateWidget = createAsyncThunk(
  'analytics/updateWidget',
  async ({ widgetId, widgetData }, { rejectWithValue }) => {
    try {
      const response = await analyticsService.updateWidget(widgetId, widgetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar widget');
    }
  }
);

export const deleteWidget = createAsyncThunk(
  'analytics/deleteWidget',
  async (widgetId, { rejectWithValue }) => {
    try {
      await analyticsService.deleteWidget(widgetId);
      return widgetId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao excluir widget');
    }
  }
);

const initialState = {
  analytics: null,
  selectedMetric: null,
  selectedChart: null,
  selectedWidget: null,
  isLoading: false,
  error: null,
  filters: {
    period: '30d',
    type: 'all',
    category: 'all',
    status: 'all'
  }
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setSelectedMetric: (state, action) => {
      state.selectedMetric = action.payload;
    },
    setSelectedChart: (state, action) => {
      state.selectedChart = action.payload;
    },
    setSelectedWidget: (state, action) => {
      state.selectedWidget = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAnalytics: (state) => {
      return { ...initialState };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
        state.error = null;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // General Metrics
      .addCase(getGeneralMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getGeneralMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, generalMetrics: action.payload };
        state.error = null;
      })
      .addCase(getGeneralMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // User Metrics
      .addCase(getUserMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, userMetrics: action.payload };
        state.error = null;
      })
      .addCase(getUserMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Opportunity Metrics
      .addCase(getOpportunityMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOpportunityMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, opportunityMetrics: action.payload };
        state.error = null;
      })
      .addCase(getOpportunityMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Activity Metrics
      .addCase(getActivityMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getActivityMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, activityMetrics: action.payload };
        state.error = null;
      })
      .addCase(getActivityMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Engagement Metrics
      .addCase(getEngagementMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEngagementMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, engagementMetrics: action.payload };
        state.error = null;
      })
      .addCase(getEngagementMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Conversion Metrics
      .addCase(getConversionMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getConversionMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, conversionMetrics: action.payload };
        state.error = null;
      })
      .addCase(getConversionMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Retention Metrics
      .addCase(getRetentionMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRetentionMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, retentionMetrics: action.payload };
        state.error = null;
      })
      .addCase(getRetentionMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Satisfaction Metrics
      .addCase(getSatisfactionMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSatisfactionMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, satisfactionMetrics: action.payload };
        state.error = null;
      })
      .addCase(getSatisfactionMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Impact Metrics
      .addCase(getImpactMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getImpactMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, impactMetrics: action.payload };
        state.error = null;
      })
      .addCase(getImpactMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Trends Data
      .addCase(getTrendsData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTrendsData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, trendsData: action.payload };
        state.error = null;
      })
      .addCase(getTrendsData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Comparison Data
      .addCase(getComparisonData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getComparisonData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, comparisonData: action.payload };
        state.error = null;
      })
      .addCase(getComparisonData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Segmentation Data
      .addCase(getSegmentationData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSegmentationData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, segmentationData: action.payload };
        state.error = null;
      })
      .addCase(getSegmentationData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Geolocation Data
      .addCase(getGeolocationData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getGeolocationData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, geolocationData: action.payload };
        state.error = null;
      })
      .addCase(getGeolocationData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Device Data
      .addCase(getDeviceData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDeviceData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, deviceData: action.payload };
        state.error = null;
      })
      .addCase(getDeviceData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Channel Data
      .addCase(getChannelData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getChannelData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, channelData: action.payload };
        state.error = null;
      })
      .addCase(getChannelData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Campaign Data
      .addCase(getCampaignData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCampaignData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, campaignData: action.payload };
        state.error = null;
      })
      .addCase(getCampaignData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Event Data
      .addCase(getEventData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEventData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, eventData: action.payload };
        state.error = null;
      })
      .addCase(getEventData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Funnel Data
      .addCase(getFunnelData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFunnelData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, funnelData: action.payload };
        state.error = null;
      })
      .addCase(getFunnelData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Cohort Data
      .addCase(getCohortData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCohortData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, cohortData: action.payload };
        state.error = null;
      })
      .addCase(getCohortData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // A/B Test Data
      .addCase(getABTestData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getABTestData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, abTestData: action.payload };
        state.error = null;
      })
      .addCase(getABTestData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Performance Data
      .addCase(getPerformanceData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPerformanceData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, performanceData: action.payload };
        state.error = null;
      })
      .addCase(getPerformanceData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Cost Data
      .addCase(getCostData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCostData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, costData: action.payload };
        state.error = null;
      })
      .addCase(getCostData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // ROI Data
      .addCase(getROIData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getROIData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, roiData: action.payload };
        state.error = null;
      })
      .addCase(getROIData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // LTV Data
      .addCase(getLTVData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLTVData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, ltvData: action.payload };
        state.error = null;
      })
      .addCase(getLTVData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Churn Data
      .addCase(getChurnData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getChurnData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, churnData: action.payload };
        state.error = null;
      })
      .addCase(getChurnData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // NPS Data
      .addCase(getNPSData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNPSData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, npsData: action.payload };
        state.error = null;
      })
      .addCase(getNPSData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // CSAT Data
      .addCase(getCSATData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCSATData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, csatData: action.payload };
        state.error = null;
      })
      .addCase(getCSATData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // CES Data
      .addCase(getCESData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCESData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, cesData: action.payload };
        state.error = null;
      })
      .addCase(getCESData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Real Time Data
      .addCase(getRealTimeData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRealTimeData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, realTimeData: action.payload };
        state.error = null;
      })
      .addCase(getRealTimeData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Alert Data
      .addCase(getAlertData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAlertData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, alertData: action.payload };
        state.error = null;
      })
      .addCase(getAlertData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Report Data
      .addCase(getReportData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReportData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, reportData: action.payload };
        state.error = null;
      })
      .addCase(getReportData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Generate Custom Report
      .addCase(generateCustomReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateCustomReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, customReport: action.payload };
        state.error = null;
      })
      .addCase(generateCustomReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Export Data
      .addCase(exportData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, exportedData: action.payload };
        state.error = null;
      })
      .addCase(exportData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Dashboard Data
      .addCase(getDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, dashboardData: action.payload };
        state.error = null;
      })
      .addCase(getDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Save Dashboard
      .addCase(saveDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, savedDashboard: action.payload };
        state.error = null;
      })
      .addCase(saveDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Dashboard
      .addCase(updateDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, updatedDashboard: action.payload };
        state.error = null;
      })
      .addCase(updateDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Dashboard
      .addCase(deleteDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, deletedDashboard: action.payload };
        state.error = null;
      })
      .addCase(deleteDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Widgets
      .addCase(getWidgets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWidgets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, widgets: action.payload };
        state.error = null;
      })
      .addCase(getWidgets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Save Widget
      .addCase(saveWidget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveWidget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, savedWidget: action.payload };
        state.error = null;
      })
      .addCase(saveWidget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Widget
      .addCase(updateWidget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWidget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, updatedWidget: action.payload };
        state.error = null;
      })
      .addCase(updateWidget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Widget
      .addCase(deleteWidget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteWidget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = { ...state.analytics, deletedWidget: action.payload };
        state.error = null;
      })
      .addCase(deleteWidget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setSelectedMetric,
  setSelectedChart,
  setSelectedWidget,
  setFilters,
  clearError,
  resetAnalytics
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
