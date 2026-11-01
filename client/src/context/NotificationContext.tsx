import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationItem } from '../types';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'emergency';
  title: string;
  message: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, toast.type === 'emergency' ? 10000 : 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markNotificationRead('all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshNotifications();

    const socket = getSocket();

    // Listen to real-time events
    socket.on('emergency:alert', (data) => {
      showToast({
        type: 'emergency',
        title: '🚨 EMERGENCY SOS ALERT',
        message: `${data.emergencyType} emergency reported for Unit ${data.flatNumber} (${data.residentName}).`,
      });
      refreshNotifications();
    });

    socket.on('visitor:new', (visitor) => {
      if (user?.role === 'SECURITY') {
        showToast({
          type: 'info',
          title: 'New Visitor Pass',
          message: `${visitor.name} (${visitor.visitorType}) arriving for ${visitor.flat?.flatNumber}.`,
        });
      }
    });

    socket.on('visitor:status_changed', (data) => {
      showToast({
        type: 'success',
        title: 'Visitor Update',
        message: `${data.visitor?.name || 'Visitor'} status updated to ${data.status}.`,
      });
      refreshNotifications();
    });

    socket.on('notification:new', (notif) => {
      showToast({
        type: 'info',
        title: notif.title,
        message: notif.message,
      });
      refreshNotifications();
    });

    return () => {
      socket.off('emergency:alert');
      socket.off('visitor:new');
      socket.off('visitor:status_changed');
      socket.off('notification:new');
    };
  }, [isAuthenticated, user?.id]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        showToast,
        removeToast,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-elevated flex items-start gap-3 backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              t.type === 'emergency'
                ? 'bg-status-emergency/30 border-status-emergency text-white ring-2 ring-red-500 animate-pulse'
                : t.type === 'success'
                ? 'bg-[#10171D]/95 border-status-success/40 text-text-primary'
                : t.type === 'error'
                ? 'bg-[#10171D]/95 border-status-danger/40 text-text-primary'
                : 'bg-[#10171D]/95 border-primary/40 text-text-primary'
            }`}
          >
            <div className="flex-1">
              <p className="font-semibold text-sm flex items-center gap-1.5">
                {t.type === 'emergency' && <span>🚨</span>}
                {t.title}
              </p>
              <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-text-muted hover:text-text-primary text-xs ml-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

