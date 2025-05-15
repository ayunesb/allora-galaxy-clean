
import React from 'react';
import { render } from '@testing-library/react';
import ErrorTrendsChart from '@/components/admin/errors/ErrorTrendsChart';
import { vi } from 'vitest';

// Mock the chart utility function
vi.mock('@/components/admin/errors/utils/chartDataUtils', () => ({
  prepareErrorTrendsData: vi.fn(() => [
    { date: '2023-01-01', total: 10, critical: 2, high: 3, medium: 3, low: 2 }
  ])
}));

// Mock chart components
vi.mock('@/components/admin/errors/charts/ChartLoadingState', () => ({
  default: () => <div data-testid="chart-loading-state">Loading</div>
}));

vi.mock('@/components/admin/errors/charts/ErrorRateChart', () => ({
  default: () => <div data-testid="error-rate-chart">Rate Chart</div>
}));

vi.mock('@/components/admin/errors/charts/ErrorSeverityChart', () => ({
  default: () => <div data-testid="error-severity-chart">Severity Chart</div>
}));

vi.mock('@/components/admin/errors/charts/FullErrorChart', () => ({
  default: () => <div data-testid="full-error-chart">Full Chart</div>
}));

describe('ErrorTrendsChart', () => {
  const mockLogs = [
    {
      id: 'log-1',
      level: 'error',
      severity: 'high',
      created_at: '2023-01-01T10:00:00Z',
      timestamp: '2023-01-01T10:00:00Z',
      module: 'test',
      description: 'Test error',
      message: 'Test error',
      tenant_id: 'tenant-1',
      event: 'error',
      event_type: 'error',
      context: 'test',
      error_type: 'TestError',
      error_message: 'Test error occurred'
    }
  ];
  
  const dateRange = { from: new Date('2023-01-01'), to: new Date('2023-01-31') };
  
  it('renders the loading state when isLoading is true', () => {
    const { getByTestId } = render(
      <ErrorTrendsChart 
        logs={[]} 
        dateRange={dateRange} 
        isLoading={true} 
      />
    );
    expect(getByTestId('chart-loading-state')).toBeInTheDocument();
  });
  
  it('renders the rate chart when type is "rate"', () => {
    const { getByTestId } = render(
      <ErrorTrendsChart 
        logs={mockLogs} 
        dateRange={dateRange} 
        isLoading={false}
        type="rate"
      />
    );
    expect(getByTestId('error-rate-chart')).toBeInTheDocument();
  });
  
  it('renders the severity chart when type is "severity"', () => {
    const { getByTestId } = render(
      <ErrorTrendsChart 
        logs={mockLogs} 
        dateRange={dateRange} 
        isLoading={false}
        type="severity"
      />
    );
    expect(getByTestId('error-severity-chart')).toBeInTheDocument();
  });
  
  it('renders the full chart by default', () => {
    const { getByTestId } = render(
      <ErrorTrendsChart 
        logs={mockLogs} 
        dateRange={dateRange} 
        isLoading={false}
      />
    );
    expect(getByTestId('full-error-chart')).toBeInTheDocument();
  });
});
