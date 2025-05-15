
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorTrendsChart from '@/components/admin/errors/ErrorTrendsChart';
import { SystemLog } from '@/types/logs';

// Mock the recharts library
vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
    Line: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    XAxis: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    YAxis: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CartesianGrid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Legend: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

describe('ErrorTrendsChart', () => {
  const mockLogs: SystemLog[] = [
    {
      id: '1',
      tenant_id: 'tenant-1',
      level: 'error',
      message: 'Test error 1',
      created_at: '2023-01-01T12:00:00Z',
      severity: 'high',
      details: { source: 'test' },
      timestamp: '2023-01-01T12:00:00Z'
    },
    {
      id: '2',
      tenant_id: 'tenant-1',
      level: 'error',
      message: 'Test error 2',
      created_at: '2023-01-02T12:00:00Z',
      severity: 'critical',
      details: { source: 'test' },
      timestamp: '2023-01-02T12:00:00Z'
    },
    {
      id: '3',
      tenant_id: 'tenant-1',
      level: 'error',
      message: 'Test error 3',
      created_at: '2023-01-03T12:00:00Z',
      severity: 'medium',
      details: { source: 'test' },
      timestamp: '2023-01-03T12:00:00Z'
    }
  ];

  const defaultDateRange = {
    from: new Date('2023-01-01'),
    to: new Date('2023-01-03')
  };

  it('renders the chart with logs data', () => {
    render(<ErrorTrendsChart 
      logs={mockLogs} 
      dateRange={defaultDateRange} 
      isLoading={false} 
    />);
    
    const chart = screen.getByTestId('line-chart');
    expect(chart).toBeInTheDocument();
  });

  it('displays loading skeleton when isLoading is true', () => {
    render(<ErrorTrendsChart 
      logs={[]} 
      dateRange={defaultDateRange} 
      isLoading={true} 
    />);
    
    const skeleton = screen.getByTestId('chart-loading');
    expect(skeleton).toBeInTheDocument();
    
    const chart = screen.queryByTestId('line-chart');
    expect(chart).not.toBeInTheDocument();
  });

  it('displays empty state when there are no logs', () => {
    render(<ErrorTrendsChart 
      logs={[]} 
      dateRange={defaultDateRange} 
      isLoading={false}
    />);
    
    const emptyState = screen.getByText('No error data available');
    expect(emptyState).toBeInTheDocument();
  });

  it('filters logs by date range if provided', () => {
    const dateRange = {
      from: new Date('2023-01-02'),
      to: new Date('2023-01-03')
    };
    
    render(<ErrorTrendsChart 
      logs={mockLogs} 
      dateRange={dateRange}
      isLoading={false}
    />);
    
    // Chart should still render with filtered data
    const chart = screen.getByTestId('line-chart');
    expect(chart).toBeInTheDocument();
  });
});
