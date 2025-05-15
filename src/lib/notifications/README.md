
# Allora OS Notification System

This directory contains the notification system for Allora OS.

## Overview

The notification system provides standardized ways to notify users about events, errors, and important information through various channels:

- Toast notifications (temporary UI notifications)
- Persistent notifications (stored in the database)
- System logs (for audit and debugging)

## Key Components

### Toast Notifications

The `toast.ts` module provides a variety of toast notification functions:

- `notify`: Base notification function
- `notifySuccess`: Success notification
- `notifyError`: Error notification
- `notifyWarning`: Warning notification
- `notifyInfo`: Information notification
- `notifyPromise`: Handle async operations with loading/success/error states
- `notifyAndLog`: Show toast notification and log to system logs

### Persistent Notifications

The `sendNotification.ts` module handles sending persistent notifications to users that are stored in the database:

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
import { notifySuccess, notifyError, notifyPromise } from '@/lib/notifications/toast';

// Success notification
notifySuccess('Operation completed successfully');

// Error notification
notifyError('Something went wrong', {
  description: 'Please try again later'
});

// Handle async operations with toast feedback
const promise = fetchData();
notifyPromise(promise, {
  loading: 'Loading data...',
  success: 'Data loaded successfully',
  error: 'Failed to load data'
});
```

### Toast with System Logging

```typescript
import { notifyAndLog } from '@/lib/notifications/toast';

// Show toast and log to system logs
await notifyAndLog(
  'api', // module
  'error', // level
  'API Error', // title
  'Failed to fetch data', // description
  'error', // toast type
  'tenant-123', // tenant ID
  { endpoint: '/api/data', statusCode: 500 } // additional context
);
```

### Persistent Notifications

```typescript
import { sendNotification } from '@/lib/notifications/sendNotification';

// Send a notification to a specific user
await sendNotification({
  title: 'New Message',
  description: 'You have received a new message',
  type: 'info',
  user_id: 'user-123',
  tenant_id: 'tenant-456',
  action_url: '/messages/123',
  action_label: 'View Message'
});
```

### Using the Context Provider

```tsx
import { useNotifications } from '@/hooks/useNotifications';

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
6. Log important notifications to system logs for audit trailing

## Testing

The notification system has comprehensive test coverage. See the test files in `__tests__/notifications` for examples.
