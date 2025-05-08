
import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '@/lib/notifications/useNotifications';
import { NotificationContent } from '@/types/notifications';

export const useNotificationData = (tabFilter: string, textFilter: string | null) => {
  const [notifications, setNotifications] = useState<NotificationContent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { getNotifications } = useNotifications();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications(tabFilter === 'unread', textFilter);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [getNotifications, tabFilter, textFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, loading, fetchNotifications };
};
