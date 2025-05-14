
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NotificationsProvider } from '@/context/notifications/NotificationsProvider';
import { useNotifications } from '@/hooks/useNotifications';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } }
      })
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'notification-1',
            title: 'Test Notification',
            message: 'This is a test notification',
            type: 'info',
            read_at: null,
            created_at: new Date().toISOString()
          }
        ],
        error: null
      })
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
    })
  }
}));

// Test component that uses the notifications hook
const TestComponent = () => {
  const { notifications, unreadCount } = useNotifications();
  return (
    <div>
      <div data-testid="notification-count">{notifications.length}</div>
      <div data-testid="unread-count">{unreadCount}</div>
    </div>
  );
};

describe('NotificationsProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide notifications context to children', async () => {
    render(
      <NotificationsProvider>
        <TestComponent />
      </NotificationsProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('notification-count').textContent).toBe('1');
      expect(screen.getByTestId('unread-count').textContent).toBe('1');
    });
  });
});
