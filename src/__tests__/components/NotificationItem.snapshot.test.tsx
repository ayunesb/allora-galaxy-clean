
import React from 'react';
import { render } from '@testing-library/react';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { NotificationType } from '@/types/shared';

describe('NotificationItem Component', () => {
  // Mock handlers
  const mockMarkAsRead = jest.fn();
  const mockDelete = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders unread notification correctly', () => {
    const notification = {
      id: 'test-1',
      title: 'New Feature Available',
      message: 'Check out our new dashboard features!',
      timestamp: '2023-05-01T12:00:00Z',
      type: 'info' as NotificationType,
      read: false
    };

    const { container, getByText } = render(
      <NotificationItem
        notification={notification}
        onMarkAsRead={mockMarkAsRead}
        onDelete={mockDelete}
      />
    );

    expect(getByText('New Feature Available')).toBeInTheDocument();
    expect(getByText('Check out our new dashboard features!')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('renders read notification correctly', () => {
    const notification = {
      id: 'test-2',
      title: 'System Update Complete',
      message: 'The system has been updated successfully.',
      timestamp: '2023-05-02T10:30:00Z',
      type: 'success' as NotificationType,
      read: true
    };

    const { container, queryByText } = render(
      <NotificationItem
        notification={notification}
        onMarkAsRead={mockMarkAsRead}
        onDelete={mockDelete}
      />
    );

    expect(queryByText('Mark as read')).not.toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('renders error notification correctly', () => {
    const notification = {
      id: 'test-3',
      title: 'Error Detected',
      message: 'There was a problem processing your request.',
      timestamp: '2023-05-03T15:45:00Z',
      type: 'error' as NotificationType,
      read: false
    };

    const { container } = render(
      <NotificationItem
        notification={notification}
        onMarkAsRead={mockMarkAsRead}
        onDelete={mockDelete}
      />
    );

    expect(container).toMatchSnapshot();
  });
});
