import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import rideReducer from './slices/rideSlice'
import driverReducer from './slices/driverSlice'
import adminReducer from './slices/adminSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rides: rideReducer,
    driver: driverReducer,
    admin: adminReducer,
    ui: uiReducer,
  },
})