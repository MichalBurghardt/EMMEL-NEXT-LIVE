import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export interface AlertProps {
  type: 'error' | 'success' | 'warning' | 'info';
  title: string;
  message: string;
  className?: string;
  onClose?: () => void;
}

export function Alert({ type, title, message, className = '', onClose }: AlertProps) {
  const alertStyles = {
    error: {
      containerClass: 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-800',
      iconClass: 'text-red-400 dark:text-red-300',
      titleClass: 'text-red-800 dark:text-red-300',
      messageClass: 'text-red-700 dark:text-red-200',
      Icon: XCircle
    },
    success: {
      containerClass: 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-800',
      iconClass: 'text-green-400 dark:text-green-300',
      titleClass: 'text-green-800 dark:text-green-300',
      messageClass: 'text-green-700 dark:text-green-200',
      Icon: CheckCircle
    },
    warning: {
      containerClass: 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-800',
      iconClass: 'text-yellow-400 dark:text-yellow-300',
      titleClass: 'text-yellow-800 dark:text-yellow-300',
      messageClass: 'text-yellow-700 dark:text-yellow-200',
      Icon: AlertCircle
    },
    info: {
      containerClass: 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-800',
      iconClass: 'text-blue-400 dark:text-blue-300',
      titleClass: 'text-blue-800 dark:text-blue-300',
      messageClass: 'text-blue-700 dark:text-blue-200',
      Icon: Info
    }
  };

  const { containerClass, iconClass, titleClass, messageClass, Icon } = alertStyles[type];

  return (
    <div className={`p-4 mb-4 border-l-4 rounded-md flex ${containerClass} ${className}`} role="alert">
      <div className={`flex-shrink-0 ${iconClass} mr-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h3 className={`text-sm font-medium ${titleClass}`}>{title}</h3>
        {message && <div className={`mt-1 text-sm ${messageClass}`}>{message}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8 hover:bg-opacity-25 focus:outline-none focus:ring-gray-300"
          onClick={onClose}
          aria-label="Close"
        >
          <span className="sr-only">Close</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      )}
    </div>
  );
}
