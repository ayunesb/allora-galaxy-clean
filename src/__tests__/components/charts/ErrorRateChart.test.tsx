
import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorRateChart from '@/components/admin/errors/charts/ErrorRateChart';
import { mockErrorTrends } from '../../mocks/errorLogsMock';

// Mock the recharts components
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-responsive-container">{children}</div>
    ),
    LineChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-line-chart">{children}</div>
    ),
    Line: ({ dataKey }: { dataKey: string }) => (
      <div data-testid={`recharts-line-${dataKey}`}></div>
    ),
    AreaChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-area-chart">{children}</div>
    ),
    Area: ({ dataKey }: { dataKey: string }) => (
      <div data-testid={`recharts-area-${dataKey}`}></div>
    ),
  };
});

// Mock the ChartLoadingState component
vi.mock('@/components/admin/errors/charts/ChartLoadingState', () => ({
  default: () => <div data-testid="chart-loading-state">Loading State</div>
}));

describe('ErrorRateChart', () => {
  it('renders loading state when isLoading is true', () => {
    render(<ErrorRateChart data={[]} isLoading={true} />);
    expect(screen.getByTestId('chart-loading-state')).toBeInTheDocument();
  });

  it('renders empty state message when no data is provided', () => {
    render(<ErrorRateChart data={[]} isLoading={false} />);
    expect(screen.getByText(/No error rate data available/i)).toBeInTheDocument();
  });

  it('renders the chart when data is provided', () => {
    render(<ErrorRateChart data={mockErrorTrends} isLoading={false} />);
    
    // Check if chart components are rendered
    expect(screen.getByTestId('recharts-area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-area-total')).toBeInTheDocument();
  });
});
