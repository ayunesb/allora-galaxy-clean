
import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorTrendsChart from '@/components/admin/errors/ErrorTrendsChart';
import type { SystemLog } from '@/types/logs';

// Mock the chart components
jest.mock('@/components/admin/errors/charts/ChartLoadingState', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-state" />
}));

jest.mock('@/components/admin/errors/charts/ErrorRateChart', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="error-rate-chart" data-items={props.data.length} />
}));

jest.mock('@/components/admin/errors/charts/ErrorSeverityChart', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="error-severity-chart" data-items={props.data.length} />
}));

jest.mock('@/components/admin/errors/charts/FullErrorChart', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="full-error-chart" data-items={props.data.length} />
}));

// Mock the chart data utils
jest.mock('@/components/admin/errors/utils/chartDataUtils', () => ({
  prepareErrorTrendsData: jest.fn(() => [
    { date: 'Jan 01', total: 10, critical: 2, high: 3, medium: 4, low: 1 },
    { date: 'Jan 02', total: 15, critical: 3, high: 4, medium: 5, low: 3 }
  ])
}));

describe('ErrorTrendsChart', () => {
  const mockLogs: SystemLog[] = [
    {
      id: '1',
      tenant_id: 'tenant1',
      level: 'error',
      module: 'database',
      message: 'Database error',
      created_at: '2023-01-01T00:00:00Z',
      severity: 'critical'
    },
    {
      id: '2',
      tenant_id: 'tenant1',
      level: 'warning',
      module: 'api',
      message: 'API warning',
      created_at: '2023-01-02T00:00:00Z',
      severity: 'medium'
    }
  ];

  const dateRange = { 
    from: new Date('2023-01-01'),
    to: new Date('2023-01-02')
  };

  it('should show loading state when isLoading is true', () => {
    render(
      <ErrorTrendsChart
        logs={mockLogs}
        dateRange={dateRange}
        isLoading={true}
        type="full"
      />
    );
    
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('should show error rate chart when type is rate', () => {
    render(
      <ErrorTrendsChart
        logs={mockLogs}
        dateRange={dateRange}
        isLoading={false}
        type="rate"
      />
    );
    
    expect(screen.getByTestId('error-rate-chart')).toBeInTheDocument();
  });

  it('should show severity chart when type is severity', () => {
    render(
      <ErrorTrendsChart
        logs={mockLogs}
        dateRange={dateRange}
        isLoading={false}
        type="severity"
      />
    );
    
    expect(screen.getByTestId('error-severity-chart')).toBeInTheDocument();
  });

  it('should show full chart by default', () => {
    render(
      <ErrorTrendsChart
        logs={mockLogs}
        dateRange={dateRange}
        isLoading={false}
      />
    );
    
    expect(screen.getByTestId('full-error-chart')).toBeInTheDocument();
  });
});
