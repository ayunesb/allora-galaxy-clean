
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorSeverityChart } from '@/components/admin/errors/charts/ErrorSeverityChart';
import { ErrorTrendDataPoint } from '@/types/logs';

// Mock the recharts library
vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
    Area: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    XAxis: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    YAxis: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CartesianGrid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Legend: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

describe('ErrorSeverityChart', () => {
  const mockData: ErrorTrendDataPoint[] = [
    {
      date: '2023-01-01',
      count: 5,
      total: 100,
      critical: 1,
      high: 2,
      medium: 1,
      low: 1
    },
    {
      date: '2023-01-02',
      count: 8,
      total: 120,
      critical: 2,
      high: 3,
      medium: 2,
      low: 1
    },
    {
      date: '2023-01-03',
      count: 3,
      total: 95,
      critical: 0,
      high: 1,
      medium: 1,
      low: 1
    }
  ];

  it('renders the chart with data', () => {
    render(<ErrorSeverityChart data={mockData} />);
    
    const chart = screen.getByTestId('area-chart');
    expect(chart).toBeInTheDocument();
  });

  it('displays loading state when isLoading is true', () => {
    render(<ErrorSeverityChart data={[]} isLoading={true} />);
    
    const loadingState = screen.getByTestId('chart-loading');
    expect(loadingState).toBeInTheDocument();
  });

  it('displays empty state when there is no data', () => {
    render(<ErrorSeverityChart data={[]} />);
    
    const emptyState = screen.getByText('No severity data available');
    expect(emptyState).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    render(<ErrorSeverityChart data={mockData} height={400} />);
    
    const chart = screen.getByTestId('area-chart');
    expect(chart).toBeInTheDocument();
  });
});
