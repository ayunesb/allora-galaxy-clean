
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';
import { LogFilters } from '@/types/logs';

describe('SystemLogFilters Component', () => {
  const initialFilters: LogFilters = {
    search: '',
    module: undefined,
    level: undefined,
    fromDate: undefined,
    toDate: undefined
  };
  
  const mockOnFilterChange = vi.fn();
  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly with default values', () => {
    render(
      <SystemLogFilters 
        filters={initialFilters} 
        onFilterChange={mockOnFilterChange} 
        onRefresh={mockOnRefresh}
      />
    );
    
    expect(screen.getByPlaceholderText('Search logs...')).toBeInTheDocument();
    expect(screen.getByTestId('module-select')).toBeInTheDocument();
    expect(screen.getByTestId('level-select')).toBeInTheDocument();
    expect(screen.getByText('Date range')).toBeInTheDocument();
    expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
  });

  test('calls onFilterChange when search input changes', () => {
    render(
      <SystemLogFilters 
        filters={initialFilters} 
        onFilterChange={mockOnFilterChange}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search logs...');
    fireEvent.change(searchInput, { target: { value: 'error' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...initialFilters,
      search: 'error',
      searchTerm: 'error'
    });
  });

  test('calls onFilterChange when module changes', () => {
    render(
      <SystemLogFilters 
        filters={initialFilters} 
        onFilterChange={mockOnFilterChange}
      />
    );
    
    // Open the select
    const moduleSelect = screen.getByTestId('module-select');
    fireEvent.click(moduleSelect);
    
    // Wait for content to be visible and select an option
    setTimeout(() => {
      const systemOption = screen.getByText('System');
      fireEvent.click(systemOption);
      
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...initialFilters,
        module: 'system'
      });
    }, 0);
  });

  test('calls onRefresh when refresh button is clicked', () => {
    render(
      <SystemLogFilters 
        filters={initialFilters} 
        onFilterChange={mockOnFilterChange} 
        onRefresh={mockOnRefresh}
      />
    );
    
    const refreshButton = screen.getByTestId('refresh-button');
    fireEvent.click(refreshButton);
    
    expect(mockOnRefresh).toHaveBeenCalled();
  });

  test('disables inputs when isLoading is true', () => {
    render(
      <SystemLogFilters 
        filters={initialFilters} 
        onFilterChange={mockOnFilterChange} 
        onRefresh={mockOnRefresh}
        isLoading={true}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search logs...');
    const refreshButton = screen.getByTestId('refresh-button');
    
    expect(searchInput).toBeDisabled();
    expect(refreshButton).toBeDisabled();
    expect(refreshButton.querySelector('svg')).toHaveClass('animate-spin');
  });
});
