import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { 
  CogIcon,
  UsersIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { fetchPlatformStats, approveDriver, rejectDriver } from '../store/slices/adminSlice'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('week')
  const dispatch = useDispatch()
  const { stats, isLoading } = useSelector((state) => state.admin)

  // Mock data - in real app, fetch from API
  const mockStats = {
    totalUsers: 15847,
    totalDrivers: 3291,
    activeRides: 127,
    totalRevenue: 284950.75,
    dailyStats: [
      { date: '2023-12-09', rides: 245, revenue: 5890.25 },
      { date: '2023-12-10', rides: 298, revenue: 7156.50 },
      { date: '2023-12-11', rides: 312, revenue: 7488.75 },
      { date: '2023-12-12', rides: 289, revenue: 6934.25 },
      { date: '2023-12-13', rides: 334, revenue: 8016.00 },
      { date: '2023-12-14', rides: 401, revenue: 9624.25 },
      { date: '2023-12-15', rides: 378, revenue: 9072.00 }
    ]
  }

  const pendingDrivers = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      applicationDate: '2023-12-14',
      vehicle: '2022 Toyota Camry',
      documents: {
        license: 'uploaded',
        insurance: 'uploaded',
        registration: 'uploaded',
        background: 'pending'
      }
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      applicationDate: '2023-12-13',
      vehicle: '2021 Honda Civic',
      documents: {
        license: 'uploaded',
        insurance: 'uploaded',
        registration: 'uploaded',
        background: 'uploaded'
      }
    }
  ]

  const recentAlerts = [
    {
      id: 1,
      type: 'safety',
      message: 'Driver complaint: Reckless driving reported for Driver #2847',
      timestamp: '2023-12-15T14:30:00Z',
      severity: 'high'
    },
    {
      id: 2,
      type: 'fraud',
      message: 'Suspicious payment activity detected for User #15432',
      timestamp: '2023-12-15T13:15:00Z',
      severity: 'medium'
    },
    {
      id: 3,
      type: 'system',
      message: 'Payment gateway experiencing intermittent issues',
      timestamp: '2023-12-15T12:45:00Z',
      severity: 'low'
    }
  ]

  useEffect(() => {
    dispatch(fetchPlatformStats())
  }, [dispatch, timeRange])

  const handleVerifyDriver = async (driverId, approved) => {
    try {
      if (approved) {
        await dispatch(approveDriver(driverId))
        toast.success('Driver approved successfully')
      } else {
        await dispatch(rejectDriver({ driverId, reason: 'Application rejected by admin' }))
        toast.success('Driver application rejected')
      }
    } catch (error) {
      toast.error('Failed to process driver verification')
    }
  }

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-blue-600 bg-blue-50 border-blue-200'
    }
    return colors[severity] || colors.low
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input py-2 px-3 text-sm"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'drivers', name: 'Driver Verification', icon: TruckIcon },
            { id: 'alerts', name: 'Alerts', icon: ExclamationTriangleIcon },
            { id: 'users', name: 'User Management', icon: UsersIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{mockStats.totalUsers.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TruckIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Drivers</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{mockStats.totalDrivers.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Rides</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{mockStats.activeRides}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{formatCurrency(mockStats.totalRevenue)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {mockStats.dailyStats.slice(-3).map((day) => (
                <div key={day.date} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatDate(day.date)}</p>
                    <p className="text-sm text-gray-500">{day.rides} rides completed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(day.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Driver Verification Tab */}
      {activeTab === 'drivers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Pending Driver Applications</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {pendingDrivers.map((driver) => (
                <div key={driver.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{driver.name}</h4>
                          <p className="text-sm text-gray-500">{driver.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Application Date</p>
                          <p className="text-sm text-gray-500">{formatDate(driver.applicationDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Vehicle</p>
                          <p className="text-sm text-gray-500">{driver.vehicle}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Documents</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(driver.documents).map(([docType, status]) => (
                            <span
                              key={docType}
                              className={`px-2 py-1 text-xs rounded-full border capitalize ${
                                status === 'uploaded' 
                                  ? 'text-green-600 bg-green-50 border-green-200'
                                  : 'text-yellow-600 bg-yellow-50 border-yellow-200'
                              }`}
                            >
                              {docType}: {status}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => {/* View details */}}
                        className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 btn-sm flex items-center space-x-1"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleVerifyDriver(driver.id, true)}
                        className="btn btn-primary btn-sm flex items-center space-x-1"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleVerifyDriver(driver.id, false)}
                        className="btn bg-red-600 text-white hover:bg-red-700 btn-sm flex items-center space-x-1"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="p-6">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className={`h-5 w-5 mt-0.5 ${
                      alert.severity === 'high' ? 'text-red-600' :
                      alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 text-xs rounded-full border capitalize ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-sm text-gray-500">{formatDate(alert.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-900">{alert.message}</p>
                    </div>
                    <button className="text-sm text-primary-600 hover:text-primary-500">
                      Investigate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Management</h3>
            <p className="text-gray-600">User management features will be implemented here.</p>
            <div className="mt-4 space-x-3">
              <Link to="/admin/users" className="btn btn-primary">
                Manage Users
              </Link>
              <Link to="/admin/reports" className="btn bg-gray-200 text-gray-700 hover:bg-gray-300">
                Generate Reports
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard