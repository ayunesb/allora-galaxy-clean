import { useState, useEffect, useCallback } from "react";
import { useNotifications } from "@/context/notifications/useNotifications";
import {
  Notification,
  NotificationContent,
  NotificationType,
} from "@/types/notifications";

export const useNotificationData = (tabFilter: string | null = null) => {
  const { notifications, markAllAsRead, markAsRead, deleteNotification } =
    useNotifications();

  const [loading, setLoading] = useState(false);
  const [filteredNotifications, setFilteredNotifications] = useState<
    NotificationContent[]
  >([]);
  const [error, setError] = useState<Error | null>(null);

  // Transform Notification[] to NotificationContent[]
  const transformNotifications = useCallback(() => {
    return notifications.map((notification: Notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.description || "",
      timestamp: notification.created_at,
      read: !!notification.is_read || !!notification.read_at,
      type: notification.type as NotificationType,
      action_url: notification.action_url,
      action_label: notification.action_label,
    }));
  }, [notifications]);

  // Filter notifications based on tab selection
  const filterNotifications = useCallback(() => {
    const transformed = transformNotifications();
    if (!tabFilter || tabFilter === "all") {
      setFilteredNotifications(transformed);
    } else if (tabFilter === "unread") {
      setFilteredNotifications(transformed.filter((n) => !n.read));
    } else {
      // Filter by notification type
      setFilteredNotifications(transformed.filter((n) => n.type === tabFilter));
    }
  }, [notifications, tabFilter, transformNotifications]);

  // Apply filters whenever notifications or tab filter changes
  useEffect(() => {
    filterNotifications();
  }, [notifications, tabFilter, filterNotifications]);

  // Add refresh function to handle loading state
  const refresh = async () => {
    setLoading(true);
    try {
      // We don't have a direct refresh function from context,
      // but we can implement actions like marking all as read
      await markAllAsRead();
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to refresh notifications"),
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    notifications: filteredNotifications,
    loading,
    error,
    refresh,
    markAsRead,
    deleteNotification,
  };
};
