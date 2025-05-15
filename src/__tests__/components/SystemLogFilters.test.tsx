
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';
import { LogFilters } from '@/types/logs';

// Mock functions
const mockOnFiltersChange = vi.fn();
const mockRefresh = vi.fn();

// Common filters state for tests
const defaultFilters: LogFilters = {
  search: '',
  level: [],
  module: [],
  severity: [],
  dateRange: undefined
};

describe('SystemLogFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders search box correctly', () => {
    render(
      <SystemLogFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    );
    
    expect(screen.getByPlaceholderText('Search logs...')).toBeInTheDocument();
  });
  
  it('calls onFiltersChange when search value changes', async () => {
    render(
      <SystemLogFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search logs...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    // Wait for debounce
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: 'test search' });
    }, { timeout: 600 });
  });
  
  it('renders level filter correctly', () => {
    render(
      <SystemLogFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    );
    
    expect(screen.getByLabelText('Filter by level')).toBeInTheDocument();
  });

  it('renders refresh button when onRefresh provided', () => {
    render(
      <SystemLogFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onRefresh={mockRefresh}
      />
    );
    
    expect(screen.getByLabelText('Refresh logs')).toBeInTheDocument();
  });
  
  it('shows reset button when filters are active', () => {
    const activeFilters: LogFilters = {
      search: 'search term',
      level: ['info'],
      module: ['api'],
      severity: [],
      dateRange: undefined
    };
    
    render(
      <SystemLogFilters
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    );
    
    expect(screen.getByLabelText('Reset filters')).toBeInTheDocument();
  });
  
  it('calls onRefresh when refresh button is clicked', () => {
    render(
      <SystemLogFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onRefresh={mockRefresh}
      />
    );
    
    const refreshButton = screen.getByLabelText('Refresh logs');
    fireEvent.click(refreshButton);
    
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
  
  it('resets all filters when reset button is clicked', () => {
    const activeFilters: LogFilters = {
      search: 'search term',
      level: ['error'],
      module: ['system'],
      severity: [],
      dateRange: undefined
    };
    
    render(
      <SystemLogFilters
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
      />
    );
    
    const resetButton = screen.getByLabelText('Reset filters');
    fireEvent.click(resetButton);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      search: '',
      level: [],
      module: [],
      severity: [],
      dateRange: undefined
    });
  });
});
