// This file is kept for backward compatibility
// It re-exports the refactored components

// Export types
export type {
  Notification,
  NotificationsContextValue,
} from "./notifications/types";

// Export context
export { default as NotificationsContext } from "./notifications/NotificationsContext";

// Export provider and hook
export { NotificationsProvider } from "./notifications/NotificationsProvider";
export { useNotifications } from "./notifications/useNotifications";

// Re-export utility functions for backward compatibility
export {
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteUserNotification,
} from "./notifications/notificationUtils";
