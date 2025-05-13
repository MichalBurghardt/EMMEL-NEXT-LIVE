import React, { forwardRef, useId } from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const id = useId();

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">          <input
            id={id}
            type="checkbox"
            className={`
              h-4 w-4 rounded
              border-gray-300 dark:border-gray-600
              text-green-600 
              focus:ring-2 focus:ring-green-500
              disabled:opacity-50
              bg-white dark:bg-gray-700
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            ref={ref}
            {...props}
          />
        </div>
        
        {label && (
          <div className="ml-2 text-sm">
            <label
              htmlFor={id}
              className={`font-medium text-gray-700 dark:text-gray-300 ${props.disabled ? 'opacity-50' : ''}`}
            >
              {label}
            </label>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };