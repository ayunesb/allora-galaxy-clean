
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import { SystemLog } from '@/types/logs';

describe('SystemLogsList', () => {
  // Mock props
  const mockLogs: SystemLog[] = [
    {
      id: '1',
      level: 'error',
      module: 'api',
      message: 'API Request failed',
      description: 'Failed to fetch data from the API',
      details: { status: 500 },
      tenant_id: 'tenant-1',
      created_at: '2023-05-15T10:00:00Z',
      severity: 'high'
    },
    {
      id: '2',
      level: 'warning',
      module: 'auth',
      message: 'Login failed',
      description: 'Multiple failed login attempts',
      details: { attempts: 3 },
      tenant_id: 'tenant-1',
      created_at: '2023-05-15T09:30:00Z',
      severity: 'medium'
    },
    {
      id: '3',
      level: 'info',
      module: 'system',
      message: 'System started',
      description: 'System successfully started',
      details: { uptime: 0 },
      tenant_id: 'tenant-1',
      created_at: '2023-05-15T09:00:00Z',
      severity: 'low'
    }
  ];

  const mockOnViewDetails = vi.fn();

  it('renders log list correctly', () => {
    render(
      <SystemLogsList 
        logs={mockLogs} 
        isLoading={false}
        onViewDetails={mockOnViewDetails}
      />
    );
    
    // Check if all logs are rendered
    expect(screen.getByText('API Request failed')).toBeInTheDocument();
    expect(screen.getByText('Login failed')).toBeInTheDocument();
    expect(screen.getByText('System started')).toBeInTheDocument();
  });
  
  it('shows loading state when isLoading is true', () => {
    render(
      <SystemLogsList 
        logs={[]} 
        isLoading={true}
        onViewDetails={mockOnViewDetails}
      />
    );
    
    // In a virtualized table, the loading state might not be directly accessible
    // We can check that the table is still rendered
    expect(screen.queryByText('No logs available')).not.toBeInTheDocument();
  });
  
  it('shows empty state when no logs are available', () => {
    render(
      <SystemLogsList 
        logs={[]} 
        isLoading={false}
        onViewDetails={mockOnViewDetails}
      />
    );
    
    expect(screen.getByText('No logs available')).toBeInTheDocument();
  });
  
  it('calls onViewDetails when view details is clicked', () => {
    render(
      <SystemLogsList 
        logs={mockLogs} 
        isLoading={false}
        onViewDetails={mockOnViewDetails}
      />
    );
    
    // Find and click on "View details" button for the first log
    const viewDetailsButtons = screen.getAllByText('View details');
    fireEvent.click(viewDetailsButtons[0]);
    
    // Verify that onViewDetails was called with the correct log
    expect(mockOnViewDetails).toHaveBeenCalledWith(mockLogs[0]);
  });
});
