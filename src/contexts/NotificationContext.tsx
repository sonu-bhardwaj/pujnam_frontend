import React, { createContext, useContext, useState, useCallback } from 'react';
import Snackbar, { SnackbarMessage, SnackbarType } from '../components/Snackbar';

interface NotificationContextType {
  showNotification: (message: string, type?: SnackbarType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<SnackbarMessage[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback(
    (message: string, type: SnackbarType = 'info', duration: number = 4000) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newNotification: SnackbarMessage = {
        id,
        message,
        type,
        duration,
      };

      setNotifications((prev) => [...prev, newNotification]);
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showNotification(message, 'success', duration);
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      showNotification(message, 'error', duration || 5000);
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showNotification(message, 'warning', duration);
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showNotification(message, 'info', duration);
    },
    [showNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
      {/* Snackbar Container */}
      <div
        className="fixed top-20 right-4 z-[9999] flex flex-col items-end"
        style={{ pointerEvents: 'none' }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          {notifications.map((notification) => (
            <Snackbar
              key={notification.id}
              message={notification}
              onClose={removeNotification}
            />
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
