
import React, { useState } from 'react';
import { useNotificationsContext } from '@/context/NotificationsContext';
import NotificationTabs from '@/components/notifications/NotificationTabs';
import NotificationFilters, { NotificationType } from '@/components/notifications/NotificationFilters';
import NotificationsPageHeader from '@/components/notifications/NotificationsPageHeader';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import PageHelmet from '@/components/PageHelmet';

const NotificationsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  const { notifications, loading } = useNotificationsContext();
  const { markAllAsRead, deleteNotification, refreshNotifications } = useNotificationActions();
  
  // Filter notifications based on selected type
  const filteredNotifications = React.useMemo(() => {
    return notifications.filter(notification => {
      if (typeFilter === 'all') return true;
      return notification.type === typeFilter;
    }).map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.description || '',
      timestamp: notification.created_at,
      read: notification.is_read || false,
      type: notification.type,
      action_url: notification.action_url,
      action_label: notification.action_label
    }));
  }, [notifications, typeFilter]);
  
  const handleDeleteAll = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, you would call a function to delete all notifications
      // For now, we'll mock it with a toast
      toast({
        title: "Deleting notifications",
        description: "Working on clearing your notifications..."
      });
      
      // Delete each notification individually
      for (const notification of filteredNotifications) {
        await deleteNotification(notification.id);
      }
      
      toast({
        title: "Notifications cleared",
        description: `Successfully cleared ${filteredNotifications.length} notifications.`,
        variant: "default",
        className: "border-green-600 bg-green-50 dark:bg-green-950/30"
      });

      // Refresh the list
      await refreshNotifications();
      
    } catch (error) {
      console.error('Error deleting notifications:', error);
      toast({
        title: "Error",
        description: "Failed to delete notifications",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      setIsLoading(true);
      await markAllAsRead();
      
      toast({
        title: "Notifications marked as read",
        description: "All notifications have been marked as read.",
        variant: "default",
        className: "border-green-600 bg-green-50 dark:bg-green-950/30"
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container py-6 space-y-6">
      <PageHelmet 
        title="Notifications" 
        description="View and manage your notifications"
      />
      
      <NotificationsPageHeader
        filter={typeFilter}
        setFilter={setTypeFilter}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDeleteAll={handleDeleteAll}
      />
      
      <Card className="overflow-hidden">
        <NotificationTabs
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          notifications={filteredNotifications}
          loading={loading || isLoading}
          markAsRead={markAllAsRead}
          onDelete={deleteNotification}
        />
      </Card>
    </div>
  );
};

export default NotificationsPage;
