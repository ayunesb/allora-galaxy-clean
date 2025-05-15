
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';

describe('SystemLogFilters', () => {
  const mockOnSearchChange = vi.fn();
  const mockOnModuleFilterChange = vi.fn();
  const mockOnDateRangeChange = vi.fn();
  const mockOnReset = vi.fn();
  
  const defaultProps = {
    searchTerm: '',
    onSearchChange: mockOnSearchChange,
    moduleFilter: 'all',
    onModuleFilterChange: mockOnModuleFilterChange,
    dateRange: undefined,
    onDateRangeChange: mockOnDateRangeChange,
    onReset: mockOnReset,
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('renders all filter components', () => {
    render(<SystemLogFilters {...defaultProps} />);
    
    expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/module/i)).toBeInTheDocument();
    expect(screen.getByText(/date range/i)).toBeInTheDocument();
    expect(screen.getByText(/reset filters/i)).toBeInTheDocument();
  });
  
  test('calls onSearchChange when search input changes', () => {
    render(<SystemLogFilters {...defaultProps} />);
    
    const searchInput = screen.getByLabelText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(mockOnSearchChange).toHaveBeenCalledWith('test search');
  });
  
  test('calls onReset when reset button is clicked', () => {
    render(<SystemLogFilters {...defaultProps} />);
    
    const resetButton = screen.getByText(/reset filters/i);
    fireEvent.click(resetButton);
    
    expect(mockOnReset).toHaveBeenCalled();
  });
});
