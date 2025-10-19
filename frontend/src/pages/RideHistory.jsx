import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { 
  ClockIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  StarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { fetchRideHistory } from '../store/slices/rideSlice'
import LoadingSpinner from '../components/LoadingSpinner'

const RideHistory = () => {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const dispatch = useDispatch()
  const { rideHistory, isLoading } = useSelector((state) => state.rides)
  const { profile } = useSelector((state) => state.auth)

  // Mock data - in real app, this would come from fetchRideHistory
  const mockRides = [
    {
      id: 1,
      pickup_address: '123 Main St, Downtown',
      dropoff_address: '456 Oak Ave, Uptown',
      status: 'completed',
      fare_total: 15.75,
      created_at: '2023-12-15T10:30:00Z',
      completed_at: '2023-12-15T10:45:00Z',
      driver: {
        id: 2,
        full_name: 'John Driver',
        vehicle_model: 'Toyota Camry'
      },
      rating: 5,
      distance: '2.3 km',
      duration: '15 min'
    },
    {
      id: 2,
      pickup_address: '789 Pine Rd, Westside',
      dropoff_address: '321 Elm St, Eastside',
      status: 'completed',
      fare_total: 22.50,
      created_at: '2023-12-14T16:20:00Z',
      completed_at: '2023-12-14T16:38:00Z',
      driver: {
        id: 3,
        full_name: 'Jane Smith',
        vehicle_model: 'Honda Civic'
      },
      rating: 4,
      distance: '4.1 km',
      duration: '18 min'
    },
    {
      id: 3,
      pickup_address: '555 Broadway, Center',
      dropoff_address: '777 Market St, Financial',
      status: 'cancelled',
      fare_total: 0,
      created_at: '2023-12-13T14:15:00Z',
      cancelled_at: '2023-12-13T14:20:00Z',
      distance: '1.8 km',
      duration: null
    }
  ]

  useEffect(() => {
    dispatch(fetchRideHistory())
  }, [dispatch])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatStatus = (status) => {
    const statusMap = {
      completed: 'Completed',
      cancelled: 'Cancelled',
      pending: 'Pending',
      in_progress: 'In Progress'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status) => {
    const colorMap = {
      completed: 'text-green-600 bg-green-50 border-green-200',
      cancelled: 'text-red-600 bg-red-50 border-red-200',
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      in_progress: 'text-blue-600 bg-blue-50 border-blue-200'
    }
    return colorMap[status] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const filteredRides = mockRides.filter(ride => {
    if (filter === 'all') return true
    return ride.status === filter
  })

  const sortedRides = [...filteredRides].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at) - new Date(a.created_at)
    } else if (sortBy === 'fare') {
      return b.fare_total - a.fare_total
    }
    return 0
  })

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ride History</h1>
        
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input py-2 px-3 text-sm"
            >
              <option value="all">All Rides</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input py-2 px-3 text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="fare">Sort by Fare</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {mockRides.filter(r => r.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">Total Rides</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            ${mockRides.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.fare_total, 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Total Spent</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {(mockRides.filter(r => r.rating).reduce((sum, r) => sum + r.rating, 0) / 
             mockRides.filter(r => r.rating).length || 0).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>
      </div>

      {/* Rides List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {sortedRides.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ClockIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rides found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "Your ride history will appear here once you take your first ride."
                : `No ${filter} rides found. Try changing the filter.`
              }
            </p>
            {filter === 'all' && (
              <Link
                to="/request-ride"
                className="btn btn-primary mt-4"
              >
                Request Your First Ride
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedRides.map((ride) => (
              <div key={ride.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(ride.status)}`}>
                        {formatStatus(ride.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(ride.created_at)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-medium">From:</span>
                        <span className="text-sm text-gray-600">{ride.pickup_address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <span className="text-sm font-medium">To:</span>
                        <span className="text-sm text-gray-600">{ride.dropoff_address}</span>
                      </div>
                    </div>

                    {ride.driver && (
                      <div className="text-sm text-gray-600 mb-2">
                        Driver: {ride.driver.full_name} • {ride.driver.vehicle_model}
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {ride.distance && <span>{ride.distance}</span>}
                      {ride.duration && <span>{ride.duration}</span>}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 mb-2">
                      {ride.status === 'cancelled' ? 'Cancelled' : `$${ride.fare_total.toFixed(2)}`}
                    </div>
                    
                    {ride.rating && ride.status === 'completed' && (
                      <div className="flex items-center space-x-1 justify-end mb-2">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < ride.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    
                    <Link
                      to={`/rides/${ride.id}`}
                      className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RideHistory