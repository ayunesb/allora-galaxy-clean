
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorSeverityChart from '@/components/admin/errors/charts/ErrorSeverityChart';
import { ErrorTrendDataPoint } from '@/types/logs';

// Mock the recharts components
vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-responsive-container">{children}</div>
    ),
    BarChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="recharts-bar-chart">{children}</div>
    ),
    Bar: ({ dataKey }: { dataKey: string }) => (
      <div data-testid={`recharts-bar-${dataKey}`}></div>
    ),
    CartesianGrid: () => <div data-testid="recharts-cartesian-grid"></div>,
    XAxis: () => <div data-testid="recharts-xaxis"></div>,
    YAxis: () => <div data-testid="recharts-yaxis"></div>,
    Tooltip: () => <div data-testid="recharts-tooltip"></div>,
    Legend: () => <div data-testid="recharts-legend"></div>
  };
});

// Mock ChartLoadingState component
vi.mock('@/components/admin/errors/charts/ChartLoadingState', () => ({
  default: () => <div data-testid="chart-loading-state">Loading State</div>
}));

// Create mock data for testing
const mockErrorTrends: ErrorTrendDataPoint[] = [
  {
    date: '2023-01-01',
    count: 15,
    total: 15, // Now compatible with updated type
    critical: 2,
    high: 4,
    medium: 6,
    low: 3
  },
  {
    date: '2023-01-02',
    count: 10,
    total: 10, // Now compatible with updated type
    critical: 1,
    high: 2,
    medium: 4,
    low: 3
  }
];

describe('ErrorSeverityChart', () => {
  it('renders loading state when isLoading is true', () => {
    render(<ErrorSeverityChart data={[]} isLoading={true} />);
    expect(screen.getByTestId('chart-loading-state')).toBeInTheDocument();
  });

  it('renders empty state message when no data is provided', () => {
    render(<ErrorSeverityChart data={[]} isLoading={false} />);
    expect(screen.getByText(/No error severity data available/i)).toBeInTheDocument();
  });

  it('renders the chart when data is provided', () => {
    render(<ErrorSeverityChart data={mockErrorTrends} isLoading={false} />);
    
    // Check if chart components are rendered
    expect(screen.getByTestId('recharts-bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar-critical')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar-high')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar-medium')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar-low')).toBeInTheDocument();
  });
});
