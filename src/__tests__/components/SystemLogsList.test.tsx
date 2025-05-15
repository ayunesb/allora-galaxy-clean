
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SystemLogsList } from '@/components/admin/logs/SystemLogsList';
import type { SystemLog } from '@/types/logs';

describe('SystemLogsList', () => {
  const mockLogs: SystemLog[] = [
    {
      id: '1',
      created_at: '2025-01-01T12:00:00Z',
      level: 'info',
      module: 'system',
      event: 'user_login',
      message: 'User logged in',
      description: 'User successfully authenticated',
      tenant_id: 'tenant-1'
    },
    {
      id: '2',
      created_at: '2025-01-01T12:30:00Z',
      level: 'warning',
      module: 'auth',
      event: 'failed_login',
      message: 'Failed login attempt',
      description: 'Invalid credentials provided',
      tenant_id: 'tenant-1'
    },
    {
      id: '3',
      created_at: '2025-01-01T13:00:00Z',
      level: 'error',
      module: 'database',
      event: 'query_failed',
      message: 'Database query failed',
      error_type: 'SQL_ERROR',
      description: 'Syntax error in query',
      severity: 'high',
      tenant_id: 'tenant-1'
    },
  ];

  it('renders the logs list', () => {
    render(<SystemLogsList logs={mockLogs} isLoading={false} />);
    expect(screen.getByText('User logged in')).toBeInTheDocument();
    expect(screen.getByText('Failed login attempt')).toBeInTheDocument();
    expect(screen.getByText('Database query failed')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<SystemLogsList logs={[]} isLoading={true} />);
    expect(screen.getByTestId('logs-loading')).toBeInTheDocument();
  });

  it('shows empty state when no logs are available', () => {
    render(<SystemLogsList logs={[]} isLoading={false} />);
    expect(screen.getByText(/No logs found/i)).toBeInTheDocument();
  });
});
