
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FullErrorChart } from '@/components/admin/errors/charts/FullErrorChart';
import { ErrorTrendDataPoint } from '@/types/logs';

// Mock the recharts library
vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ComposedChart: ({ children }: { children: React.ReactNode }) => <div data-testid="composed-chart">{children}</div>,
    Line: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Bar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    XAxis: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    YAxis: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CartesianGrid: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Legend: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

describe('FullErrorChart', () => {
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
    render(<FullErrorChart data={mockData} />);
    
    const chart = screen.getByTestId('composed-chart');
    expect(chart).toBeInTheDocument();
  });

  it('displays loading state when isLoading is true', () => {
    render(<FullErrorChart data={[]} isLoading={true} />);
    
    const loadingState = screen.getByTestId('chart-loading');
    expect(loadingState).toBeInTheDocument();
  });

  it('displays empty state when there is no data', () => {
    render(<FullErrorChart data={[]} />);
    
    const emptyState = screen.getByText('No error data available');
    expect(emptyState).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    render(<FullErrorChart data={mockData} height={500} />);
    
    const chart = screen.getByTestId('composed-chart');
    expect(chart).toBeInTheDocument();
  });
});
