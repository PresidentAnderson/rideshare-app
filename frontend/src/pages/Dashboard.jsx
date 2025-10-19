import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { 
  MapPinIcon, 
  ClockIcon, 
  CreditCardIcon,
  UserIcon,
  PlusIcon,
  TruckIcon,
  StarIcon 
} from '@heroicons/react/24/outline'
import StatusBadge from '../components/StatusBadge'
import MapPlaceholder from '../components/MapPlaceholder'

const Dashboard = () => {
  const { profile } = useSelector((state) => state.auth)
  const { currentRide } = useSelector((state) => state.ride)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.first_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Ready for your next journey?
        </p>
      </div>

      {/* Current Ride Section */}
      {currentRide ? (
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900">Current Ride</h2>
            <StatusBadge status={currentRide.status} type="ride" />
          </div>
          <div className="card-body">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <MapPinIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Pickup</p>
                    <p className="text-gray-600">{currentRide.pickup_address}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <MapPinIcon className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Destination</p>
                    <p className="text-gray-600">{currentRide.dropoff_address}</p>
                  </div>
                </div>
                {currentRide.driver && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <TruckIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Driver</p>
                      <p className="text-gray-600">{currentRide.driver.name}</p>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{currentRide.driver.rating}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between pt-4">
                  <div className="text-2xl font-bold text-gray-900">
                    ${currentRide.fare_total}
                  </div>
                  <Link
                    to={`/rides/${currentRide.id}`}
                    className="btn btn-primary"
                  >
                    Track Ride
                  </Link>
                </div>
              </div>
              <div>
                <MapPlaceholder 
                  pickup={currentRide.pickup_address}
                  destination={currentRide.dropoff_address}
                  driver={currentRide.driver?.name}
                  showRoute={true}
                  height="h-48"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 mb-8">
          <div className="text-center">
            <MapPinIcon className="mx-auto h-12 w-12 text-primary-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No active rides
            </h2>
            <p className="text-gray-600 mb-4">
              Ready to go somewhere? Request a ride now!
            </p>
            <Link
              to="/request-ride"
              className="btn btn-primary inline-flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Request a Ride</span>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/request-ride"
            className="card hover:shadow-md transition-all duration-200 group text-center p-6"
          >
            <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
              <MapPinIcon className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Request Ride</h3>
            <p className="text-sm text-gray-600">Book a new ride to your destination</p>
          </Link>

          <Link
            to="/rides"
            className="card hover:shadow-md transition-all duration-200 group text-center p-6"
          >
            <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
              <ClockIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Ride History</h3>
            <p className="text-sm text-gray-600">View and manage past rides</p>
          </Link>

          <Link
            to="/payment-methods"
            className="card hover:shadow-md transition-all duration-200 group text-center p-6"
          >
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Payment</h3>
            <p className="text-sm text-gray-600">Manage payment methods</p>
          </Link>

          <Link
            to="/profile"
            className="card hover:shadow-md transition-all duration-200 group text-center p-6"
          >
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
              <UserIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Profile</h3>
            <p className="text-sm text-gray-600">Edit your profile settings</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <ClockIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No recent activity</p>
          <Link
            to="/request-ride"
            className="text-primary-600 hover:text-primary-500 font-medium"
          >
            Take your first ride
          </Link>
        </div>
      </div>

      {/* Driver Registration CTA */}
      {profile?.role === 'rider' && (
        <div className="mt-8 bg-gray-900 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Want to earn money driving?
          </h2>
          <p className="text-gray-300 mb-4">
            Join our driver network and start earning on your own schedule.
          </p>
          <Link
            to="/driver/register"
            className="btn bg-white text-gray-900 hover:bg-gray-100"
          >
            Become a Driver
          </Link>
        </div>
      )}
    </div>
  )
}

export default Dashboard