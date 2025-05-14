
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import type { NotificationContent } from '@/types/notifications';

describe('NotificationItem Component Snapshot', () => {
  const baseNotification: NotificationContent = {
    id: 'notification-1',
    title: 'Test Notification',
    message: 'This is a test notification',
    type: 'info',
    timestamp: new Date().toISOString(),
    read: false
  };

  it('should match snapshot for unread info notification', () => {
    const { container } = render(
      <NotificationItem
        notification={baseNotification}
        onMarkAsRead={() => {}}
        onDelete={() => {}}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot for read info notification', () => {
    const readNotification = { ...baseNotification, read: true };
    const { container } = render(
      <NotificationItem
        notification={readNotification}
        onMarkAsRead={() => {}}
        onDelete={() => {}}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot for success notification', () => {
    const successNotification = { ...baseNotification, type: 'success' };
    const { container } = render(
      <NotificationItem
        notification={successNotification}
        onMarkAsRead={() => {}}
        onDelete={() => {}}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot for warning notification', () => {
    const warningNotification = { ...baseNotification, type: 'warning' };
    const { container } = render(
      <NotificationItem
        notification={warningNotification}
        onMarkAsRead={() => {}}
        onDelete={() => {}}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot for error notification', () => {
    const errorNotification = { ...baseNotification, type: 'error' };
    const { container } = render(
      <NotificationItem
        notification={errorNotification}
        onMarkAsRead={() => {}}
        onDelete={() => {}}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
