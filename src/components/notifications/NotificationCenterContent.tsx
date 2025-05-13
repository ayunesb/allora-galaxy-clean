
import { useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useEffect } from 'react';
import { useNotifications, useMarkAllNotificationsAsRead } from '@/services/notificationService';
import NotificationCenterEmptyState from './NotificationCenterEmptyState';
import NotificationCenterHeader from './NotificationCenterHeader';
import NotificationCenterLoading from './NotificationCenterLoading';
import NotificationList from './NotificationList';

const NotificationCenterContent = () => {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspace();
  const userId = ''; // TODO: Get from auth context
  
  const tenantId = currentWorkspace?.id;
  
  const {
    data: notifications = [],
    isLoading,
    refetch
  } = useNotifications({
    user_id: userId,
    tenant_id: tenantId,
    limit: 20
  });
  
  const unreadCount = notifications.filter(n => !n.read_at).length;
  
  const markAllAsMutation = useMarkAllNotificationsAsRead();
  
  const handleMarkAllAsRead = async () => {
    if (!userId || !tenantId) return;
    
    await markAllAsMutation.mutateAsync({
      userId,
      tenantId
    });
  };
  
  // Refresh notifications when the workspace changes
  useEffect(() => {
    if (tenantId) {
      refetch();
    }
  }, [tenantId, refetch]);
  
  // Poll for new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications', { user_id: userId, tenant_id: tenantId }] });
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [userId, tenantId, queryClient]);
  
  if (isLoading) {
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
        <NotificationList notifications={notifications} userId={userId} />
      </div>
    </div>
  );
};

export default NotificationCenterContent;
