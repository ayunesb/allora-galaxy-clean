
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/notifications';
import { useTenantId } from '@/hooks/useTenantId';

export const useNotificationData = (limit = 20) => {
  const { tenantId } = useTenantId();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  // Fetch notifications
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications', tenantId],
    queryFn: async () => {
      if (!tenantId) return { notifications: [], unreadCount: 0 };
      
      const { data: notificationsData, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      const { count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('read', false);
        
      if (countError) throw countError;
      
      return { 
        notifications: notificationsData as Notification[],
        unreadCount: count || 0
      };
    },
    enabled: !!tenantId
  });
  
  // Update state when data changes
  useEffect(() => {
    if (data) {
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    }
  }, [data]);
  
  // Mark notification as read
  const markAsRead = async (id: string) => {
    if (!tenantId) return;
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('tenant_id', tenantId);
      
    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }
    
    // Optimistically update UI
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!tenantId) return;
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('tenant_id', tenantId)
      .eq('read', false);
      
    if (error) {
      console.error('Error marking all notifications as read:', error);
      return;
    }
    
    // Optimistically update UI
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };
  
  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch
  };
};

export default useNotificationData;
