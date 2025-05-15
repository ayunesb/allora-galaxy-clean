
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';

describe('SystemLogsList', () => {
  const mockOnViewLog = vi.fn();
  
  const mockLogs = [
    {
      id: '1',
      module: 'api',
      event: 'api_call_failed',
      description: 'Failed to call external API',
      message: 'API Error',
      created_at: '2023-06-01T10:00:00Z',
      timestamp: '2023-06-01T10:00:00Z',
      tenant_id: 'tenant-1',
      level: 'error',
      context: { error: 'Timeout' },
      metadata: { severity: 'high' },
      event_type: 'error',
      severity: 'high',
      request_id: 'req-123'
    },
    {
      id: '2',
      module: 'auth',
      event: 'login_failed',
      description: 'User login attempt failed',
      message: 'Auth Error',
      created_at: '2023-06-01T09:30:00Z',
      timestamp: '2023-06-01T09:30:00Z',
      tenant_id: 'tenant-1',
      level: 'warning',
      context: { userId: '123' },
      metadata: { severity: 'medium' },
      event_type: 'warning',
      severity: 'medium',
      request_id: 'req-456'
    }
  ];
  
  it('renders loading state correctly', () => {
    render(<SystemLogsList logs={[]} isLoading={true} onViewLog={mockOnViewLog} />);
    
    // Should show loading skeleton
    expect(screen.getByText(/system logs/i)).toBeInTheDocument();
    expect(screen.queryAllByRole('row').length).toBeLessThan(mockLogs.length + 1); // +1 for header row
  });
  
  it('renders empty state when no logs', () => {
    render(<SystemLogsList logs={[]} isLoading={false} onViewLog={mockOnViewLog} />);
    
    expect(screen.getByText(/no logs found/i)).toBeInTheDocument();
  });
  
  it('renders logs when provided', () => {
    render(<SystemLogsList logs={mockLogs} isLoading={false} onViewLog={mockOnViewLog} />);
    
    // Check table headers
    expect(screen.getByText(/time/i)).toBeInTheDocument();
    expect(screen.getByText(/module/i)).toBeInTheDocument();
    expect(screen.getByText(/event/i)).toBeInTheDocument();
    
    // Check log content
    expect(screen.getByText('api')).toBeInTheDocument();
    expect(screen.getByText('auth')).toBeInTheDocument();
    expect(screen.getByText('api_call_failed')).toBeInTheDocument();
    expect(screen.getByText('login_failed')).toBeInTheDocument();
  });
  
  it('calls onViewLog when view button is clicked', () => {
    render(<SystemLogsList logs={mockLogs} isLoading={false} onViewLog={mockOnViewLog} />);
    
    const viewButtons = screen.getAllByText(/view/i);
    fireEvent.click(viewButtons[0]);
    
    expect(mockOnViewLog).toHaveBeenCalledWith(mockLogs[0]);
  });

  it('formats timestamps correctly', () => {
    render(<SystemLogsList logs={mockLogs} isLoading={false} onViewLog={mockOnViewLog} />);
    
    // We're expecting some date format here, exact format may vary based on implementation
    const dateElements = screen.getAllByText(/\d{1,2}:\d{2}/);
    expect(dateElements.length).toBeGreaterThan(0);
  });
});
