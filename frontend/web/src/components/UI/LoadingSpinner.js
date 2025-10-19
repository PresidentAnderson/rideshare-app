import React from 'react';
import classNames from 'classnames';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  className = '',
  text = null 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-16 h-16',
    xlarge: 'w-24 h-24',
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    white: 'text-white',
    gray: 'text-gray-600',
  };

  const spinnerClasses = classNames(
    'animate-spin border-2 border-current border-t-transparent rounded-full',
    sizeClasses[size],
    colorClasses[color],
    className
  );

  if (text) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className={spinnerClasses} />
        <p className="text-sm text-gray-600">{text}</p>
      </div>
    );
  }

  return <div className={spinnerClasses} />;
};

export default LoadingSpinner;