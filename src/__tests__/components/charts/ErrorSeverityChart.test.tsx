
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorSeverityChart from '@/components/admin/errors/charts/ErrorSeverityChart';

// Mock the Recharts components
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
    Bar: ({ dataKey }: { dataKey: string }) => <div data-testid={`bar-${dataKey}`} />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />
  };
});

describe('ErrorSeverityChart', () => {
  const mockData = [
    { date: '2023-01-01', total: 5, critical: 0, high: 2, medium: 2, low: 1 },
    { date: '2023-01-02', total: 3, critical: 1, high: 1, medium: 1, low: 0 }
  ];

  it('renders all chart components', () => {
    render(<ErrorSeverityChart data={mockData} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-critical')).toBeInTheDocument();
    expect(screen.getByTestId('bar-high')).toBeInTheDocument();
    expect(screen.getByTestId('bar-medium')).toBeInTheDocument();
    expect(screen.getByTestId('bar-low')).toBeInTheDocument();
    expect(screen.getByText(/Error Severity Distribution/i)).toBeInTheDocument();
  });

  it('renders empty state when no data is provided', () => {
    render(<ErrorSeverityChart data={[]} />);
    
    expect(screen.getByText(/No error data available/i)).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    render(<ErrorSeverityChart data={mockData} height={500} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});
