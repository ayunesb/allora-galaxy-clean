
import { useContext } from 'react';
import NotificationsContext from './NotificationsContext';
import { NotificationsContextValue } from '@/types/notifications';

// Custom hook to use the notifications context
export const useNotifications = (): NotificationsContextValue => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export default useNotifications;
