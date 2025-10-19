const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = null,
  fullScreen = false 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  const colorClasses = {
    primary: 'border-primary-500',
    white: 'border-white',
    gray: 'border-gray-500',
    success: 'border-green-500',
    warning: 'border-yellow-500',
    error: 'border-red-500',
  }

  const baseClasses = fullScreen 
    ? "fixed inset-0 bg-white bg-opacity-75 flex flex-col justify-center items-center z-50"
    : "flex flex-col justify-center items-center"

  return (
    <div className={baseClasses}>
      <div 
        className={`
          ${sizeClasses[size]} 
          border-4 
          ${colorClasses[color]} 
          border-t-transparent 
          rounded-full 
          animate-spin
        `} 
      />
      {text && (
        <p className="mt-3 text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner