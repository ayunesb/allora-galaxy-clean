
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import ErrorTrendsChart from '@/components/admin/errors/ErrorTrendsChart';
import { sub } from 'date-fns';
// Remove unused import addDays
import { mockErrorLogs } from '../mocks/errorLogsMock';

// Mock chart components
vi.mock('@/components/admin/errors/charts/ChartLoadingState', () => ({
  default: () => <div data-testid="chart-loading-state">Loading chart...</div>
}));

vi.mock('@/components/admin/errors/charts/ErrorRateChart', () => ({
  default: ({ data }: any) => <div data-testid="error-rate-chart">Rate Chart with {data.length} points</div>
}));

vi.mock('@/components/admin/errors/charts/ErrorSeverityChart', () => ({
  default: ({ data }: any) => <div data-testid="error-severity-chart">Severity Chart with {data.length} points</div>
}));

vi.mock('@/components/admin/errors/charts/FullErrorChart', () => ({
  default: ({ data }: any) => <div data-testid="full-error-chart">Full Chart with {data.length} points</div>
}));

// Mock the prepareErrorTrendsData function
vi.mock('@/components/admin/errors/utils/chartDataUtils', () => ({
  prepareErrorTrendsData: () => [{ date: '2023-01-01', total: 5, critical: 1, high: 2, medium: 1, low: 1 }]
}));

describe('ErrorTrendsChart', () => {
  const defaultProps = {
    logs: mockErrorLogs,
    dateRange: {
      from: sub(new Date(), { days: 7 }),
      to: new Date()
    },
    isLoading: false
  };
  
  it('shows loading state when isLoading is true', () => {
    render(<ErrorTrendsChart {...defaultProps} isLoading={true} />);
    expect(screen.getByTestId('chart-loading-state')).toBeInTheDocument();
  });
  
  it('renders error rate chart when type is rate', () => {
    render(<ErrorTrendsChart {...defaultProps} type="rate" />);
    expect(screen.getByTestId('error-rate-chart')).toBeInTheDocument();
  });
  
  it('renders severity chart when type is severity', () => {
    render(<ErrorTrendsChart {...defaultProps} type="severity" />);
    expect(screen.getByTestId('error-severity-chart')).toBeInTheDocument();
  });
  
  it('renders full chart by default', () => {
    render(<ErrorTrendsChart {...defaultProps} />);
    expect(screen.getByTestId('full-error-chart')).toBeInTheDocument();
  });
});
