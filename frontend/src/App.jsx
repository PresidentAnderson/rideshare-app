import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { initializeAuth } from './store/slices/authSlice'
import { supabase } from './services/supabase'

// Components
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorBoundary from './components/ErrorBoundary'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import RideRequest from './pages/RideRequest'
import RideHistory from './pages/RideHistory'
import DriverDashboard from './pages/DriverDashboard'
import DriverRegistration from './pages/DriverRegistration'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, isLoading, user, profile } = useSelector((state) => state.auth)

  useEffect(() => {
    // Initialize authentication state
    dispatch(initializeAuth())

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        dispatch(initializeAuth())
      } else if (event === 'SIGNED_OUT') {
        // Handle sign out
      }
    })

    return () => subscription.unsubscribe()
  }, [dispatch])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {isAuthenticated && <Navbar />}
          
          <main className={isAuthenticated ? 'pt-16' : ''}>
            <Routes>
              {/* Public routes */}
              <Route 
                path="/" 
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />} 
              />
              <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
              />
              <Route 
                path="/register" 
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
              />

              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    {profile?.role === 'driver' ? <DriverDashboard /> : <Dashboard />}
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/request-ride" 
                element={
                  <ProtectedRoute role="rider">
                    <RideRequest />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/rides" 
                element={
                  <ProtectedRoute>
                    <RideHistory />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/driver/register" 
                element={
                  <ProtectedRoute>
                    <DriverRegistration />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App