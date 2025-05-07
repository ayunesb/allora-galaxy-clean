
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { supabase, realtime } from '@/lib/supabase';
import NotificationCenterHeader from './NotificationCenterHeader';
import NotificationCenterTabs from './NotificationCenterTabs';
import NotificationCenterFooter from './NotificationCenterFooter';
import { Notification } from '@/types/notifications';

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const { currentTenant } = useWorkspace();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user?.id && currentTenant?.id && open) {
      fetchNotifications();
    }
  }, [user?.id, currentTenant?.id, open]);

  useEffect(() => {
    if (user?.id && currentTenant?.id) {
      fetchUnreadCount();
      
      // Set up real-time subscription for new notifications
      const channel = realtime
        .channel('notifications_changes')
        .on('postgres_changes', 
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `tenant_id=eq.${currentTenant.id}`
          }, 
          () => {
            fetchUnreadCount();
            if (open) {
              fetchNotifications();
            }
          }
        )
        .subscribe();
      
      return () => {
        if (channel) {
          realtime.removeChannel(channel);
        }
      };
    }
  }, [user?.id, currentTenant?.id]);

  const fetchNotifications = async () => {
    if (!user?.id || !currentTenant?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      
      setNotifications(data || []);
      
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user?.id || !currentTenant?.id) return;
    
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', currentTenant.id)
        .eq('user_id', user.id)
        .eq('is_read', false);
        
      if (error) throw error;
      
      setUnreadCount(count || 0);
      
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true, read_at: new Date().toISOString() } : notif
        )
      );
      
      fetchUnreadCount();
      
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id || !currentTenant?.id) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('tenant_id', currentTenant.id)
        .eq('user_id', user.id)
        .eq('is_read', false);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true, read_at: notif.read_at || new Date().toISOString() }))
      );
      
      setUnreadCount(0);
      
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[380px]" align="end" forceMount>
        <NotificationCenterHeader 
          markAllAsRead={markAllAsRead} 
          onClose={() => setOpen(false)} 
        />
        <DropdownMenuSeparator />
        
        <NotificationCenterTabs 
          loading={loading}
          notifications={notifications}
          markAsRead={markAsRead}
          onClose={() => setOpen(false)}
          unreadCount={unreadCount}
        />
        
        <DropdownMenuSeparator />
        <NotificationCenterFooter />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;
