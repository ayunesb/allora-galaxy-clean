
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import { SystemLog } from '@/types/shared'; // Updated to use shared type

describe('SystemLogsList Component', () => {
  const mockLogs: SystemLog[] = [
    {
      id: '1',
      created_at: '2023-05-01T12:00:00Z',
      level: 'info',
      module: 'system',
      event: 'system_start', // Added required field
      message: 'System started successfully',
      description: 'System started successfully' // Kept for backward compatibility
    },
    {
      id: '2',
      created_at: '2023-05-01T12:05:00Z',
      level: 'warning',
      module: 'auth',
      event: 'failed_login', // Added required field
      message: 'Failed login attempt',
      description: 'Failed login attempt' // Kept for backward compatibility
    },
    {
      id: '3',
      created_at: '2023-05-01T12:10:00Z',
      level: 'error',
      module: 'database',
      event: 'connection_error', // Added required field
      message: 'Database connection failed',
      error_type: 'Connection timeout', // Added field for error handling
      description: 'Database connection failed', // Kept for backward compatibility
      severity: 'high' // Added for compatibility
    }
  ];

  const mockOnViewLog = vi.fn();

  test('renders logs correctly', () => {
    render(
      <SystemLogsList 
        logs={mockLogs} 
        isLoading={false} 
        onViewLog={mockOnViewLog} 
      />
    );
    
    expect(screen.getByText('System started successfully')).toBeInTheDocument();
    expect(screen.getByText('Failed login attempt')).toBeInTheDocument();
    expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    
    // Check levels are displayed correctly
    expect(screen.getByText('info')).toBeInTheDocument();
    expect(screen.getByText('warning')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
    
    // Check modules are displayed correctly
    expect(screen.getByText('system')).toBeInTheDocument();
    expect(screen.getByText('auth')).toBeInTheDocument();
    expect(screen.getByText('database')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    render(<SystemLogsList logs={[]} isLoading={true} />);
    
    // Should show skeletons for loading state
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test('shows empty state message', () => {
    const emptyMessage = 'No logs found';
    render(
      <SystemLogsList 
        logs={[]} 
        isLoading={false} 
        emptyMessage={emptyMessage} 
      />
    );
    
    expect(screen.getByText(emptyMessage)).toBeInTheDocument();
  });

  test('shows error state', () => {
    const error = new Error('Failed to load logs');
    render(
      <SystemLogsList 
        logs={[]} 
        isLoading={false} 
        error={error} 
      />
    );
    
    expect(screen.getByText(/Failed to load logs/i)).toBeInTheDocument();
  });

  test('calls onViewLog when view button is clicked', () => {
    render(
      <SystemLogsList 
        logs={mockLogs} 
        isLoading={false} 
        onViewLog={mockOnViewLog} 
      />
    );
    
    const viewButtons = screen.getAllByRole('button');
    fireEvent.click(viewButtons[0]);
    
    expect(mockOnViewLog).toHaveBeenCalledWith(mockLogs[0]);
  });
});
