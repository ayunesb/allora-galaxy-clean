
// Re-export from the context module
import { useNotifications } from '@/context/notifications/useNotifications';
import { NotificationsContextValue } from '@/context/notifications/types';

export { useNotifications };
export type { NotificationsContextValue };

export default useNotifications;
