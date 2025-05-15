
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { SystemLog, LogLevel } from '@/types/logs';

// Mock UI components used by SystemLogsList
vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table data-testid="table">{children}</table>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead data-testid="table-header">{children}</thead>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody data-testid="table-body">{children}</tbody>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr data-testid="table-row">{children}</tr>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th data-testid="table-head">{children}</th>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td data-testid="table-cell">{children}</td>,
}));

// Mock DataTable component
vi.mock('@/components/ui/data-table', () => ({
  DataTable: ({ data }: any) => (
    <div data-testid="data-table">
      {data.map((item: any, index: number) => (
        <div key={index} data-testid="table-row">{item.id}</div>
      ))}
    </div>
  )
}));

// Import the component after mocking dependencies
import SystemLogsList from '@/components/admin/logs/SystemLogsList';

// Mock fixtures for testing
const createMockLogs = (count: number): SystemLog[] => {
  return Array(count).fill(0).map((_, index) => ({
    id: `log-${index}`,
    created_at: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    module: 'test-module',
    level: (index % 3 === 0 ? 'error' : index % 3 === 1 ? 'warning' : 'info') as LogLevel,
    event: 'test-event',
    event_type: 'test',
    description: `Test log ${index}`,
    message: `Test message ${index}`,
    tenant_id: 'test-tenant',
    severity: (index % 4 === 0 ? 'critical' : index % 4 === 1 ? 'high' : index % 4 === 2 ? 'medium' : 'low') as const,
    error_type: index % 3 === 0 ? 'TestError' : undefined,
    user_id: 'test-user',
    context: {},
    error_message: index % 3 === 0 ? 'An error occurred' : undefined,
  }));
};

describe('SystemLogsList', () => {
  it('renders loading state when isLoading is true', () => {
    render(<SystemLogsList logs={[]} isLoading={true} onViewLog={() => {}} />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
  
  it('renders empty state when no logs are provided', () => {
    render(<SystemLogsList logs={[]} isLoading={false} onViewLog={() => {}} />);
    expect(screen.getByText('No logs found')).toBeInTheDocument();
  });
  
  it('renders logs when provided', () => {
    const mockLogs = createMockLogs(5);
    
    render(<SystemLogsList logs={mockLogs} isLoading={false} onViewLog={() => {}} />);
    
    const logsCount = screen.getByTestId('logs-count');
    expect(logsCount).toHaveAttribute('data-count', '5');
    expect(screen.getAllByTestId('table-row').length).toBeGreaterThan(0);
  });
});
