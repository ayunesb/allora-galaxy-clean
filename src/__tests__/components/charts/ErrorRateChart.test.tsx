
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorRateChart from '@/components/admin/errors/charts/ErrorRateChart';

// Mock the Recharts components
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
    Line: ({ dataKey }: { dataKey: string }) => <div data-testid={`line-${dataKey}`} />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />
  };
});

describe('ErrorRateChart', () => {
  const mockData = [
    { date: '2023-01-01', total: 5, critical: 0, high: 2, medium: 2, low: 1 },
    { date: '2023-01-02', total: 3, critical: 1, high: 1, medium: 1, low: 0 }
  ];

  it('renders all chart components', () => {
    render(<ErrorRateChart data={mockData} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-total')).toBeInTheDocument();
  });

  it('renders empty state when no data is provided', () => {
    render(<ErrorRateChart data={[]} />);
    
    expect(screen.getByText(/No error data available/i)).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    render(<ErrorRateChart data={mockData} height={500} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});
