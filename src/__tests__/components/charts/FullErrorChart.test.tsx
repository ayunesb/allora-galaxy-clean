
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FullErrorChart from '@/components/admin/errors/charts/FullErrorChart';
import { ErrorTrendDataPoint } from '@/types/logs';

// Mock the recharts components
vi.mock('recharts', () => {
  return {
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
    total: 15,
    critical: 2,
    high: 4,
    medium: 6,
    low: 3,
    count: 15 // Add count property
  },
  {
    date: '2023-01-02',
    total: 10,
    critical: 1,
    high: 2,
    medium: 4,
    low: 3,
    count: 10 // Add count property
  }
];

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
