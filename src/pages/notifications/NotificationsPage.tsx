import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertCircle, Bell, CheckCircle2, Filter, Info, Loader2, MailOpen, Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/components/notifications/NotificationCenter';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PageHelmet from '@/components/PageHelmet';

const NotificationsPage: React.FC = () => {
  const { currentTenant } = useWorkspace();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && currentTenant?.id) {
      fetchNotifications();

      // Set up real-time subscription for new notifications
      const setupSubscription = async () => {
        try {
          const channel = supabase.realtime
            .channel('notifications_changes')
            .on('postgres_changes', 
              {
                event: '*', // Listen for all changes
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
              }, 
              () => {
                fetchNotifications();
              }
            )
            .subscribe();
          
          return channel;
        } catch (error) {
          console.error('Error setting up realtime subscription:', error);
          return null;
        }
      };
      
      const channel = setupSubscription();
      
      return () => {
        if (channel) {
          // Safely handle removeChannel method
          if ('removeChannel' in supabase.realtime) {
            supabase.realtime.removeChannel(channel);
          }
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
        prev.map(notif => ({ ...notif, isRead: true }))
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
    }
  };

  const getModuleBadge = (module?: string) => {
    if (!module) return null;
    
    const colors: Record<string, string> = {
      'strategy': 'bg-blue-100 text-blue-800',
      'agent': 'bg-purple-100 text-purple-800',
      'plugin': 'bg-amber-100 text-amber-800',
      'billing': 'bg-green-100 text-green-800',
      'system': 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[module] || 'bg-gray-100 text-gray-800'}`}>
        {module}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'recently';
    }
  };

  const renderNotificationItem = (notification: Notification) => {
    const content = (
      <div className={`relative flex gap-4 rounded-lg border p-4 ${notification.isRead ? '' : 'bg-accent'}`}>
        {!notification.isRead && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>
        )}
        <div className="flex-shrink-0">
          {getTypeIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium">
              {notification.title}
            </h3>
            <div className="flex items-center gap-2">
              {notification.module && getModuleBadge(notification.module)}
              <div className="flex space-x-1">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    className="h-7 w-7"
                  >
                    <MailOpen className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
          {notification.description && (
            <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">{formatDate(notification.createdAt)}</p>
        </div>
      </div>
    );

    return notification.link ? (
      <Link to={notification.link} key={notification.id} className="block hover:no-underline">
        {content}
      </Link>
    ) : (
      <div key={notification.id} className="cursor-default">
        {content}
      </div>
    );
  };

  const filterOptions = [
    { value: null, label: 'All Types' },
    { value: 'strategy', label: 'Strategy' },
    { value: 'agent', label: 'Agent' },
    { value: 'plugin', label: 'Plugin' },
    { value: 'billing', label: 'Billing' },
    { value: 'system', label: 'System' },
  ];

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Bell className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No notifications</h3>
      <p className="text-muted-foreground max-w-sm mt-2">
        You don't have any{selectedTab === 'unread' ? ' unread' : ''} notifications
        {filter ? ` related to ${filter}` : ''}.
      </p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHelmet 
        title="Notifications" 
        description="View and manage your notifications"
      />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">View and manage your notification history</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="h-4 w-4" />
                {filter ? `Filter: ${filter}` : 'Filter'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {filterOptions.map((option) => (
                <DropdownMenuItem 
                  key={option.value || 'none'} 
                  onClick={() => setFilter(option.value)}
                  className={filter === option.value ? 'bg-accent' : ''}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <MailOpen className="h-4 w-4 mr-1.5" />
            Mark all read
          </Button>
          
          <Button variant="outline" size="sm" onClick={deleteAllNotifications} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-1.5" />
            Clear all
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map(renderNotificationItem)}
            </div>
          ) : renderEmptyState()}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
