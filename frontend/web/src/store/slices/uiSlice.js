import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: false,
  darkMode: false,
  notifications: [],
  loading: {
    global: false,
    page: false,
    component: {},
  },
  modals: {
    rideRequest: false,
    payment: false,
    rating: false,
    profile: false,
    driverRegistration: false,
  },
  activeTab: 'dashboard',
  mapSettings: {
    center: { lat: 40.7589, lng: -73.9851 }, // Default to NYC
    zoom: 13,
    traffic: false,
    satellite: false,
  },
  filters: {
    rideHistory: {
      status: 'all',
      dateRange: 'all',
    },
    paymentHistory: {
      status: 'all',
      dateRange: 'all',
    },
  },
  searchQuery: '',
  currentPage: 'dashboard',
  breadcrumbs: [],
  toast: {
    show: false,
    type: 'info', // 'success', 'error', 'warning', 'info'
    message: '',
    duration: 5000,
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
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', action.payload);
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      state.notifications.unshift(notification);
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    markNotificationRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setPageLoading: (state, action) => {
      state.loading.page = action.payload;
    },
    setComponentLoading: (state, action) => {
      const { component, loading } = action.payload;
      state.loading.component[component] = loading;
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modal => {
        state.modals[modal] = false;
      });
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setMapCenter: (state, action) => {
      state.mapSettings.center = action.payload;
    },
    setMapZoom: (state, action) => {
      state.mapSettings.zoom = action.payload;
    },
    toggleMapTraffic: (state) => {
      state.mapSettings.traffic = !state.mapSettings.traffic;
    },
    toggleMapSatellite: (state) => {
      state.mapSettings.satellite = !state.mapSettings.satellite;
    },
    setFilter: (state, action) => {
      const { filterType, filterKey, value } = action.payload;
      state.filters[filterType][filterKey] = value;
    },
    clearFilters: (state, action) => {
      const filterType = action.payload;
      Object.keys(state.filters[filterType]).forEach(key => {
        if (key === 'status') {
          state.filters[filterType][key] = 'all';
        } else if (key === 'dateRange') {
          state.filters[filterType][key] = 'all';
        } else {
          state.filters[filterType][key] = '';
        }
      });
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
    showToast: (state, action) => {
      state.toast = {
        show: true,
        type: action.payload.type || 'info',
        message: action.payload.message,
        duration: action.payload.duration || 5000,
      };
    },
    hideToast: (state) => {
      state.toast.show = false;
    },
    resetUI: (state) => {
      return {
        ...initialState,
        darkMode: state.darkMode, // Keep dark mode preference
      };
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setDarkMode,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  clearNotifications,
  setGlobalLoading,
  setPageLoading,
  setComponentLoading,
  openModal,
  closeModal,
  closeAllModals,
  setActiveTab,
  setMapCenter,
  setMapZoom,
  toggleMapTraffic,
  toggleMapSatellite,
  setFilter,
  clearFilters,
  setSearchQuery,
  setCurrentPage,
  setBreadcrumbs,
  showToast,
  hideToast,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;