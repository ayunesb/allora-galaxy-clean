
import { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { supabase, channel } from '@/lib/supabase';
import { NotificationContent } from '@/types/notifications';

export const useNotificationData = (selectedTab = 'all', filter: string | null = null) => {
  const { currentTenant } = useWorkspace();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationContent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user?.id || !currentTenant?.id) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .eq('user_id', user.id);
      
      // Apply tab filters
      if (selectedTab === 'unread') {
        query = query.eq('is_read', false);
      }
      
      // Apply module filter
      if (filter) {
        query = query.eq('module', filter);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform to frontend notification format
      const transformedNotifications: NotificationContent[] = data.map(item => ({
        id: item.id,
        title: item.title,
        message: item.description || '',
        timestamp: item.created_at,
        read: item.is_read,
        type: (item.type || 'info') as 'info' | 'success' | 'warning' | 'error' | 'system'
      }));
      
      setNotifications(transformedNotifications);
      
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && currentTenant?.id) {
      fetchNotifications();

      // Set up real-time subscription for new notifications
      const supabaseChannel = channel('notifications_changes')
        .on('postgres_changes', 
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            fetchNotifications();
          }
        )
        .subscribe();
      
      return () => {
        if (supabaseChannel) {
          supabase.removeChannel(supabaseChannel);
        }
      };
    }
  }, [user?.id, currentTenant?.id, selectedTab, filter]);

  return {
    notifications,
    loading,
    fetchNotifications
  };
};
