
import React from 'react';
import { render, screen } from '@testing-library/react';
import FullErrorChart from '@/components/admin/errors/charts/FullErrorChart';
import { mockErrorTrends } from '../../mocks/errorLogsMock';

// Mock the recharts components
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-responsive-container">{children}</div>
    ),
    ComposedChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-composed-chart">{children}</div>
    ),
    Line: ({ dataKey }: { dataKey: string }) => (
      <div data-testid={`recharts-line-${dataKey}`}></div>
    ),
    Bar: ({ dataKey }: { dataKey: string }) => (
      <div data-testid={`recharts-bar-${dataKey}`}></div>
    ),
  };
});

// Mock the ChartLoadingState component
vi.mock('@/components/admin/errors/charts/ChartLoadingState', () => ({
  default: () => <div data-testid="chart-loading-state">Loading State</div>
}));

describe('FullErrorChart', () => {
  it('renders loading state when isLoading is true', () => {
    render(<FullErrorChart data={[]} isLoading={true} />);
    expect(screen.getByTestId('chart-loading-state')).toBeInTheDocument();
  });

  it('renders empty state message when no data is provided', () => {
    render(<FullErrorChart data={[]} isLoading={false} />);
    expect(screen.getByText(/No error data available/i)).toBeInTheDocument();
  });

  it('renders the chart when data is provided', () => {
    render(<FullErrorChart data={mockErrorTrends} isLoading={false} />);
    
    // Check if chart components are rendered
    expect(screen.getByTestId('recharts-composed-chart')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-line-total')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar-critical')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar-high')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar-medium')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar-low')).toBeInTheDocument();
  });
});
