import React, { forwardRef } from 'react';
import './input.css'; // We'll create this file next

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, icon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {icon}
          </div>
        )}          <input          
            className={`
            w-full h-11 px-4 transition-colors duration-300
            border border-amber-900/30 rounded-sm
            text-amber-900
            focus:outline-none focus:ring-0 focus:border-amber-700/50
            disabled:opacity-50
            placeholder:text-amber-900/50
            ${icon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-amber-800/70' : ''}
            vintage-input
            ${className}
          `}          style={{
            backgroundColor: '#f0e6d2',
            WebkitAppearance: 'none',
            appearance: 'none',
            paddingRight: error ? '170px' : undefined, // Even more space for error text with 2px margin
            boxShadow: error ? 'inset 0 0 0 1px rgba(146, 64, 14, 0.15)' : 'none'
          }}
          ref={ref}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightIcon}
          </div>
        )}
          {/* Usunięto domyślny komunikat błędu, będzie obsługiwany przez rodzica */}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };