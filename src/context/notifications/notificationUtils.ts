
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Notification } from './types';

export const fetchUserNotifications = async (userId: string, tenantId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (error) throw error;
    
    return data || [];
  } catch (err: any) {
    console.error('Error fetching notifications:', err.message);
    toast({
      title: 'Error loading notifications',
      description: err.message,
      variant: 'destructive',
    });
    return [];
  }
};

export const subscribeToNotifications = (userId: string, tenantId: string, 
  onNew: (notification: Notification) => void, 
  onUpdate: (notification: Notification, wasRead: boolean) => void) => {
  
  const channel = supabase
    .channel('notifications-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const newNotification = payload.new as Notification;
        if (newNotification.tenant_id === tenantId) {
          onNew(newNotification);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const updatedNotification = payload.new as Notification;
        if (updatedNotification.tenant_id === tenantId) {
          const wasRead = !payload.old.read_at && updatedNotification.read_at;
          onUpdate(updatedNotification, wasRead);
        }
      }
    )
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};

export const markNotificationAsRead = async (id: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return true;
  } catch (err: any) {
    console.error('Error marking notification as read:', err.message);
    toast({
      title: 'Error',
      description: err.message,
      variant: 'destructive',
    });
    return false;
  }
};

export const markAllNotificationsAsRead = async (userId: string, tenantId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('tenant_id', tenantId)
      .is('read_at', null);
      
    if (error) throw error;
    
    toast({
      title: 'All notifications marked as read',
    });
    
    return true;
  } catch (err: any) {
    console.error('Error marking all notifications as read:', err.message);
    toast({
      title: 'Error',
      description: err.message,
      variant: 'destructive',
    });
    return false;
  }
};
