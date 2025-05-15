
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorTrendsChart from '@/components/admin/errors/ErrorTrendsChart';
import { mockErrorTrends } from '../mocks/errorLogsMock';

// Mock the recharts library
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
    Tooltip: () => <div data-testid="recharts-tooltip"></div>,
    Legend: () => <div data-testid="recharts-legend"></div>,
    XAxis: () => <div data-testid="recharts-xaxis"></div>,
    YAxis: () => <div data-testid="recharts-yaxis"></div>,
  };
});

describe('ErrorTrendsChart', () => {
  const mockData = mockErrorTrends;
  const defaultDateRange = {
    from: new Date('2023-01-01'),
    to: new Date('2023-01-31')
  };

  it('renders loading state correctly', () => {
    render(<ErrorTrendsChart logs={[]} dateRange={defaultDateRange} isLoading={true} />);
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<ErrorTrendsChart logs={[]} dateRange={defaultDateRange} isLoading={false} />);
    expect(screen.getByText('No error data available for the selected time period.')).toBeInTheDocument();
  });

  it('renders chart when data is provided', () => {
    render(<ErrorTrendsChart logs={mockData} dateRange={defaultDateRange} isLoading={false} />);
    
    // Check if chart container is rendered
    expect(screen.getByTestId('recharts-responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-line-chart')).toBeInTheDocument();
    
    // Check if lines for each severity are rendered
    expect(screen.getByTestId('recharts-line-total')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-line-critical')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-line-high')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-line-medium')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-line-low')).toBeInTheDocument();
  });

  it('renders different chart types correctly', () => {
    // Test rate chart
    const { rerender } = render(
      <ErrorTrendsChart 
        logs={mockData} 
        dateRange={defaultDateRange} 
        isLoading={false} 
        type="rate" 
      />
    );
    
    expect(screen.getByTestId('recharts-line-chart')).toBeInTheDocument();
    
    // Test severity chart
    rerender(
      <ErrorTrendsChart 
        logs={mockData} 
        dateRange={defaultDateRange} 
        isLoading={false} 
        type="severity" 
      />
    );
    
    expect(screen.getByTestId('recharts-line-chart')).toBeInTheDocument();
  });
});
