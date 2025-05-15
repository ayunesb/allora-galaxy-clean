
import { describe, it, expect, jest, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorTrendsChart from '@/components/admin/errors/ErrorTrendsChart';

// Mock the recharts components to avoid rendering issues in tests
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
    Line: vi.fn().mockImplementation(() => <div data-testid="chart-line" />),
    XAxis: vi.fn().mockImplementation(() => <div data-testid="x-axis" />),
    YAxis: vi.fn().mockImplementation(() => <div data-testid="y-axis" />),
    CartesianGrid: vi.fn().mockImplementation(() => <div data-testid="cartesian-grid" />),
    Tooltip: vi.fn().mockImplementation(() => <div data-testid="tooltip" />),
    Legend: vi.fn().mockImplementation(() => <div data-testid="legend" />),
  };
});

// Mock chart utility functions
vi.mock('@/components/admin/errors/utils/chartDataUtils', () => ({
  groupErrorsByDate: vi.fn(() => [
    { date: '2025-01-01', errorCount: 5, warningCount: 3, infoCount: 2 },
    { date: '2025-01-02', errorCount: 2, warningCount: 4, infoCount: 6 },
  ]),
}));

describe('ErrorTrendsChart Component', () => {
  const mockErrorLogs = [
    {
      id: '1',
      level: 'error',
      message: 'Test error',
      module: 'system',
      created_at: '2025-01-01T12:00:00Z',
      tenant_id: 'test-tenant'
    },
    {
      id: '2',
      level: 'warning',
      message: 'Test warning',
      module: 'auth',
      created_at: '2025-01-01T14:00:00Z',
      tenant_id: 'test-tenant'
    },
    {
      id: '3',
      level: 'info',
      message: 'Test info',
      module: 'api',
      created_at: '2025-01-02T09:00:00Z',
      tenant_id: 'test-tenant'
    },
  ];

  it('renders the error trends chart correctly', () => {
    render(<ErrorTrendsChart logs={mockErrorLogs} isLoading={false} />);
    
    // Check that the chart and its components are rendered
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<ErrorTrendsChart logs={[]} isLoading={true} />);
    
    // Check that the loading state is shown
    expect(screen.getByTestId('chart-loading')).toBeInTheDocument();
  });

  it('shows empty state when no logs are provided', () => {
    render(<ErrorTrendsChart logs={[]} isLoading={false} />);
    
    // Check that the empty state is shown
    expect(screen.getByText(/No error data available/i)).toBeInTheDocument();
  });

  it('renders with proper height when height prop is provided', () => {
    render(<ErrorTrendsChart logs={mockErrorLogs} isLoading={false} height={400} />);
    
    // Check that the container has the proper height
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});
