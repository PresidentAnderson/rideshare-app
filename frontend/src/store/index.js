import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import rideSlice from './slices/rideSlice'
import driverSlice from './slices/driverSlice'
import uiSlice from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ride: rideSlice,
    driver: driverSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})