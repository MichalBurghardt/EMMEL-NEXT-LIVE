import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  variant = 'danger'
}: ConfirmDialogProps) {
  if (!isOpen) return null;
  
  const variantClasses = {
    danger: {
      icon: 'bg-red-100 text-red-600',
      button: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      icon: 'bg-yellow-100 text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    },
    info: {
      icon: 'bg-blue-100 text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-start mb-4">
          <div className={`p-2 rounded-full mr-3 ${variantClasses[variant].icon}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button 
            className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantClasses[variant].button}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
