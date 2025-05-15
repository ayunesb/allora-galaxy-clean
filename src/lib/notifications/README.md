
# Notification System

This directory contains the notification system for the application.

## Overview

The notification system provides standardized ways to notify users about events, errors, and important information through various channels:

- Toast notifications (temporary UI notifications)
- Persistent notifications (stored in the database)
- System logs (for audit and debugging)

## Key Components

### Toast Notifications (`toast.ts`)

The `toast.ts` module provides a variety of toast notification functions:

- `toast`: Base notification function
- `toast.success`: Success notification
- `toast.error`: Error notification
- `toast.warning`: Warning notification
- `toast.info`: Information notification
- `toast.loading`: Loading notification
- `toast.promise`: Handle async operations with loading/success/error states
- `notifyAndLog`: Show toast notification and log to system logs

### Persistent Notifications

The persistent notification system handles notifications that are stored in the database:

- `sendNotification`: Send a notification to a specific user
- `sendTenantNotification`: Send a notification to all users in a tenant

### Context Provider

The `NotificationsProvider` React context provider manages the notification state and provides methods to interact with notifications:

- View notifications
- Mark as read
- Delete notifications
- Count unread notifications

## Usage Examples

### Toast Notifications

```typescript
import { toast } from '@/lib/notifications/toast';

// Simple success notification
toast.success('Operation completed successfully');

// Error notification with title and description
toast.error({
  title: 'Failed to save',
  description: 'Please check your connection and try again'
});

// Info notification with custom duration
toast.info('New updates available', {
  duration: 5000
});

// Handle async operations with toast feedback
const promise = fetchData();
toast.promise(promise, {
  loading: 'Loading data...',
  success: 'Data loaded successfully',
  error: 'Failed to load data'
});
```

### Toast with System Logging

```typescript
import { notifyAndLog } from '@/lib/notifications/notifyAndLog';

// Show toast and log to system logs
await notifyAndLog(
  'api',                     // module
  'error',                   // level
  'API Error',               // title
  'Failed to fetch data',    // description
  'error',                   // toast type
  'tenant-123',              // tenant ID
  { endpoint: '/api/data', statusCode: 500 }  // additional context
);
```

### Using the Context Provider

```tsx
import { useNotifications } from '@/context/notifications';

function NotificationsBell() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    deleteNotification 
  } = useNotifications();

  return (
    <div>
      <span>Notifications ({unreadCount})</span>
      <ul>
        {notifications.map(notification => (
          <li key={notification.id}>
            {notification.title}
            <button onClick={() => markAsRead(notification.id)}>
              Mark as Read
            </button>
            <button onClick={() => deleteNotification(notification.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Best Practices

1. Use the most specific notification function for the context
2. Include actionable information in notifications when possible
3. Keep notification messages clear and concise
4. Use consistent tone and style across all notifications
5. Use appropriate notification types (success, error, warning, info)
6. For persistent notifications, provide clear actions when applicable
7. Consider notification priority and avoid overwhelming users
8. Use the notifyAndLog utility for important system events

## Configuration

The notification system can be configured through the application settings:

- Toast duration
- Maximum number of toasts visible at once
- Toast position (top-right, bottom-left, etc.)
- Notification sound options
- Auto-dismiss behavior
