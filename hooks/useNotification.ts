'use client';

import { useCallback } from 'react';
import { useNotification as useBaseNotification, useNotify as useBaseNotify } from '@/context/NotificationContext';
import type { NotificationType } from '@/context/NotificationContext';

export interface NotificationOptions {
  title?: string;
  autoClose?: boolean;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  onClick?: () => void;
  onClose?: () => void;
  actionLabel?: string;
  actionFn?: () => void;
}

/**
 * Enhanced notification hook with additional features and better TypeScript support
 */
export function useNotification() {
  const baseNotification = useBaseNotification();
  const baseNotify = useBaseNotify();
  
  /**
   * Show a notification
   * @param type The notification type: 'success', 'error', 'warning', or 'info'
   * @param message The notification message
   * @param options Additional notification options
   * @returns The ID of the created notification
   */  const show = useCallback((
    type: NotificationType, 
    message: string, 
    options?: NotificationOptions
  ): string => {
    const { title, ...restOptions } = options || {};
    
    // Use baseNotify directly with the type parameter
    return baseNotify(type, message, { 
      title,
      ...restOptions 
    });
  }, [baseNotify]);

  /**
   * Show a success notification
   * @param message The success message
   * @param options Additional notification options
   * @returns The ID of the created notification
   */
  const success = useCallback((message: string, options?: NotificationOptions): string => {
    return show('success', message, options);
  }, [show]);

  /**
   * Show an error notification
   * @param message The error message
   * @param options Additional notification options
   * @returns The ID of the created notification
   */
  const error = useCallback((message: string, options?: NotificationOptions): string => {
    return show('error', message, options);
  }, [show]);

  /**
   * Show a warning notification
   * @param message The warning message
   * @param options Additional notification options
   * @returns The ID of the created notification
   */
  const warning = useCallback((message: string, options?: NotificationOptions): string => {
    return show('warning', message, options);
  }, [show]);

  /**
   * Show an info notification
   * @param message The info message
   * @param options Additional notification options
   * @returns The ID of the created notification
   */
  const info = useCallback((message: string, options?: NotificationOptions): string => {
    return show('info', message, options);
  }, [show]);

  /**
   * Show an API error notification with appropriate message handling
   * @param error The error object from an API call
   * @param fallbackMessage A fallback message if the error doesn't have a message property
   * @returns The ID of the created notification
   */
  const apiError = useCallback((error: unknown, fallbackMessage: string = 'Ein Fehler ist aufgetreten'): string => {
    let errorMessage = fallbackMessage;
    
    if (error && typeof error === 'object') {
      if ('message' in error && typeof error.message === 'string') {
        errorMessage = error.message;
      } else if ('error' in error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if ('statusText' in error && typeof error.statusText === 'string') {
        errorMessage = error.statusText;
      }
    }
    
    return show('error', 'Fehler: ' + errorMessage, { 
      autoClose: true,
      duration: 8000 // Longer duration for errors
    });
  }, [show]);

  /**
   * Show a notification for a successful form submission
   * @param entityName The name of the entity that was created/updated
   * @param isUpdate Whether this was an update (true) or a creation (false)
   * @returns The ID of the created notification
   */
  const formSuccess = useCallback((entityName: string, isUpdate: boolean = false): string => {
    const action = isUpdate ? 'aktualisiert' : 'erstellt';
    return success(`${entityName} wurde erfolgreich ${action}.`);
  }, [success]);

  /**
   * Show a confirmation notification with accept/reject actions
   * @param message The confirmation message
   * @param onConfirm Function to call when the user confirms
   * @param options Additional notification options
   * @returns The ID of the created notification
   */
  const confirm = useCallback((
    message: string, 
    onConfirm: () => void,
    options?: Omit<NotificationOptions, 'actionLabel' | 'actionFn'>
  ): string => {
    return info(message, {
      ...options,
      autoClose: false,
      actionLabel: 'Bestätigen',
      actionFn: onConfirm
    });
  }, [info]);

  /**
   * Remove a specific notification by ID
   * @param id The ID of the notification to remove
   */
  const remove = useCallback((id: string): void => {
    baseNotification.removeNotification(id);
  }, [baseNotification]);

  /**
   * Clear all notifications
   */  const clear = useCallback((): void => {
    baseNotification.clearNotifications();
  }, [baseNotification]);

  return {
    // Main methods
    show,
    success,
    error, 
    warning,
    info,
    remove,
    clear,
    
    // Helper methods
    apiError,
    formSuccess,
    confirm,
    
    // Access to base notification context
    notifications: baseNotification.notifications,
    
    // Legacy access to base notify (for backward compatibility)
    notify: baseNotify
  };
}

// Default export for simpler imports
export default useNotification;