import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import {
  HomeIcon,
  UserIcon,
  CarIcon,
  ClockIcon,
  CreditCardIcon,
  StarIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setSidebarOpen } from '../../store/slices/uiSlice';

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Ride History', href: '/rides', icon: ClockIcon },
    { name: 'Payments', href: '/payments', icon: CreditCardIcon },
  ];

  // Add role-specific navigation items
  if (user?.role === 'rider') {
    navigation.splice(2, 0, { name: 'Request Ride', href: '/rider', icon: CarIcon });
  } else if (user?.role === 'driver') {
    navigation.splice(2, 0, { name: 'Driver Mode', href: '/driver', icon: CarIcon });
  }

  const isActive = (href) => location.pathname === href;

  return (
    <>
      {/* Desktop sidebar */}
      <div className={classNames(
        'fixed inset-y-0 left-0 z-40 bg-white shadow-lg transition-all duration-300 transform',
        sidebarOpen ? 'w-64' : 'w-20',
        'hidden lg:block'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-4 py-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <CarIcon className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <span className="text-xl font-bold text-gray-900">RideShare</span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="ml-3">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-gray-600" />
              </div>
              {sidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={classNames(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:hidden'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <CarIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">RideShare</span>
            </div>
            <button
              onClick={() => dispatch(setSidebarOpen(false))}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => dispatch(setSidebarOpen(false))}
                  className={classNames(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="ml-3">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;