import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAppSelector } from '../../hooks/redux';

import RiderDashboard from './RiderDashboard';
import DriverDashboard from './DriverDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Redirect based on user role
    if (user?.role === 'rider') {
      navigate('/rider', { replace: true });
    } else if (user?.role === 'driver') {
      navigate('/driver', { replace: true });
    }
  }, [user, navigate]);

  const renderDashboard = () => {
    switch (user?.role) {
      case 'rider':
        return <RiderDashboard />;
      case 'driver':
        return <DriverDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <RiderDashboard />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - RideShare</title>
        <meta name="description" content="Your RideShare dashboard" />
      </Helmet>

      {renderDashboard()}
    </>
  );
};

export default DashboardPage;