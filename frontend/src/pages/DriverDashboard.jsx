import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { 
  MapPinIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline'
import { updateDriverStatus } from '../store/slices/driverSlice'
import { fetchActiveRide } from '../store/slices/rideSlice'
import toast from 'react-hot-toast'

const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(false)
  const [onlineTime, setOnlineTime] = useState(0)
  const dispatch = useDispatch()
  const { profile } = useSelector((state) => state.auth)
  const { activeRide } = useSelector((state) => state.rides)
  const { stats } = useSelector((state) => state.driver)

  // Mock data - in real app, fetch from API
  const todayStats = {
    earnings: 125.50,
    ridesCompleted: 8,
    onlineHours: 6.5
  }

  const availableRides = [
    {
      id: 1,
      pickupAddress: '123 Main St, Downtown',
      dropoffAddress: '456 Oak Ave, Uptown',
      distance: '2.3 km',
      estimatedTime: '8 min',
      fare: 15.75
    },
    {
      id: 2,
      pickupAddress: '789 Pine Rd, Westside',
      dropoffAddress: '321 Elm St, Eastside',
      distance: '4.1 km',
      estimatedTime: '12 min',
      fare: 22.50
    }
  ]

  useEffect(() => {
    dispatch(fetchActiveRide())
  }, [dispatch])

  useEffect(() => {
    let interval
    if (isOnline) {
      interval = setInterval(() => {
        setOnlineTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isOnline])

  const toggleOnlineStatus = async () => {
    try {
      await dispatch(updateDriverStatus({ isOnline: !isOnline }))
      setIsOnline(!isOnline)
      toast.success(isOnline ? 'You are now offline' : 'You are now online')
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const acceptRide = (rideId) => {
    // In real app, dispatch accept ride action
    toast.success('Ride accepted!')
  }

  const declineRide = (rideId) => {
    // In real app, dispatch decline ride action
    toast.info('Ride declined')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Driver Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {profile?.first_name}!
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Status</h2>
            <p className={`font-medium ${isOnline ? 'text-green-600' : 'text-gray-600'}`}>
              You are currently {isOnline ? 'online' : 'offline'}
            </p>
            {isOnline && (
              <p className="text-sm text-gray-500 mt-1">
                Online for {formatTime(onlineTime)}
              </p>
            )}
          </div>
          <button 
            onClick={toggleOnlineStatus}
            className={`btn ${isOnline ? 'bg-red-600 hover:bg-red-700 text-white' : 'btn-primary'}`}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      {/* Current Ride */}
      {activeRide && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Current Ride</h2>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-5 w-5 text-green-600" />
                <span className="font-medium">Pickup:</span>
                <span>{activeRide.pickup_address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-5 w-5 text-red-600" />
                <span className="font-medium">Dropoff:</span>
                <span>{activeRide.dropoff_address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`status-badge status-${activeRide.status.replace('_', '-')}`}>
                  {activeRide.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">
                ${activeRide.fare_total}
              </div>
              <Link
                to={`/rides/${activeRide.id}`}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                View Details →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <CurrencyDollarIcon className="h-8 w-8 text-green-600 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-gray-900">${todayStats.earnings.toFixed(2)}</h3>
          <p className="text-sm text-gray-600">Today's Earnings</p>
        </div>

        <div className="card text-center">
          <MapPinIcon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-gray-900">{todayStats.ridesCompleted}</h3>
          <p className="text-sm text-gray-600">Rides Completed</p>
        </div>

        <div className="card text-center">
          <ClockIcon className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-gray-900">{todayStats.onlineHours}h</h3>
          <p className="text-sm text-gray-600">Online Time</p>
        </div>
      </div>

      {/* Available Rides */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Available Rides
        </h2>
        
        {!isOnline ? (
          <div className="text-center py-8 text-gray-500">
            <MapPinIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>You are currently offline</p>
            <p className="text-sm">Go online to start receiving ride requests</p>
          </div>
        ) : availableRides.length > 0 ? (
          <div className="space-y-4">
            {availableRides.map((ride) => (
              <div key={ride.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPinIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">From:</span>
                      <span className="text-sm text-gray-600">{ride.pickupAddress}</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPinIcon className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">To:</span>
                      <span className="text-sm text-gray-600">{ride.dropoffAddress}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{ride.distance}</span>
                      <span>{ride.estimatedTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">${ride.fare}</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => acceptRide(ride.id)}
                        className="btn btn-primary btn-sm flex items-center space-x-1"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => declineRide(ride.id)}
                        className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 btn-sm flex items-center space-x-1"
                      >
                        <XMarkIcon className="h-4 w-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MapPinIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No rides available</p>
            <p className="text-sm">You'll be notified when new ride requests come in</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/rides" className="card hover:shadow-md transition-shadow text-center">
          <ClockIcon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <span className="text-sm font-medium">Ride History</span>
        </Link>
        <Link to="/earnings" className="card hover:shadow-md transition-shadow text-center">
          <CurrencyDollarIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <span className="text-sm font-medium">Earnings</span>
        </Link>
        <Link to="/profile" className="card hover:shadow-md transition-shadow text-center">
          <MapPinIcon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <span className="text-sm font-medium">Profile</span>
        </Link>
        <Link to="/support" className="card hover:shadow-md transition-shadow text-center">
          <MapPinIcon className="h-6 w-6 text-orange-600 mx-auto mb-2" />
          <span className="text-sm font-medium">Support</span>
        </Link>
      </div>
    </div>
  )
}

export default DriverDashboard