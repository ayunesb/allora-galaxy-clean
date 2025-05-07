import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, AlertCircle, Info, MailOpen, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { supabase } from '@/lib/supabase';
import NotificationItem from './NotificationItem';

export interface Notification {
  id: string;
  title: string;
  description?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
  module?: 'strategy' | 'agent' | 'plugin' | 'system' | 'billing';
}

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
      const setupSubscription = async () => {
        try {
          if (supabase.realtime) {
            const channel = supabase.realtime.channel('notifications_changes');
            
            channel.on('postgres_changes', 
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
            ).subscribe();
            
            return channel;
          }
          return null;
        } catch (error) {
          console.error('Error setting up realtime subscription:', error);
          return null;
        }
      };
      
      const channel = setupSubscription();
      
      return () => {
        if (channel && supabase.realtime) {
          supabase.realtime.removeChannel(channel);
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
      
      // Transform to frontend notification format
      const transformedNotifications: Notification[] = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type || 'info',
        isRead: item.is_read,
        createdAt: item.created_at,
        link: item.link,
        module: item.module
      }));
      
      setNotifications(transformedNotifications);
      
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
        .update({ is_read: true })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
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
        .update({ is_read: true })
        .eq('tenant_id', currentTenant.id)
        .eq('user_id', user.id)
        .eq('is_read', false);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      setUnreadCount(0);
      
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getEmptyStateMessage = (filter: string) => {
    switch (filter) {
      case 'all':
        return 'You don\'t have any notifications yet';
      case 'unread':
        return 'You don\'t have any unread notifications';
      case 'system':
        return 'No system notifications';
      default:
        return 'No notifications to show';
    }
  };

  const filterNotifications = (filter: string) => {
    switch (filter) {
      case 'all':
        return notifications;
      case 'unread':
        return notifications.filter(notif => !notif.isRead);
      case 'system':
        return notifications.filter(notif => notif.module === 'system');
      default:
        return notifications;
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
        <div className="flex items-center justify-between p-4">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </DropdownMenuLabel>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={markAllAsRead} title="Mark all as read">
              <MailOpen className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DropdownMenuSeparator />
        
        <Tabs defaultValue="all" className="w-full">
          <div className="px-4">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
          </div>
          
          {['all', 'unread', 'system'].map((filter) => (
            <TabsContent key={filter} value={filter} className="py-0">
              <ScrollArea className="h-[300px]">
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : filterNotifications(filter).length > 0 ? (
                  <div>
                    {filterNotifications(filter).map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onClose={() => setOpen(false)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center p-4">
                    <Info className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">{getEmptyStateMessage(filter)}</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center justify-center cursor-pointer h-10">
          <Button variant="ghost" size="sm" asChild className="w-full">
            <a href="/settings/notifications" className="flex items-center" onClick={() => setOpen(false)}>
              <Settings className="h-4 w-4 mr-2" />
              Notification Settings
            </a>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;
