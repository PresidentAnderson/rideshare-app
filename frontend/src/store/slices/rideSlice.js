import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../services/supabase'

export const requestRide = createAsyncThunk(
  'rides/request',
  async ({ pickupLocation, dropoffLocation, fare }) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('rides')
      .insert([{
        rider_id: user.id,
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        fare: fare,
        status: 'pending',
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
)

export const fetchActiveRide = createAsyncThunk(
  'rides/fetchActive',
  async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        driver:driver_id(
          id,
          full_name,
          phone,
          vehicle_model,
          vehicle_plate
        ),
        rider:rider_id(
          id,
          full_name,
          phone
        )
      `)
      .or(`rider_id.eq.${user.id},driver_id.eq.${user.id}`)
      .in('status', ['pending', 'accepted', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }
)

export const fetchRideHistory = createAsyncThunk(
  'rides/fetchHistory',
  async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        driver:driver_id(
          id,
          full_name,
          vehicle_model
        ),
        rider:rider_id(
          id,
          full_name
        )
      `)
      .or(`rider_id.eq.${user.id},driver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
)

export const cancelRide = createAsyncThunk(
  'rides/cancel',
  async (rideId) => {
    const { data, error } = await supabase
      .from('rides')
      .update({ status: 'cancelled' })
      .eq('id', rideId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
)

const rideSlice = createSlice({
  name: 'rides',
  initialState: {
    activeRide: null,
    rideHistory: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    updateRideStatus: (state, action) => {
      if (state.activeRide && state.activeRide.id === action.payload.id) {
        state.activeRide.status = action.payload.status
      }
    },
    clearActiveRide: (state) => {
      state.activeRide = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Request Ride
      .addCase(requestRide.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(requestRide.fulfilled, (state, action) => {
        state.activeRide = action.payload
        state.isLoading = false
      })
      .addCase(requestRide.rejected, (state, action) => {
        state.error = action.error.message
        state.isLoading = false
      })
      // Fetch Active Ride
      .addCase(fetchActiveRide.fulfilled, (state, action) => {
        state.activeRide = action.payload
      })
      // Fetch Ride History
      .addCase(fetchRideHistory.fulfilled, (state, action) => {
        state.rideHistory = action.payload
      })
      // Cancel Ride
      .addCase(cancelRide.fulfilled, (state) => {
        state.activeRide = null
      })
  },
})

export const { updateRideStatus, clearActiveRide } = rideSlice.actions
export default rideSlice.reducer