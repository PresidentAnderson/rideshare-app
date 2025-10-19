import { MapPinIcon, TruckIcon } from '@heroicons/react/24/outline'

const MapPlaceholder = ({ 
  pickup = null, 
  destination = null, 
  driver = null,
  height = "h-64",
  showRoute = false 
}) => {
  return (
    <div className={`${height} bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-dashed border-blue-200 flex flex-col items-center justify-center relative overflow-hidden`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-4 p-6">
        <div className="flex items-center justify-center space-x-6">
          {pickup && (
            <div className="flex flex-col items-center">
              <div className="bg-green-500 rounded-full p-2 mb-2">
                <MapPinIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-700">Pickup</div>
              <div className="text-xs text-gray-600 text-center max-w-20 truncate">
                {pickup}
              </div>
            </div>
          )}

          {showRoute && pickup && destination && (
            <div className="flex-1 h-px bg-blue-300 relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-full w-2 h-2"></div>
            </div>
          )}

          {driver && (
            <div className="flex flex-col items-center">
              <div className="bg-blue-500 rounded-full p-2 mb-2 animate-pulse">
                <TruckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-700">Driver</div>
              <div className="text-xs text-gray-600 text-center max-w-20 truncate">
                {driver}
              </div>
            </div>
          )}

          {destination && (
            <div className="flex flex-col items-center">
              <div className="bg-red-500 rounded-full p-2 mb-2">
                <MapPinIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-700">Destination</div>
              <div className="text-xs text-gray-600 text-center max-w-20 truncate">
                {destination}
              </div>
            </div>
          )}
        </div>

        {!pickup && !destination && !driver && (
          <div className="text-center">
            <MapPinIcon className="h-12 w-12 text-blue-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Map View</h3>
            <p className="text-sm text-gray-500">Interactive map will be displayed here</p>
          </div>
        )}
      </div>

      {/* Floating indicators */}
      {showRoute && (
        <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow-sm border text-xs font-medium text-gray-600">
          Live tracking
        </div>
      )}
    </div>
  )
}

export default MapPlaceholder