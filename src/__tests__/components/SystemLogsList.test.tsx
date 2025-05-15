
import React from 'react';
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
      created_at: '2023-06-01T10:00:00Z',
      tenant_id: 'tenant-1',
      context: { error: 'Timeout' }
    },
    {
      id: '2',
      module: 'auth',
      event: 'login_failed',
      description: 'User login attempt failed',
      created_at: '2023-06-01T09:30:00Z',
      tenant_id: 'tenant-1',
      context: { userId: '123' }
    }
  ];
  
  test('renders loading state correctly', () => {
    render(<SystemLogsList logs={[]} isLoading={true} onViewLog={mockOnViewLog} />);
    
    // Should show loading skeleton
    expect(screen.getByText('System Logs')).toBeInTheDocument();
    expect(screen.getAllByRole('cell')).toHaveLength(0); // No table rows should be visible
  });
  
  test('renders empty state when no logs', () => {
    render(<SystemLogsList logs={[]} isLoading={false} onViewLog={mockOnViewLog} />);
    
    expect(screen.getByText('No logs found. Adjust your filters or try again.')).toBeInTheDocument();
  });
  
  test('renders logs when provided', () => {
    render(<SystemLogsList logs={mockLogs} isLoading={false} onViewLog={mockOnViewLog} />);
    
    // Check table headers
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Module')).toBeInTheDocument();
    expect(screen.getByText('Event')).toBeInTheDocument();
    
    // Check log content
    expect(screen.getByText('api')).toBeInTheDocument();
    expect(screen.getByText('auth')).toBeInTheDocument();
    expect(screen.getByText('api_call_failed')).toBeInTheDocument();
    expect(screen.getByText('login_failed')).toBeInTheDocument();
  });
  
  test('calls onViewLog when view button is clicked', () => {
    render(<SystemLogsList logs={mockLogs} isLoading={false} onViewLog={mockOnViewLog} />);
    
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);
    
    expect(mockOnViewLog).toHaveBeenCalledWith(mockLogs[0]);
  });
});
