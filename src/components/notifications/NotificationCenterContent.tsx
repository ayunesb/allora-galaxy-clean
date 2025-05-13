
import { useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useEffect } from 'react';
import { useNotifications, useMarkAllNotificationsAsRead } from '@/services/notificationService';
import { Notification } from '@/types/notifications';
import NotificationCenterEmptyState from './NotificationCenterEmptyState';
import NotificationCenterHeader from './NotificationCenterHeader';
import NotificationCenterLoading from './NotificationCenterLoading';
import useAuth from '@/hooks/useAuth';
import NotificationCenterTabs from './NotificationCenterTabs';

interface NotificationCenterContentProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  notifications?: Notification[];
  markAsRead?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onMarkAllAsRead?: () => Promise<void>;
}

const NotificationCenterContent = ({ 
  activeFilter, 
  setActiveFilter,
  notifications: externalNotifications,
  markAsRead: externalMarkAsRead,
  onDelete: externalOnDelete,
  onMarkAllAsRead: externalOnMarkAllAsRead
}: NotificationCenterContentProps) => {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  
  const tenantId = currentWorkspace?.id;
  const userId = user?.id;
  
  const {
    data: fetchedNotifications = [],
    isLoading,
    refetch
  } = useNotifications({
    user_id: userId,
    tenant_id: tenantId
  });
  
  // Use externally provided notifications or fetched ones
  const notifications = externalNotifications || fetchedNotifications;
  
  const unreadCount = notifications.filter(n => !n.read_at).length;
  
  const markAllAsMutation = useMarkAllNotificationsAsRead();
  
  const handleMarkAllAsRead = async () => {
    if (externalOnMarkAllAsRead) {
      await externalOnMarkAllAsRead();
      return;
    }
    
    if (!userId || !tenantId) return;
    
    await markAllAsMutation.mutateAsync({
      userId,
      tenantId
    });
  };

  // Ensure externalMarkAsRead is a function
  const markAsReadHandler = externalMarkAsRead || (async () => {});
  
  // Refresh notifications when the workspace changes
  useEffect(() => {
    if (tenantId && !externalNotifications) {
      refetch();
    }
  }, [tenantId, refetch, externalNotifications]);
  
  // Poll for new notifications
  useEffect(() => {
    if (externalNotifications) return; // Skip polling if notifications are provided externally
    
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications', { user_id: userId, tenant_id: tenantId }] });
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [userId, tenantId, queryClient, externalNotifications]);
  
  if (isLoading && !externalNotifications) {
    return <NotificationCenterLoading />;
  }
  
  if (notifications.length === 0) {
    return <NotificationCenterEmptyState />;
  }
  
  return (
    <div className="flex flex-col h-full">
      <NotificationCenterHeader
        unreadCount={unreadCount}
        onMarkAllAsRead={handleMarkAllAsRead}
        isMarking={markAllAsMutation.isPending}
      />
      <div className="flex-1 overflow-y-auto">
        <NotificationCenterTabs
          notifications={notifications}
          markAsRead={markAsReadHandler}
          onDelete={externalOnDelete}
          unreadCount={unreadCount}
          value={activeFilter}
          onValueChange={setActiveFilter}
          userId={userId || ''}
        />
      </div>
    </div>
  );
};

export default NotificationCenterContent;
