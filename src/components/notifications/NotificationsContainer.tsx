
import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { supabase, realtime } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationsPageHeader from './NotificationsPageHeader';
import NotificationList from './NotificationList';
import { NotificationContent } from '@/types/notifications';

interface NotificationsContainerProps {
  filter: string | null;
  setFilter: (filter: string | null) => void;
}

const NotificationsContainer: React.FC<NotificationsContainerProps> = ({ filter, setFilter }) => {
  const { currentTenant } = useWorkspace();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');

  useEffect(() => {
    if (user?.id && currentTenant?.id) {
      fetchNotifications();

      // Set up real-time subscription for new notifications
      const channel = realtime
        .channel('notifications_changes')
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
        if (channel) {
          realtime.removeChannel(channel);
        }
      };
    }
  }, [user?.id, currentTenant?.id, selectedTab, filter]);

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
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id || !currentTenant?.id) return;
    
    try {
      let query = supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('tenant_id', currentTenant.id)
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (filter) {
        query = query.eq('module', filter);
      }
      
      const { error } = await query;
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
    } catch (error: any) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteAllNotifications = async () => {
    if (!user?.id || !currentTenant?.id) return;
    
    try {
      let query = supabase
        .from('notifications')
        .delete()
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
      
      const { error } = await query;
      
      if (error) throw error;
      
      // Update local state by refetching
      fetchNotifications();
      
    } catch (error: any) {
      console.error('Error deleting all notifications:', error);
    }
  };

  return (
    <>
      <NotificationsPageHeader
        filter={filter}
        setFilter={setFilter}
        onMarkAllAsRead={markAllAsRead}
        onDeleteAll={deleteAllNotifications}
      />
      
      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardContent className="p-6">
            <NotificationList 
              notifications={notifications} 
              loading={loading} 
              selectedTab={selectedTab} 
              filter={filter}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          </CardContent>
        </Card>
      </Tabs>
    </>
  );
};

export default NotificationsContainer;
