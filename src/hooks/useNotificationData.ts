
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Notification, NotificationContent, convertToNotificationContent } from '@/types/notifications';

export const useNotificationData = (limit = 20) => {
  const [notifications, setNotifications] = useState<NotificationContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      // Convert to NotificationContent format
      const notificationContent = (data || []).map((notification: Notification) => 
        convertToNotificationContent(notification)
      );
      
      setNotifications(notificationContent);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err : new Error(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userData.user.id);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userData.user.id)
        .is('read_at', null);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', userData.user.id);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  };

  return {
    notifications,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};

export default useNotificationData;
