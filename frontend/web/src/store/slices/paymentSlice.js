import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentAPI } from '../../services/api';

// Async thunks
export const createPaymentIntent = createAsyncThunk(
  'payment/createIntent',
  async ({ rideId, paymentMethod, tip }, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.createPaymentIntent({ rideId, paymentMethod, tip });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment intent');
    }
  }
);

export const confirmPayment = createAsyncThunk(
  'payment/confirm',
  async ({ paymentId, paymentIntentId }, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.confirmPayment(paymentId, { paymentIntentId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment confirmation failed');
    }
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  'payment/fetchHistory',
  async ({ page = 1, limit = 10, status }, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getPaymentHistory({ page, limit, status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment history');
    }
  }
);

const initialState = {
  currentPayment: null,
  paymentHistory: [],
  clientSecret: null,
  loading: false,
  historyLoading: false,
  processing: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  paymentForm: {
    rideId: null,
    paymentMethod: 'credit_card',
    tip: 0,
    customTip: false,
  },
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
      state.clientSecret = null;
    },
    setPaymentForm: (state, action) => {
      state.paymentForm = { ...state.paymentForm, ...action.payload };
    },
    clearPaymentForm: (state) => {
      state.paymentForm = {
        rideId: null,
        paymentMethod: 'credit_card',
        tip: 0,
        customTip: false,
      };
    },
    setProcessing: (state, action) => {
      state.processing = action.payload;
    },
    addPaymentToHistory: (state, action) => {
      state.paymentHistory.unshift(action.payload);
    },
    updatePaymentStatus: (state, action) => {
      const { paymentId, status } = action.payload;
      
      // Update current payment
      if (state.currentPayment && state.currentPayment.id === paymentId) {
        state.currentPayment.status = status;
      }
      
      // Update payment in history
      const paymentIndex = state.paymentHistory.findIndex(p => p.id === paymentId);
      if (paymentIndex !== -1) {
        state.paymentHistory[paymentIndex].status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create payment intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload.payment;
        state.clientSecret = action.payload.clientSecret;
        state.error = null;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Confirm payment
      .addCase(confirmPayment.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.processing = false;
        state.currentPayment = action.payload.payment;
        state.error = null;
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
      })
      
      // Fetch payment history
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.paymentHistory = action.payload.payments;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentPayment,
  setPaymentForm,
  clearPaymentForm,
  setProcessing,
  addPaymentToHistory,
  updatePaymentStatus,
} = paymentSlice.actions;

export default paymentSlice.reducer;