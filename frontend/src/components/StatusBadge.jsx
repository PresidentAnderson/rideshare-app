import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

const StatusBadge = ({ status, type = 'ride', size = 'md' }) => {
  const getStatusConfig = (status, type) => {
    const configs = {
      ride: {
        pending: {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: ClockIcon,
          label: 'Pending'
        },
        confirmed: {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: CheckCircleIcon,
          label: 'Confirmed'
        },
        'in-progress': {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: PlayIcon,
          label: 'In Progress'
        },
        'driver-assigned': {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: TruckIcon,
          label: 'Driver Assigned'
        },
        completed: {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircleIcon,
          label: 'Completed'
        },
        cancelled: {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircleIcon,
          label: 'Cancelled'
        },
        'driver-cancelled': {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircleIcon,
          label: 'Driver Cancelled'
        }
      },
      driver: {
        available: {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircleIcon,
          label: 'Available'
        },
        busy: {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: ClockIcon,
          label: 'Busy'
        },
        offline: {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: XCircleIcon,
          label: 'Offline'
        },
        'on-ride': {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: TruckIcon,
          label: 'On Ride'
        }
      },
      verification: {
        pending: {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: ClockIcon,
          label: 'Pending'
        },
        verified: {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircleIcon,
          label: 'Verified'
        },
        rejected: {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircleIcon,
          label: 'Rejected'
        },
        'under-review': {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: ExclamationTriangleIcon,
          label: 'Under Review'
        }
      }
    }

    return configs[type]?.[status] || {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: ExclamationTriangleIcon,
      label: status || 'Unknown'
    }
  }

  const config = getStatusConfig(status, type)
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-4 w-4'
  }

  return (
    <span className={`
      inline-flex items-center 
      ${sizeClasses[size]} 
      ${config.color} 
      border 
      rounded-full 
      font-medium 
      gap-1
    `}>
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  )
}

export default StatusBadge