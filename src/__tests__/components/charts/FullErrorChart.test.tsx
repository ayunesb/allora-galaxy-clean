
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FullErrorChart from '@/components/admin/errors/charts/FullErrorChart';

// Mock the Recharts components
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    ComposedChart: ({ children }: { children: React.ReactNode }) => <div data-testid="composed-chart">{children}</div>,
    Area: ({ dataKey }: { dataKey: string }) => <div data-testid={`area-${dataKey}`} />,
    Bar: ({ dataKey }: { dataKey: string }) => <div data-testid={`bar-${dataKey}`} />,
    Line: ({ dataKey }: { dataKey: string }) => <div data-testid={`line-${dataKey}`} />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />
  };
});

describe('FullErrorChart', () => {
  const mockData = [
    { date: '2023-01-01', total: 5, critical: 0, high: 2, medium: 2, low: 1 },
    { date: '2023-01-02', total: 3, critical: 1, high: 1, medium: 1, low: 0 }
  ];

  it('renders all chart components', () => {
    render(<FullErrorChart data={mockData} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-total')).toBeInTheDocument();
    expect(screen.getByTestId('bar-critical')).toBeInTheDocument();
    expect(screen.getByTestId('bar-high')).toBeInTheDocument();
    expect(screen.getByTestId('bar-medium')).toBeInTheDocument();
    expect(screen.getByTestId('bar-low')).toBeInTheDocument();
    expect(screen.getByText(/Error Distribution Over Time/i)).toBeInTheDocument();
  });

  it('renders empty state when no data is provided', () => {
    render(<FullErrorChart data={[]} />);
    
    expect(screen.getByText(/No error data available/i)).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    render(<FullErrorChart data={mockData} height={500} />);
    
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});
