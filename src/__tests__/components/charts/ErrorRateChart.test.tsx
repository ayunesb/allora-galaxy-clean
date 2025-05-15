
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorRateChart } from '@/components/admin/errors/charts';

// Mock recharts to avoid SVG rendering issues in tests
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    LineChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="line-chart">{children}</div>
    ),
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    Line: () => <div data-testid="line" />,
  };
});

describe('ErrorRateChart', () => {
  const mockData = [
    { date: 'Jan 01', total: 10 },
    { date: 'Jan 02', total: 15 },
    { date: 'Jan 03', total: 8 }
  ];

  it('should render the chart with data', () => {
    render(<ErrorRateChart data={mockData} />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
  });

  it('should render the chart with correct height', () => {
    render(<ErrorRateChart data={mockData} />);
    
    const container = screen.getByTestId('responsive-container').parentElement;
    expect(container).toHaveClass('h-64');
  });

  it('should render empty chart when no data is provided', () => {
    render(<ErrorRateChart data={[]} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});
