
import React from 'react';
import { render, screen } from '@testing-library/react';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { NotificationType } from '@/types/shared';

// Setup mock data for testing
const mockNotification = {
  id: '1',
  title: 'Test Notification',
  message: 'This is a test notification',
  type: 'info' as NotificationType,
  timestamp: '2023-01-01T00:00:00Z',
  read: false
};

describe('NotificationItem Component', () => {
  // Mock the toast function
  jest.mock('@/components/ui/use-toast', () => ({
    useToast: () => ({ toast: jest.fn() })
  }));
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders info notification correctly', () => {
    const { container } = render(
      <NotificationItem 
        notification={{
          ...mockNotification,
          type: 'info'
        }}
        onMarkAsRead={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    
    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    expect(screen.getByText('This is a test notification')).toBeInTheDocument();
    expect(container.querySelector('.bg-blue-100')).toBeInTheDocument();
  });
  
  it('renders success notification correctly', () => {
    const { container } = render(
      <NotificationItem 
        notification={{
          ...mockNotification,
          type: 'success'
        }}
        onMarkAsRead={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    
    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    expect(screen.getByText('This is a test notification')).toBeInTheDocument();
    expect(container.querySelector('.bg-green-100')).toBeInTheDocument();
  });
});
