import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[2.5px]',
  xl: 'w-16 h-16 border-[3px]'
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message,
  className = '' 
}) => {
  const spinnerSize = sizeClasses[size];

  if (message) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div 
          className={`${spinnerSize} border-[#1C0F09] border-t-transparent rounded-full animate-spin mb-4`}
          role="status"
          aria-label="Loading"
        />
        <p className="text-[#1C0F09] font-jost text-sm">{message}</p>
      </div>
    );
  }

  return (
    <div 
      className={`${spinnerSize} border-[#1C0F09] border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default LoadingSpinner;

