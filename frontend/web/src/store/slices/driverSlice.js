import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { driverAPI } from '../../services/api';

// Async thunks
export const registerDriver = createAsyncThunk(
  'driver/register',
  async (driverData, { rejectWithValue }) => {
    try {
      const response = await driverAPI.registerDriver(driverData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Driver registration failed');
    }
  }
);

export const fetchDriverProfile = createAsyncThunk(
  'driver/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await driverAPI.getDriverProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch driver profile');
    }
  }
);

export const updateDriverStatus = createAsyncThunk(
  'driver/updateStatus',
  async (isOnline, { rejectWithValue }) => {
    try {
      const response = await driverAPI.updateDriverStatus({ isOnline });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update driver status');
    }
  }
);

export const updateDriverLocation = createAsyncThunk(
  'driver/updateLocation',
  async ({ lat, lng }, { rejectWithValue }) => {
    try {
      const response = await driverAPI.updateLocation({ lat, lng });
      return { lat, lng };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update location');
    }
  }
);

export const fetchDriverStats = createAsyncThunk(
  'driver/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await driverAPI.getDriverStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch driver stats');
    }
  }
);

export const fetchNearbyDrivers = createAsyncThunk(
  'driver/fetchNearby',
  async ({ lat, lng, radius = 5, vehicleType }, { rejectWithValue }) => {
    try {
      const response = await driverAPI.getNearbyDrivers({ lat, lng, radius, vehicleType });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch nearby drivers');
    }
  }
);

const initialState = {
  profile: null,
  stats: null,
  nearbyDrivers: [],
  isOnline: false,
  currentLocation: null,
  loading: false,
  statsLoading: false,
  nearbyLoading: false,
  error: null,
  registrationStep: 1,
  registrationData: {
    licenseNumber: '',
    licenseExpiry: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    licensePlate: '',
    vehicleType: 'economy',
  },
};

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
      if (state.profile) {
        state.profile.isOnline = action.payload;
      }
    },
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
      if (state.profile) {
        state.profile.currentLat = action.payload.lat;
        state.profile.currentLng = action.payload.lng;
      }
    },
    updateRegistrationData: (state, action) => {
      state.registrationData = { ...state.registrationData, ...action.payload };
    },
    setRegistrationStep: (state, action) => {
      state.registrationStep = action.payload;
    },
    clearRegistrationData: (state) => {
      state.registrationData = {
        licenseNumber: '',
        licenseExpiry: '',
        vehicleModel: '',
        vehicleYear: '',
        vehicleColor: '',
        licensePlate: '',
        vehicleType: 'economy',
      };
      state.registrationStep = 1;
    },
    updateNearbyDriver: (state, action) => {
      const { driverId, updates } = action.payload;
      const driverIndex = state.nearbyDrivers.findIndex(d => d.id === driverId);
      if (driverIndex !== -1) {
        state.nearbyDrivers[driverIndex] = { ...state.nearbyDrivers[driverIndex], ...updates };
      }
    },
    removeNearbyDriver: (state, action) => {
      state.nearbyDrivers = state.nearbyDrivers.filter(d => d.id !== action.payload);
    },
    addNearbyDriver: (state, action) => {
      const existingIndex = state.nearbyDrivers.findIndex(d => d.id === action.payload.id);
      if (existingIndex === -1) {
        state.nearbyDrivers.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register driver
      .addCase(registerDriver.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.driver;
        state.error = null;
      })
      .addCase(registerDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch driver profile
      .addCase(fetchDriverProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.driver;
        state.isOnline = action.payload.driver.isOnline;
        if (action.payload.driver.currentLat && action.payload.driver.currentLng) {
          state.currentLocation = {
            lat: action.payload.driver.currentLat,
            lng: action.payload.driver.currentLng,
          };
        }
        state.error = null;
      })
      .addCase(fetchDriverProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update driver status
      .addCase(updateDriverStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDriverStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.driver;
        state.isOnline = action.payload.driver.isOnline;
        state.error = null;
      })
      .addCase(updateDriverStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update driver location
      .addCase(updateDriverLocation.pending, (state) => {
        // Don't show loading for location updates (too frequent)
        state.error = null;
      })
      .addCase(updateDriverLocation.fulfilled, (state, action) => {
        state.currentLocation = action.payload;
        if (state.profile) {
          state.profile.currentLat = action.payload.lat;
          state.profile.currentLng = action.payload.lng;
        }
        state.error = null;
      })
      .addCase(updateDriverLocation.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Fetch driver stats
      .addCase(fetchDriverStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchDriverStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.stats;
        state.error = null;
      })
      .addCase(fetchDriverStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })
      
      // Fetch nearby drivers
      .addCase(fetchNearbyDrivers.pending, (state) => {
        state.nearbyLoading = true;
        state.error = null;
      })
      .addCase(fetchNearbyDrivers.fulfilled, (state, action) => {
        state.nearbyLoading = false;
        state.nearbyDrivers = action.payload.drivers;
        state.error = null;
      })
      .addCase(fetchNearbyDrivers.rejected, (state, action) => {
        state.nearbyLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setOnlineStatus,
  setCurrentLocation,
  updateRegistrationData,
  setRegistrationStep,
  clearRegistrationData,
  updateNearbyDriver,
  removeNearbyDriver,
  addNearbyDriver,
} = driverSlice.actions;

export default driverSlice.reducer;