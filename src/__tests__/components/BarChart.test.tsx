
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BarChartComponent from '@/components/ui/bar-chart';

// Mock Recharts components
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
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
    Bar: ({ dataKey }: { dataKey: string }) => <div data-testid={`bar-${dataKey}`} />
  };
});

describe('BarChartComponent', () => {
  const mockData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 200 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all chart components correctly', () => {
    render(
      <BarChartComponent 
        data={mockData} 
        xAxisKey="name" 
        barKeys={['value']} 
        colors={['#8884d8']} 
      />
    );
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('legend')).toBeInTheDocument();
    expect(screen.getByTestId('bar-value')).toBeInTheDocument();
  });

  it('should render multiple bars when multiple barKeys are provided', () => {
    const multiData = [
      { name: 'Jan', sales: 400, profit: 200 },
      { name: 'Feb', sales: 300, profit: 150 },
    ];
    
    render(
      <BarChartComponent 
        data={multiData} 
        xAxisKey="name" 
        barKeys={['sales', 'profit']} 
        colors={['#8884d8', '#82ca9d']} 
      />
    );
    
    expect(screen.getByTestId('bar-sales')).toBeInTheDocument();
    expect(screen.getByTestId('bar-profit')).toBeInTheDocument();
  });

  it('should apply default height and width when not specified', () => {
    render(<BarChartComponent data={mockData} />);
    
    const container = screen.getByTestId('responsive-container');
    expect(container).toBeInTheDocument();
  });
});
