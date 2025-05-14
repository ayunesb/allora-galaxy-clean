
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { NotificationType } from '@/types/shared';
import { NotificationItem } from '@/components/notifications/NotificationItem';

// Mock the format function since it's likely used in NotificationItem
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '5 minutes ago'),
  parseISO: vi.fn(() => new Date()),
  format: vi.fn(() => 'Jan 1, 12:00 AM'),
}));

describe('NotificationItem', () => {
  // Mock the current time for consistent snapshots
  const originalDate = global.Date;
  
  beforeEach(() => {
    const mockDate = new Date('2023-01-01T00:00:00Z');
    global.Date = class extends originalDate {
      constructor() {
        super();
        return mockDate;
      }
    } as DateConstructor;
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    global.Date = originalDate;
  });
  
  it('should render correctly with default props', () => {
    const notification = {
      id: '123',
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'info' as NotificationType,
      timestamp: '2023-01-01T00:00:00Z',
      read: false,
      created_at: '2023-01-01T00:00:00Z'
    };
    
    const { container } = render(
      <NotificationItem 
        notification={notification}
        onMarkAsRead={() => Promise.resolve()}
        onDelete={() => Promise.resolve()}
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
        timestamp: '2023-01-01T00:00:00Z',
        read: false,
        created_at: '2023-01-01T00:00:00Z'
      };
      
      const { container } = render(
        <NotificationItem 
          notification={notification}
          onMarkAsRead={() => Promise.resolve()}
          onDelete={() => Promise.resolve()}
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
      timestamp: '2023-01-01T00:00:00Z',
      read: false,
      actionUrl: 'https://example.com',
      actionLabel: 'Visit',
      created_at: '2023-01-01T00:00:00Z'
    };
    
    const { container } = render(
      <NotificationItem 
        notification={notification}
        onMarkAsRead={() => Promise.resolve()}
        onDelete={() => Promise.resolve()}
      />
    );
    
    expect(container).toMatchSnapshot();
  });
});
