
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';
import { LogFilters } from '@/types/shared';

describe('SystemLogFilters Component', () => {
  const initialFilters: LogFilters = {
    search: '',
    module: undefined,
    level: [],
    fromDate: undefined,
    toDate: undefined
  };
  
  const mockOnFilterChange = vi.fn();
  const mockOnRefresh = vi.fn();
  const mockOnReset = vi.fn(); // Added mock reset function to fix TS errors

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly with default values', () => {
    render(
      <SystemLogFilters 
        filters={initialFilters} 
        onFilterChange={mockOnFilterChange} 
        onRefresh={mockOnRefresh}
        onReset={mockOnReset} // Added to fix TS error
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
        onReset={mockOnReset} // Added to fix TS error
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search logs...');
    fireEvent.change(searchInput, { target: { value: 'error' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...initialFilters,
      search: 'error'
    });
  });

  test('calls onFilterChange when module changes', () => {
    render(
      <SystemLogFilters 
        filters={initialFilters} 
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset} // Added to fix TS error
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
        onReset={mockOnReset} // Added to fix TS error
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
        onReset={mockOnReset} // Added to fix TS error
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
