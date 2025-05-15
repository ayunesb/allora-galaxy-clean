
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import ErrorTrendsChart from '@/components/admin/errors/ErrorTrendsChart';
import { SystemLog, LogLevel } from '@/types/logs';

// Properly typed mock data for SystemLog
const createMockLogs = (): SystemLog[] => {
  const levels: LogLevel[] = ['info', 'warning', 'error'];
  
  return [
    {
      id: '1',
      created_at: '2023-01-01T10:00:00Z',
      timestamp: '2023-01-01T10:00:00Z',
      module: 'system',
      level: 'error',
      event: 'error_occurred',
      event_type: 'system_error',
      description: 'System error occurred',
      message: 'System error occurred',
      tenant_id: 'tenant-1',
      severity: 'high',
      error_type: 'system_failure',
      user_id: 'user-1',
      context: { details: 'Error details' },
      metadata: { data: 'Additional data' },
      request_id: 'req-1',
      error_message: 'System failed',
    },
    {
      id: '2',
      created_at: '2023-01-02T10:00:00Z',
      timestamp: '2023-01-02T10:00:00Z',
      module: 'auth',
      level: 'warning',
      event: 'login_failed',
      description: 'Login attempt failed',
      tenant_id: 'tenant-1'
    },
    {
      id: '3',
      created_at: '2023-01-03T10:00:00Z',
      timestamp: '2023-01-03T10:00:00Z',
      module: 'api',
      level: 'info',
      event: 'api_call',
      description: 'API was called',
      tenant_id: 'tenant-1'
    },
    {
      id: '4',
      created_at: '2023-01-04T10:00:00Z',
      timestamp: '2023-01-04T10:00:00Z',
      module: 'database',
      level: 'error',
      event: 'query_failed',
      description: 'Database query failed',
      tenant_id: 'tenant-1',
      error_type: 'query_error'
    },
    {
      id: '5',
      created_at: '2023-01-05T10:00:00Z',
      timestamp: '2023-01-05T10:00:00Z',
      module: 'system',
      level: 'info',
      event: 'system_started',
      description: 'System started successfully',
      tenant_id: 'tenant-1'
    }
  ];
};

describe('ErrorTrendsChart', () => {
  const mockDateRange = { from: new Date('2023-01-01'), to: new Date('2023-01-31') };
  
  it('renders the chart when provided with logs', () => {
    render(
      <ErrorTrendsChart
        logs={createMockLogs()}
        dateRange={mockDateRange}
        isLoading={false}
        type="full"
      />
    );
    
    expect(document.querySelector('svg')).toBeInTheDocument();
  });
  
  it('renders a loading state when isLoading is true', () => {
    render(
      <ErrorTrendsChart
        logs={[]}
        dateRange={mockDateRange}
        isLoading={true}
      />
    );
    
    expect(document.querySelector('.chart-loading-skeleton')).toBeInTheDocument();
  });
  
  it('renders a rate chart when type is rate', () => {
    render(
      <ErrorTrendsChart
        logs={createMockLogs()}
        dateRange={mockDateRange}
        isLoading={false}
        type="rate"
      />
    );
    
    expect(document.querySelector('svg')).toBeInTheDocument();
  });
  
  it('renders a severity chart when type is severity', () => {
    render(
      <ErrorTrendsChart
        logs={createMockLogs()}
        dateRange={mockDateRange}
        isLoading={false}
        type="severity"
      />
    );
    
    expect(document.querySelector('svg')).toBeInTheDocument();
  });
});
