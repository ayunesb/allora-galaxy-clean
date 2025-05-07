
import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification 
} from '@/services/notificationService';

export const useNotificationActions = () => {
  const { user } = useAuth();
  const { currentTenant } = useWorkspace();
  
  const refreshNotifications = useCallback(async () => {
    if (!user || !currentTenant) return { data: [], error: new Error('No user or tenant') };
    
    return await fetchNotifications(user.id, currentTenant.id);
  }, [user, currentTenant]);
  
  const markAsRead = useCallback(async (id: string) => {
    if (!user) return { success: false, error: new Error('No user') };
    
    return await markNotificationAsRead(id, user.id);
  }, [user]);
  
  const markAllAsRead = useCallback(async () => {
    if (!user || !currentTenant) return { success: false, error: new Error('No user or tenant') };
    
    return await markAllNotificationsAsRead(user.id, currentTenant.id);
  }, [user, currentTenant]);
  
  const removeNotification = useCallback(async (id: string) => {
    if (!user) return { success: false, error: new Error('No user') };
    
    return await deleteNotification(id, user.id);
  }, [user]);
  
  return {
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification
  };
};
