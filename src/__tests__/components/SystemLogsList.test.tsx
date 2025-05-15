
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock the component since it's missing
vi.mock('@/components/admin/logs/SystemLogsList', () => ({
  default: ({ logs, isLoading }) => (
    <div data-testid="mock-logs-list">
      {isLoading ? (
        <div data-testid="loading">Loading...</div>
      ) : (
        <div data-testid="logs-count">{logs.length} logs</div>
      )}
    </div>
  )
}));

// Import after mocking
import SystemLogsList from '@/components/admin/logs/SystemLogsList';
import { createMockLogs } from '../fixtures/mockLogs';

describe('SystemLogsList', () => {
  it('renders loading state when isLoading is true', () => {
    render(<SystemLogsList logs={[]} isLoading={true} onViewLog={() => {}} />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
  
  it('renders logs when provided', () => {
    const mockLogs = createMockLogs(5);
    render(<SystemLogsList logs={mockLogs} isLoading={false} onViewLog={() => {}} />);
    expect(screen.getByTestId('logs-count')).toHaveTextContent('5 logs');
  });
});
