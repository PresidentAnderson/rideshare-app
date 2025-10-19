import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../services/supabase'

export const registerDriver = createAsyncThunk(
  'driver/register',
  async (driverData) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('drivers')
      .insert([{
        id: user.id,
        ...driverData,
        verified: false
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
)

export const updateDriverStatus = createAsyncThunk(
  'driver/updateStatus',
  async (status) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('drivers')
      .update({ status: status })
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
)

export const acceptRide = createAsyncThunk(
  'driver/acceptRide',
  async (rideId) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('rides')
      .update({ 
        driver_id: user.id,
        status: 'accepted'
      })
      .eq('id', rideId)
      .eq('status', 'pending')
      .select()
      .single()
    
    if (error) throw error
    return data
  }
)

export const fetchAvailableRides = createAsyncThunk(
  'driver/fetchAvailableRides',
  async () => {
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        rider:rider_id(
          id,
          full_name,
          phone
        )
      `)
      .eq('status', 'pending')
      .is('driver_id', null)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
)

export const startRide = createAsyncThunk(
  'driver/startRide',
  async (rideId) => {
    const { data, error } = await supabase
      .from('rides')
      .update({ 
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .eq('id', rideId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
)

export const completeRide = createAsyncThunk(
  'driver/completeRide',
  async (rideId) => {
    const { data, error } = await supabase
      .from('rides')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', rideId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
)

const driverSlice = createSlice({
  name: 'driver',
  initialState: {
    status: 'offline',
    availableRides: [],
    currentRide: null,
    earnings: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    setDriverStatus: (state, action) => {
      state.status = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Driver Status
      .addCase(updateDriverStatus.fulfilled, (state, action) => {
        state.status = action.payload.status
      })
      // Accept Ride
      .addCase(acceptRide.pending, (state) => {
        state.isLoading = true
      })
      .addCase(acceptRide.fulfilled, (state, action) => {
        state.currentRide = action.payload
        state.availableRides = state.availableRides.filter(
          ride => ride.id !== action.payload.id
        )
        state.isLoading = false
      })
      .addCase(acceptRide.rejected, (state, action) => {
        state.error = action.error.message
        state.isLoading = false
      })
      // Fetch Available Rides
      .addCase(fetchAvailableRides.fulfilled, (state, action) => {
        state.availableRides = action.payload
      })
      // Start Ride
      .addCase(startRide.fulfilled, (state, action) => {
        state.currentRide = action.payload
      })
      // Complete Ride
      .addCase(completeRide.fulfilled, (state, action) => {
        state.currentRide = null
        state.earnings += action.payload.fare
      })
  },
})

export const { setDriverStatus } = driverSlice.actions
export default driverSlice.reducer