import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';

import { store } from './store';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { loadUser } from './store/slices/authSlice';
import websocketService from './services/websocket';

// Import components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Import pages
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import RiderDashboard from './pages/Dashboard/RiderDashboard';
import DriverDashboard from './pages/Dashboard/DriverDashboard';
import ProfilePage from './pages/Profile/ProfilePage';
import RideHistoryPage from './pages/Rides/RideHistoryPage';
import PaymentHistoryPage from './pages/Payments/PaymentHistoryPage';
import DriverRegistrationPage from './pages/Driver/DriverRegistrationPage';
import NotFoundPage from './pages/Error/NotFoundPage';

// Import styles
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

function AppContent() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Load user on app start
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    // Initialize WebSocket connection when authenticated
    if (isAuthenticated && user) {
      websocketService.connect();
    } else {
      websocketService.disconnect();
    }

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />} 
        />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/rider" element={<RiderDashboard />} />
            <Route path="/driver" element={<DriverDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/rides" element={<RideHistoryPage />} />
            <Route path="/payments" element={<PaymentHistoryPage />} />
            <Route path="/driver/register" element={<DriverRegistrationPage />} />
          </Route>
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="toast-container"
      />
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <AppContent />
      </HelmetProvider>
    </Provider>
  );
}

export default App;