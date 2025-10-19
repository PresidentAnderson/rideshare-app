import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    theme: 'light',
    notifications: [],
    loading: {
      global: false,
      rides: false,
      profile: false,
    },
    modal: {
      isOpen: false,
      type: null,
      data: null,
    },
    map: {
      center: [40.7128, -74.0060], // Default to NYC
      zoom: 13,
      markers: [],
    },
    socketConnected: false,
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    setTheme: (state, action) => {
      state.theme = action.payload
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      })
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      )
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    setLoading: (state, action) => {
      const { key, value } = action.payload
      state.loading[key] = value
    },
    openModal: (state, action) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data || null,
      }
    },
    closeModal: (state) => {
      state.modal = {
        isOpen: false,
        type: null,
        data: null,
      }
    },
    setMapCenter: (state, action) => {
      state.map.center = action.payload
    },
    setMapZoom: (state, action) => {
      state.map.zoom = action.payload
    },
    addMapMarker: (state, action) => {
      state.map.markers.push(action.payload)
    },
    removeMapMarker: (state, action) => {
      state.map.markers = state.map.markers.filter(
        marker => marker.id !== action.payload
      )
    },
    clearMapMarkers: (state) => {
      state.map.markers = []
    },
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  setLoading,
  openModal,
  closeModal,
  setMapCenter,
  setMapZoom,
  addMapMarker,
  removeMapMarker,
  clearMapMarkers,
  setSocketConnected,
} = uiSlice.actions

export default uiSlice.reducer