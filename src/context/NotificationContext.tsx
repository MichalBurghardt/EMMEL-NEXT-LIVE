'use client';

import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';

// Types
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  onClick?: () => void;
  onClose?: () => void;
  actionLabel?: string;
  actionFn?: () => void;
  autoClose?: boolean;
}

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Context
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// Provider component
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Remove notification by ID
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Add notification and return its ID
  const addNotification = useCallback((notification: Omit<Notification, 'id'>): string => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = { id, ...notification };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-close notification if needed
    if (notification.autoClose !== false) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  }, [removeNotification]);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hooks
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const useNotify = () => {
  const { addNotification } = useNotification();
  
  return useCallback(
    (
      type: NotificationType,
      message: string,
      options?: Omit<Notification, 'id' | 'type' | 'message'>
    ) => {
      return addNotification({ type, message, ...options });
    },
    [addNotification]
  );
};
