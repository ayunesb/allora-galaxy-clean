
import { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from '@/lib/notifications/useNotifications';
import { Notification } from '@/types/notifications';

export interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  markAsRead: (id: string) => Promise<{ success: boolean; error?: Error }>;
  markAllAsRead: () => Promise<{ success: boolean; error?: Error }>;
  deleteNotification: (id: string) => Promise<{ success: boolean; error?: Error }>;
  refreshNotifications: () => Promise<{ success: boolean; error?: Error }>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const notificationsState = useNotifications();
  
  return (
    <NotificationsContext.Provider value={notificationsState}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotificationsContext must be used within a NotificationsProvider');
  }
  return context;
};
