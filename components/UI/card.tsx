import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'accent';
  accentColor?: 'green' | 'blue' | 'purple' | 'red' | 'orange';
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  accentColor = 'green',
  elevation = 'md',
  padding = 'md',
  className = '',
  children,
  ...props
}) => {
  // Map elevation to shadow classes
  const shadowMap = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-xl'
  };

  // Map padding to classes
  const paddingMap = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  // Map accent color to border classes
  const accentColorMap = {
    green: 'border-t-green-500',
    blue: 'border-t-blue-500',
    purple: 'border-t-purple-500',
    red: 'border-t-red-500',
    orange: 'border-t-orange-500'
  };

  const isAccent = variant === 'accent';

  return (
    <div
      className={`
        rounded-lg bg-white dark:bg-gray-800 dark:text-white
        ${shadowMap[elevation]} 
        ${paddingMap[padding]} 
        ${isAccent ? `border-t-4 ${accentColorMap[accentColor]}` : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export { Card };