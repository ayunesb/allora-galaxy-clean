
import React, { useState } from 'react';
import { useNotificationsContext } from '@/context/NotificationsContext';
import NotificationTabs from '@/components/notifications/NotificationTabs';
import NotificationFilters, { NotificationType } from '@/components/notifications/NotificationFilters';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const NotificationsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType>('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    notifications, 
    loading, 
    markAsRead,
    deleteNotification,
    refreshNotifications
  } = useNotificationsContext();
  
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
      setIsDeleting(true);
      
      // In a real implementation, you would call a function to delete all notifications
      // For now, we'll mock it with a toast
      toast({
        title: "Deleting notifications",
        description: "This functionality is not yet implemented."
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Operation complete",
        description: "All filtered notifications would be deleted."
      });
    } catch (error) {
      console.error('Error deleting notifications:', error);
      toast({
        title: "Error",
        description: "Failed to delete notifications",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshNotifications();
      toast({
        title: "Notifications refreshed",
        description: "Your notifications have been updated."
      });
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      toast({
        title: "Error",
        description: "Failed to refresh notifications",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Notifications</h1>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteAll}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All
          </Button>
          
          <NotificationFilters
            selectedFilter={typeFilter}
            onFilterChange={setTypeFilter}
          />
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <NotificationTabs
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          notifications={filteredNotifications}
          loading={loading}
          markAsRead={markAsRead}
          onDelete={deleteNotification}
        />
      </Card>
    </div>
  );
};

export default NotificationsPage;
