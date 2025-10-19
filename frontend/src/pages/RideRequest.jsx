import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { MapPinIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline'
import { requestRide } from '../store/slices/rideSlice'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const RideRequest = () => {
  const [estimatedFare, setEstimatedFare] = useState(null)
  const [estimatedTime, setEstimatedTime] = useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector((state) => state.rides)
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const pickupLocation = watch('pickupLocation')
  const dropoffLocation = watch('dropoffLocation')

  // Calculate estimated fare and time when both locations are entered
  useEffect(() => {
    if (pickupLocation && dropoffLocation && pickupLocation.length > 3 && dropoffLocation.length > 3) {
      // Mock estimation - in real app, this would call a mapping API
      const distance = Math.random() * 20 + 2 // 2-22 km
      setEstimatedFare((distance * 2.5 + 5).toFixed(2))
      setEstimatedTime(Math.round(distance * 2 + 5)) // minutes
    } else {
      setEstimatedFare(null)
      setEstimatedTime(null)
    }
  }, [pickupLocation, dropoffLocation])

  const onSubmit = async (data) => {
    try {
      const rideData = {
        pickupLocation: {
          address: data.pickupLocation,
          coordinates: [0, 0] // In real app, geocode the address
        },
        dropoffLocation: {
          address: data.dropoffLocation,
          coordinates: [0, 0] // In real app, geocode the address
        },
        fare: parseFloat(estimatedFare),
        notes: data.notes || ''
      }

      const result = await dispatch(requestRide(rideData))
      if (result.type === 'rides/request/fulfilled') {
        toast.success('Ride requested successfully!')
        navigate('/dashboard')
      } else {
        toast.error(result.payload || 'Failed to request ride')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Request a Ride</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Location *
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-green-500" />
              <input
                {...register('pickupLocation', {
                  required: 'Pickup location is required',
                  minLength: {
                    value: 3,
                    message: 'Please enter a valid pickup location'
                  }
                })}
                type="text"
                className={`input pl-10 ${errors.pickupLocation ? 'border-red-500' : ''}`}
                placeholder="Enter pickup location"
              />
            </div>
            {errors.pickupLocation && (
              <p className="mt-1 text-sm text-red-600">{errors.pickupLocation.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination *
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-red-500" />
              <input
                {...register('dropoffLocation', {
                  required: 'Destination is required',
                  minLength: {
                    value: 3,
                    message: 'Please enter a valid destination'
                  }
                })}
                type="text"
                className={`input pl-10 ${errors.dropoffLocation ? 'border-red-500' : ''}`}
                placeholder="Enter destination"
              />
            </div>
            {errors.dropoffLocation && (
              <p className="mt-1 text-sm text-red-600">{errors.dropoffLocation.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              {...register('notes')}
              className="input"
              rows={3}
              placeholder="Any special instructions for the driver..."
            />
          </div>

          {/* Ride Estimate */}
          {estimatedFare && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Ride Estimate</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Estimated Fare</p>
                    <p className="font-semibold text-gray-900">${estimatedFare}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Estimated Time</p>
                    <p className="font-semibold text-gray-900">{estimatedTime} min</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || !estimatedFare}
              className="btn btn-primary w-full flex justify-center py-3 text-base"
            >
              {isLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                'Request Ride'
              )}
            </button>
            {!estimatedFare && pickupLocation && dropoffLocation && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Please enter valid pickup and destination locations
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default RideRequest