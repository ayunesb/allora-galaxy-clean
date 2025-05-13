
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/notifications';
import { useTenantId } from '@/hooks/useTenantId';

export const useNotificationData = (limit = 20) => {
  const { tenantId } = useTenantId();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const subscriptionRef = useRef<{ subscription: any; teardown: () => void } | null>(null);
  
  // Fetch notifications with proper caching
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications', tenantId, limit],
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
    staleTime: 30000, // 30 seconds
    gcTime: 300000,   // 5 minutes
    enabled: !!tenantId
  });
  
  // Set up realtime subscription for notifications
  useEffect(() => {
    if (tenantId && !subscriptionRef.current) {
      const subscription = supabase
        .channel('notifications-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `tenant_id=eq.${tenantId}`
          },
          (payload) => {
            // Invalidate the query to trigger a refetch
            queryClient.invalidateQueries({ queryKey: ['notifications', tenantId] });
          }
        )
        .subscribe();
      
      subscriptionRef.current = {
        subscription,
        teardown: () => {
          subscription.unsubscribe();
          subscriptionRef.current = null;
        }
      };

      return () => {
        if (subscriptionRef.current) {
          subscriptionRef.current.teardown();
        }
      };
    }
  }, [tenantId, queryClient]);
  
  // Update state when data changes
  useEffect(() => {
    if (data) {
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    }
  }, [data]);
  
  // Mark notification as read with optimistic update
  const markAsRead = useCallback(async (id: string) => {
    if (!tenantId) return;
    
    // Optimistically update UI
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('tenant_id', tenantId);
      
    if (error) {
      console.error('Error marking notification as read:', error);
      // Revert optimistic update on error
      refetch();
    }
  }, [tenantId, refetch]);
  
  // Mark all notifications as read with optimistic update
  const markAllAsRead = useCallback(async () => {
    if (!tenantId) return;
    
    // Optimistically update UI
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('tenant_id', tenantId)
      .eq('read', false);
      
    if (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert optimistic update on error
      refetch();
    }
  }, [tenantId, refetch]);
  
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
