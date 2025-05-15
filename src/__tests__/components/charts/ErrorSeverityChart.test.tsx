
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorSeverityChart } from '@/components/admin/errors/charts';

// Mock recharts to avoid SVG rendering issues in tests
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    BarChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="bar-chart">{children}</div>
    ),
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    Bar: (props: any) => <div data-testid={`bar-${props.dataKey}`} />,
  };
});

describe('ErrorSeverityChart', () => {
  const mockData = [
    { 
      date: 'Jan 01', 
      critical: 2,
      high: 3,
      medium: 4,
      low: 1
    },
    { 
      date: 'Jan 02', 
      critical: 1,
      high: 2,
      medium: 3,
      low: 4
    }
  ];

  it('should render the chart with data', () => {
    render(<ErrorSeverityChart data={mockData} />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-critical')).toBeInTheDocument();
    expect(screen.getByTestId('bar-high')).toBeInTheDocument();
    expect(screen.getByTestId('bar-medium')).toBeInTheDocument();
    expect(screen.getByTestId('bar-low')).toBeInTheDocument();
  });

  it('should render the chart with correct height', () => {
    render(<ErrorSeverityChart data={mockData} />);
    
    const container = screen.getByTestId('responsive-container').parentElement;
    expect(container).toHaveClass('h-64');
  });

  it('should render empty chart when no data is provided', () => {
    render(<ErrorSeverityChart data={[]} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});
