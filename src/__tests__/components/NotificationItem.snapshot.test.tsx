
// Mock React for component testing
import * as React from 'react';
import { render } from '@testing-library/react';

// Import types and components
import { NotificationType } from '@/types/shared';
import { NotificationItem } from '@/components/notifications/NotificationItem';

// Mock the format function since it's likely used in NotificationItem
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '5 minutes ago'),
  parseISO: jest.fn(() => new Date()),
}));

// Setup renderer for snapshot testing
jest.mock('react-test-renderer', () => ({
  act: jest.fn((callback) => callback()),
  create: jest.fn(),
}));

describe('NotificationItem', () => {
  // Mock the current time for consistent snapshots
  jest.useFakeTimers().setSystemTime(new Date('2023-01-01').getTime());
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render correctly with default props', () => {
    const notification = {
      id: '123',
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'info' as NotificationType,
      created_at: '2023-01-01T00:00:00Z',
      read_at: null,
    };
    
    const { container } = render(
      <NotificationItem 
        notification={notification}
        onMarkAsRead={() => {}}
      />
    );
    
    expect(container).toMatchSnapshot();
  });
  
  it('should handle different notification types', () => {
    const types: NotificationType[] = ['info', 'success', 'warning', 'error'];
    
    types.forEach(type => {
      const notification = {
        id: `${type}-123`,
        title: `${type.toUpperCase()} Notification`,
        message: `This is a ${type} notification`,
        type: type as NotificationType,
        created_at: '2023-01-01T00:00:00Z',
        read_at: null,
      };
      
      const { container } = render(
        <NotificationItem 
          notification={notification}
          onMarkAsRead={() => {}}
        />
      );
      
      expect(container).toMatchSnapshot();
    });
  });
  
  it('should render action button when actionUrl and actionLabel are provided', () => {
    const notification = {
      id: 'action-123',
      title: 'Notification with Action',
      message: 'This notification has an action button',
      type: 'info' as NotificationType,
      created_at: '2023-01-01T00:00:00Z',
      read_at: null,
      action_url: 'https://example.com',
      action_label: 'Visit',
    };
    
    const { container } = render(
      <NotificationItem 
        notification={notification}
        onMarkAsRead={() => {}}
      />
    );
    
    expect(container).toMatchSnapshot();
  });
});
