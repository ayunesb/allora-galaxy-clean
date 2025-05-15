
import React from 'react';
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
  };
});

describe('ErrorTrendsChart', () => {
  const mockData = mockErrorTrends;

  it('renders loading state correctly', () => {
    render(<ErrorTrendsChart data={[]} isLoading={true} />);
    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<ErrorTrendsChart data={[]} isLoading={false} />);
    expect(screen.getByText('No error data available for the selected time period.')).toBeInTheDocument();
  });

  it('renders chart when data is provided', () => {
    render(<ErrorTrendsChart data={mockData} isLoading={false} />);
    
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
});
