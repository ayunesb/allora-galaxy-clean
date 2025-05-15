
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorTrendsChart from '@/components/admin/errors/ErrorTrendsChart';
import { prepareErrorTrendsData } from '@/components/admin/errors/utils/chartDataUtils';
import { addDays } from 'date-fns';
import type { SystemLog } from '@/types/logs';

// Mock chart data utility
vi.mock('@/components/admin/errors/utils/chartDataUtils', () => ({
  prepareErrorTrendsData: vi.fn(() => [
    { date: '2023-01-01', critical: 5, high: 10, medium: 2, low: 3, total: 20 },
    { date: '2023-01-02', critical: 2, high: 5, medium: 1, low: 2, total: 10 },
  ]),
}));

// Mock chart components
vi.mock('@/components/admin/errors/charts/ChartLoadingState', () => ({
  default: () => <div data-testid="chart-loading">Loading chart...</div>,
}));

vi.mock('@/components/admin/errors/charts/ErrorRateChart', () => ({
  default: ({ data }: any) => <div data-testid="error-rate-chart">Rate Chart: {data.length} items</div>,
}));

vi.mock('@/components/admin/errors/charts/ErrorSeverityChart', () => ({
  default: ({ data }: any) => <div data-testid="error-severity-chart">Severity Chart: {data.length} items</div>,
}));

vi.mock('@/components/admin/errors/charts/FullErrorChart', () => ({
  default: ({ data }: any) => <div data-testid="full-error-chart">Full Chart: {data.length} items</div>,
}));

describe('ErrorTrendsChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const dateRange = {
    from: new Date('2023-01-01'),
    to: new Date('2023-01-10')
  };

  const mockLogs: SystemLog[] = [
    {
      id: '1',
      level: 'error',
      message: 'API Error',
      module: 'api',
      created_at: '2023-01-01T10:00:00Z',
      tenant_id: 'tenant-1',
      severity: 'high'
    },
    {
      id: '2',
      level: 'error',
      message: 'Database Error',
      module: 'database',
      created_at: '2023-01-02T10:00:00Z',
      tenant_id: 'tenant-1',
      severity: 'critical'
    }
  ];

  it('calls prepareErrorTrendsData with correct params', () => {
    render(<ErrorTrendsChart 
      logs={mockLogs} 
      dateRange={dateRange} 
      isLoading={false} 
    />);

    expect(prepareErrorTrendsData).toHaveBeenCalledWith(mockLogs, dateRange);
  });

  it('renders loading state when isLoading is true', () => {
    render(<ErrorTrendsChart 
      logs={[]} 
      dateRange={dateRange} 
      isLoading={true} 
    />);

    expect(screen.getByTestId('chart-loading')).toBeInTheDocument();
  });

  it('renders ErrorRateChart when type is rate', () => {
    render(<ErrorTrendsChart 
      logs={mockLogs} 
      dateRange={dateRange} 
      isLoading={false} 
      type="rate"
    />);

    expect(screen.getByTestId('error-rate-chart')).toBeInTheDocument();
  });

  it('renders ErrorSeverityChart when type is severity', () => {
    render(<ErrorTrendsChart 
      logs={mockLogs} 
      dateRange={dateRange} 
      isLoading={false} 
      type="severity"
    />);

    expect(screen.getByTestId('error-severity-chart')).toBeInTheDocument();
  });

  it('renders FullErrorChart by default', () => {
    render(<ErrorTrendsChart 
      logs={mockLogs} 
      dateRange={dateRange} 
      isLoading={false} 
    />);

    expect(screen.getByTestId('full-error-chart')).toBeInTheDocument();
  });
});
