import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  theme: 'light',
  language: 'pt-BR',
  loading: false,
  modals: {
    login: false,
    register: false,
    forgotPassword: false,
    profile: false,
    settings: false,
  },
  notifications: {
    show: false,
    type: 'info', // 'success', 'error', 'warning', 'info'
    message: '',
    duration: 5000,
  },
  search: {
    query: '',
    filters: {},
    results: [],
    isLoading: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
    showNotification: (state, action) => {
      state.notifications = {
        show: true,
        type: action.payload.type || 'info',
        message: action.payload.message,
        duration: action.payload.duration || 5000,
      };
    },
    hideNotification: (state) => {
      state.notifications.show = false;
    },
    setSearchQuery: (state, action) => {
      state.search.query = action.payload;
    },
    setSearchFilters: (state, action) => {
      state.search.filters = action.payload;
    },
    setSearchResults: (state, action) => {
      state.search.results = action.payload;
    },
    setSearchLoading: (state, action) => {
      state.search.isLoading = action.payload;
    },
    clearSearch: (state) => {
      state.search.query = '';
      state.search.filters = {};
      state.search.results = [];
      state.search.isLoading = false;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setLanguage,
  setLoading,
  openModal,
  closeModal,
  closeAllModals,
  showNotification,
  hideNotification,
  setSearchQuery,
  setSearchFilters,
  setSearchResults,
  setSearchLoading,
  clearSearch,
} = uiSlice.actions;

export default uiSlice.reducer;
