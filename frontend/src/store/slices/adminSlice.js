import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../services/supabase'

export const fetchPendingDrivers = createAsyncThunk(
  'admin/fetchPendingDrivers',
  async () => {
    const { data, error } = await supabase
      .from('drivers')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('verified', false)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
)

export const approveDriver = createAsyncThunk(
  'admin/approveDriver',
  async (driverId) => {
    const { data, error } = await supabase
      .from('drivers')
      .update({ 
        verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', driverId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
)

export const rejectDriver = createAsyncThunk(
  'admin/rejectDriver',
  async ({ driverId, reason }) => {
    const { data, error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', driverId)
    
    if (error) throw error
    return driverId
  }
)

export const fetchPlatformStats = createAsyncThunk(
  'admin/fetchPlatformStats',
  async () => {
    // Fetch various platform statistics
    const [usersResult, ridesResult, driversResult] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact' }),
      supabase.from('rides').select('*', { count: 'exact' }),
      supabase.from('drivers').select('*', { count: 'exact' })
    ])
    
    return {
      totalUsers: usersResult.count || 0,
      totalRides: ridesResult.count || 0,
      totalDrivers: driversResult.count || 0
    }
  }
)

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    pendingDrivers: [],
    stats: {
      totalUsers: 0,
      totalRides: 0,
      totalDrivers: 0,
      activeRides: 0
    },
    alerts: [],
    isLoading: false,
    error: null
  },
  reducers: {
    addAlert: (state, action) => {
      state.alerts.push({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString()
      })
    },
    dismissAlert: (state, action) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Pending Drivers
      .addCase(fetchPendingDrivers.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchPendingDrivers.fulfilled, (state, action) => {
        state.pendingDrivers = action.payload
        state.isLoading = false
      })
      .addCase(fetchPendingDrivers.rejected, (state, action) => {
        state.error = action.error.message
        state.isLoading = false
      })
      // Approve Driver
      .addCase(approveDriver.fulfilled, (state, action) => {
        state.pendingDrivers = state.pendingDrivers.filter(
          driver => driver.id !== action.payload.id
        )
      })
      // Reject Driver
      .addCase(rejectDriver.fulfilled, (state, action) => {
        state.pendingDrivers = state.pendingDrivers.filter(
          driver => driver.id !== action.payload
        )
      })
      // Fetch Platform Stats
      .addCase(fetchPlatformStats.fulfilled, (state, action) => {
        state.stats = { ...state.stats, ...action.payload }
      })
  }
})

export const { addAlert, dismissAlert } = adminSlice.actions
export default adminSlice.reducer