import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../services/supabase'

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      return { user: session.user, profile }
    }
    return null
  }
)

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    return { user: data.user, profile }
  }
)

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, fullName, role = 'rider' }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        }
      }
    })
    if (error) throw error
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: data.user.id,
        full_name: fullName,
        role: role,
        email: email,
      }])
    
    if (profileError) throw profileError
    
    return { user: data.user, profile: { id: data.user.id, full_name: fullName, role } }
  }
)

export const signOut = createAsyncThunk(
  'auth/signOut',
  async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user
          state.profile = action.payload.profile
          state.isAuthenticated = true
        }
        state.isLoading = false
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false
      })
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.profile = action.payload.profile
        state.isAuthenticated = true
        state.isLoading = false
      })
      .addCase(signIn.rejected, (state, action) => {
        state.error = action.error.message
        state.isLoading = false
      })
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.profile = action.payload.profile
        state.isAuthenticated = true
        state.isLoading = false
      })
      .addCase(signUp.rejected, (state, action) => {
        state.error = action.error.message
        state.isLoading = false
      })
      // Sign Out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null
        state.profile = null
        state.isAuthenticated = false
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer