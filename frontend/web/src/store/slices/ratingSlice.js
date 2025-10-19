import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ratingAPI } from '../../services/api';

// Async thunks
export const createRating = createAsyncThunk(
  'rating/create',
  async (ratingData, { rejectWithValue }) => {
    try {
      const response = await ratingAPI.createRating(ratingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit rating');
    }
  }
);

export const fetchUserRatings = createAsyncThunk(
  'rating/fetchUserRatings',
  async ({ userId, page = 1, limit = 10, type }, { rejectWithValue }) => {
    try {
      const response = await ratingAPI.getUserRatings(userId, { page, limit, type });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ratings');
    }
  }
);

export const fetchRideRatings = createAsyncThunk(
  'rating/fetchRideRatings',
  async (rideId, { rejectWithValue }) => {
    try {
      const response = await ratingAPI.getRideRatings(rideId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ride ratings');
    }
  }
);

export const updateRating = createAsyncThunk(
  'rating/update',
  async ({ ratingId, ratingData }, { rejectWithValue }) => {
    try {
      const response = await ratingAPI.updateRating(ratingId, ratingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update rating');
    }
  }
);

export const deleteRating = createAsyncThunk(
  'rating/delete',
  async (ratingId, { rejectWithValue }) => {
    try {
      await ratingAPI.deleteRating(ratingId);
      return ratingId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete rating');
    }
  }
);

const initialState = {
  userRatings: [],
  rideRatings: [],
  currentRating: null,
  stats: null,
  loading: false,
  submitting: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  ratingForm: {
    rideId: null,
    rating: 5,
    comment: '',
    categories: {},
  },
  showRatingModal: false,
  ratingTarget: null, // 'driver' or 'rider'
};

const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRatingForm: (state, action) => {
      state.ratingForm = { ...state.ratingForm, ...action.payload };
    },
    clearRatingForm: (state) => {
      state.ratingForm = {
        rideId: null,
        rating: 5,
        comment: '',
        categories: {},
      };
    },
    setShowRatingModal: (state, action) => {
      state.showRatingModal = action.payload;
    },
    setRatingTarget: (state, action) => {
      state.ratingTarget = action.payload;
    },
    addRatingToList: (state, action) => {
      state.userRatings.unshift(action.payload);
    },
    updateRatingInList: (state, action) => {
      const index = state.userRatings.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.userRatings[index] = action.payload;
      }
    },
    removeRatingFromList: (state, action) => {
      state.userRatings = state.userRatings.filter(r => r.id !== action.payload);
    },
    setCurrentRating: (state, action) => {
      state.currentRating = action.payload;
    },
    clearCurrentRating: (state) => {
      state.currentRating = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create rating
      .addCase(createRating.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createRating.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentRating = action.payload.rating;
        state.showRatingModal = false;
        state.error = null;
      })
      .addCase(createRating.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // Fetch user ratings
      .addCase(fetchUserRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.userRatings = action.payload.ratings;
        state.stats = action.payload.stats;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchUserRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch ride ratings
      .addCase(fetchRideRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRideRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.rideRatings = action.payload.ratings;
        state.error = null;
      })
      .addCase(fetchRideRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update rating
      .addCase(updateRating.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateRating.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentRating = action.payload.rating;
        
        // Update in list
        const index = state.userRatings.findIndex(r => r.id === action.payload.rating.id);
        if (index !== -1) {
          state.userRatings[index] = action.payload.rating;
        }
        
        state.error = null;
      })
      .addCase(updateRating.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      
      // Delete rating
      .addCase(deleteRating.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRating.fulfilled, (state, action) => {
        state.loading = false;
        state.userRatings = state.userRatings.filter(r => r.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setRatingForm,
  clearRatingForm,
  setShowRatingModal,
  setRatingTarget,
  addRatingToList,
  updateRatingInList,
  removeRatingFromList,
  setCurrentRating,
  clearCurrentRating,
} = ratingSlice.actions;

export default ratingSlice.reducer;