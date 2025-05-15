
import React from 'react';
import { render, screen } from '@testing-library/react';
import { FullErrorChart } from '@/components/admin/errors/charts';

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
    Line: (props: any) => <div data-testid={`line-${props.dataKey}`} />,
  };
});

describe('FullErrorChart', () => {
  const mockData = [
    { 
      date: 'Jan 01', 
      total: 10,
      critical: 2,
      high: 3,
      medium: 4,
      low: 1
    },
    { 
      date: 'Jan 02', 
      total: 15,
      critical: 3,
      high: 4,
      medium: 5,
      low: 3
    }
  ];

  it('should render the chart with data', () => {
    render(<FullErrorChart data={mockData} />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-total')).toBeInTheDocument();
    expect(screen.getByTestId('line-critical')).toBeInTheDocument();
    expect(screen.getByTestId('line-high')).toBeInTheDocument();
    expect(screen.getByTestId('line-medium')).toBeInTheDocument();
    expect(screen.getByTestId('line-low')).toBeInTheDocument();
  });

  it('should render the chart with correct height', () => {
    render(<FullErrorChart data={mockData} />);
    
    const container = screen.getByTestId('responsive-container').parentElement;
    expect(container).toHaveClass('h-96');
  });

  it('should render empty chart when no data is provided', () => {
    render(<FullErrorChart data={[]} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});
