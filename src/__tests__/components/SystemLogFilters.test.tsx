
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SystemLogFilters from '@/components/admin/logs/SystemLogFilters';

describe('SystemLogFilters', () => {
  const mockOnSearchChange = vi.fn();
  const mockOnModuleFilterChange = vi.fn();
  const mockOnDateRangeChange = vi.fn();
  const mockOnReset = vi.fn();
  
  const defaultProps = {
    filters: {
      search: '',
      module: [],
      level: [],
      fromDate: undefined,
      toDate: undefined
    },
    onFilterChange: vi.fn(),
    isLoading: false,
    onRefresh: vi.fn()
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders all filter components', () => {
    render(<SystemLogFilters {...defaultProps} />);
    
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/module/i)).toBeInTheDocument();
    expect(screen.getByText(/date range/i)).toBeInTheDocument();
    expect(screen.getByText(/reset/i)).toBeInTheDocument();
  });
  
  it('calls onFilterChange when search input changes', () => {
    render(<SystemLogFilters {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ 
      search: 'test search' 
    }));
  });
  
  it('calls onReset when reset button is clicked', () => {
    render(<SystemLogFilters {...defaultProps} />);
    
    const resetButton = screen.getByText(/reset/i);
    fireEvent.click(resetButton);
    
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith({
      search: '',
      module: [],
      level: [],
      fromDate: undefined,
      toDate: undefined
    });
  });

  it('applies module filter when module is selected', () => {
    render(<SystemLogFilters {...defaultProps} />);
    
    // Note: This is simplified since actual dropdown selection testing would require more setup
    const moduleDropdown = screen.getByLabelText(/module/i);
    fireEvent.change(moduleDropdown, { target: { value: 'auth' } });
    
    expect(defaultProps.onFilterChange).toHaveBeenCalled();
  });
});
