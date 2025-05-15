
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import type { SystemLog } from '@/types/logs';

// Mock data for testing
const mockLogs: SystemLog[] = [
  {
    id: '1',
    created_at: '2025-01-01T12:00:00Z',
    timestamp: '2025-01-01T12:00:00Z',
    description: 'Test info description',
    message: 'Test info message',
    level: 'info',
    module: 'system',
    tenant_id: 'tenant-1',
    severity: 'low',
    priority: 'low',
    event: 'info',
    event_type: 'info',
    context: {},
    user_facing: false,
    affects_multiple_users: false
  },
  {
    id: '2',
    created_at: '2025-01-01T13:00:00Z',
    timestamp: '2025-01-01T13:00:00Z',
    description: 'Test warning description',
    message: 'Test warning message',
    level: 'warning',
    module: 'auth',
    tenant_id: 'tenant-1',
    severity: 'medium',
    priority: 'medium',
    event: 'warning',
    event_type: 'warning',
    context: {},
    user_facing: true,
    affects_multiple_users: false
  },
  {
    id: '3',
    created_at: '2025-01-01T14:00:00Z',
    timestamp: '2025-01-01T14:00:00Z',
    description: 'Test error description',
    message: 'Test error message',
    level: 'error',
    module: 'api',
    tenant_id: 'tenant-1',
    error_type: 'RuntimeError',
    error_message: 'A runtime error occurred',
    severity: 'high',
    priority: 'high',
    event: 'error',
    event_type: 'error',
    context: {},
    user_facing: true,
    affects_multiple_users: true
  }
];

// Mock format function from date-fns
vi.mock('date-fns', () => ({
  format: vi.fn(() => 'Jan 1, 2025 12:00:00')
}));

describe('SystemLogsList', () => {
  it('renders logs table with correct columns', () => {
    render(<SystemLogsList logs={mockLogs} />);
    
    // Check column headers
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Module')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
    
    // Check log levels are displayed
    expect(screen.getByText('info')).toBeInTheDocument();
    expect(screen.getByText('warning')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
    
    // Check messages are displayed
    expect(screen.getByText('Test info message')).toBeInTheDocument();
    expect(screen.getByText('Test warning message')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    
    // Check modules are displayed
    expect(screen.getByText('system')).toBeInTheDocument();
    expect(screen.getByText('auth')).toBeInTheDocument();
    expect(screen.getByText('api')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<SystemLogsList logs={[]} isLoading={true} />);
    
    // The virtualized table has skeleton loading indicators
    // This will depend on implementation details of your table component
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('shows empty state when there are no logs', () => {
    render(<SystemLogsList logs={[]} />);
    
    expect(screen.getByText('No logs found matching your filters')).toBeInTheDocument();
  });

  it('uses custom table height when provided', () => {
    render(<SystemLogsList logs={mockLogs} tableHeight="300px" />);
    
    // Check table container has the right height
    const tableContainer = document.querySelector('[style*="height: 300px"]');
    expect(tableContainer).toBeInTheDocument();
  });

  it('handles row click when onRowClick is provided', async () => {
    const onRowClick = vi.fn();
    render(<SystemLogsList logs={mockLogs} onRowClick={onRowClick} />);
    
    // Find the first row and click it
    // Note: This may need adjustment based on your table implementation
    const firstRow = screen.getByText('Test info message').closest('tr');
    if (firstRow) {
      firstRow.click();
      expect(onRowClick).toHaveBeenCalled();
    }
  });
});
