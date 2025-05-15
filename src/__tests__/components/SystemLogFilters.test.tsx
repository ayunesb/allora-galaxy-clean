
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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

// Mock the debounce hook to run immediately in tests
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: any) => value
}));

// Import the component after mocking dependencies
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';

describe('SystemLogFilters', () => {
  const defaultFilters = { search: '' };
  let onFiltersChange: any;
  
  beforeEach(() => {
    onFiltersChange = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  
  it('renders the filters component', () => {
    render(
      <SystemLogFilters
        filters={defaultFilters}
        onFiltersChange={onFiltersChange}
        isLoading={false}
        onRefresh={() => {}}
      />
    );
    
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('date-range-picker')).toBeInTheDocument();
  });
  
  it('handles search input changes', () => {
    render(
      <SystemLogFilters
        filters={defaultFilters}
        onFiltersChange={onFiltersChange}
        isLoading={false}
        onRefresh={() => {}}
      />
    );
    
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    // Wait for debounce to complete
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(onFiltersChange).toHaveBeenCalledWith({ search: 'test search' });
  });

  it('disables inputs when loading', () => {
    render(
      <SystemLogFilters
        filters={defaultFilters}
        onFiltersChange={onFiltersChange}
        isLoading={true}
        onRefresh={() => {}}
      />
    );
    
    expect(screen.getByTestId('search-input')).toHaveAttribute('disabled');
  });
});
