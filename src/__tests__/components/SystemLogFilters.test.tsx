
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock UI components used by SystemLogFilters
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => (
    <input 
      data-testid="search-input"
      type="text"
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/date-range-picker', () => ({
  DateRangePicker: () => <div data-testid="date-range-picker">Date Range</div>
}));

// Import the component after mocking dependencies
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';

describe('SystemLogFilters', () => {
  it('renders the filters component', () => {
    render(
      <SystemLogFilters
        filters={{}}
        onFiltersChange={() => {}}
        isLoading={false}
        onRefresh={() => {}}
      />
    );
    
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });
  
  it('handles search input changes', () => {
    const handleFilterChange = vi.fn();
    
    render(
      <SystemLogFilters
        filters={{}}
        onFiltersChange={handleFilterChange}
        isLoading={false}
        onRefresh={() => {}}
      />
    );
    
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    // Wait for debounce to complete
    vi.advanceTimersByTime(300);
    
    expect(handleFilterChange).toHaveBeenCalledWith({ search: 'test search' });
  });
});
