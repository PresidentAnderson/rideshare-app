import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { rideAPI } from '../../services/api';

// Async thunks
export const requestRide = createAsyncThunk(
  'ride/request',
  async (rideData, { rejectWithValue }) => {
    try {
      const response = await rideAPI.requestRide(rideData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request ride');
    }
  }
);

export const acceptRide = createAsyncThunk(
  'ride/accept',
  async (rideId, { rejectWithValue }) => {
    try {
      const response = await rideAPI.acceptRide(rideId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept ride');
    }
  }
);

export const updateRideStatus = createAsyncThunk(
  'ride/updateStatus',
  async ({ rideId, status }, { rejectWithValue }) => {
    try {
      const response = await rideAPI.updateRideStatus(rideId, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update ride status');
    }
  }
);

export const cancelRide = createAsyncThunk(
  'ride/cancel',
  async ({ rideId, reason }, { rejectWithValue }) => {
    try {
      const response = await rideAPI.cancelRide(rideId, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel ride');
    }
  }
);

export const fetchRideHistory = createAsyncThunk(
  'ride/fetchHistory',
  async ({ page = 1, limit = 10, status }, { rejectWithValue }) => {
    try {
      const response = await rideAPI.getRideHistory({ page, limit, status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ride history');
    }
  }
);

export const fetchRideDetails = createAsyncThunk(
  'ride/fetchDetails',
  async (rideId, { rejectWithValue }) => {
    try {
      const response = await rideAPI.getRideDetails(rideId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ride details');
    }
  }
);

const initialState = {
  currentRide: null,
  rideHistory: [],
  nearbyDrivers: [],
  loading: false,
  historyLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  rideRequest: {
    pickup: null,
    destination: null,
    vehicleType: 'economy',
    specialRequests: '',
  },
};

const rideSlice = createSlice({
  name: 'ride',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentRide: (state) => {
      state.currentRide = null;
    },
    setRideRequest: (state, action) => {
      state.rideRequest = { ...state.rideRequest, ...action.payload };
    },
    clearRideRequest: (state) => {
      state.rideRequest = {
        pickup: null,
        destination: null,
        vehicleType: 'economy',
        specialRequests: '',
      };
    },
    updateCurrentRideStatus: (state, action) => {
      if (state.currentRide) {
        state.currentRide.status = action.payload.status;
        
        // Update timestamps based on status
        const now = new Date().toISOString();
        switch (action.payload.status) {
          case 'accepted':
            state.currentRide.acceptedAt = now;
            break;
          case 'driver_arrived':
            state.currentRide.arrivedAt = now;
            break;
          case 'in_progress':
            state.currentRide.startedAt = now;
            break;
          case 'completed':
            state.currentRide.completedAt = now;
            break;
          case 'cancelled_by_rider':
          case 'cancelled_by_driver':
            state.currentRide.cancelledAt = now;
            break;
        }
      }
    },
    addRideToHistory: (state, action) => {
      state.rideHistory.unshift(action.payload);
    },
    setNearbyDrivers: (state, action) => {
      state.nearbyDrivers = action.payload;
    },
    updateDriverLocation: (state, action) => {
      const { driverId, location } = action.payload;
      const driver = state.nearbyDrivers.find(d => d.id === driverId);
      if (driver) {
        driver.currentLat = location.lat;
        driver.currentLng = location.lng;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Request ride
      .addCase(requestRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestRide.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload.ride;
        state.error = null;
      })
      .addCase(requestRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Accept ride
      .addCase(acceptRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptRide.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload.ride;
        state.error = null;
      })
      .addCase(acceptRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update ride status
      .addCase(updateRideStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRideStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload.ride;
        state.error = null;
      })
      .addCase(updateRideStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Cancel ride
      .addCase(cancelRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelRide.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload.ride;
        state.error = null;
      })
      .addCase(cancelRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch ride history
      .addCase(fetchRideHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(fetchRideHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.rideHistory = action.payload.rides;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchRideHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload;
      })
      
      // Fetch ride details
      .addCase(fetchRideDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRideDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRide = action.payload.ride;
        state.error = null;
      })
      .addCase(fetchRideDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentRide,
  setRideRequest,
  clearRideRequest,
  updateCurrentRideStatus,
  addRideToHistory,
  setNearbyDrivers,
  updateDriverLocation,
} = rideSlice.actions;

export default rideSlice.reducer;