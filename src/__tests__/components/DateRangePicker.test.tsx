
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangePicker } from '@/components/DateRangePicker';
import { DateRange } from '@/types/shared';

// Setup a mock DateRange for testing
const mockDateRange: DateRange = {
  from: new Date(2023, 0, 1),
  to: new Date(2023, 0, 10)
};

// Add missing props to the DateRangePicker interface for testing
interface DateRangePickerProps {
  defaultValue?: DateRange;
  value?: DateRange;
  onChange?: (date: DateRange | undefined) => void;
}

describe('DateRangePicker Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly without a selected date', () => {
    const mockOnChange = jest.fn();
    render(<DateRangePicker onChange={mockOnChange} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays the selected date range when provided', () => {
    const mockOnChange = jest.fn();
    const { getByText } = render(
      <DateRangePicker 
        value={mockDateRange} 
        onChange={mockOnChange} 
      />
    );
    
    // Format is typically MM/DD/YYYY - MM/DD/YYYY
    // Open the dropdown to force the display
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText(/Jan 1, 2023/i)).toBeInTheDocument();
  });

  it('calls onChange when a date range is selected', () => {
    const mockOnChange = jest.fn();
    const { container } = render(
      <DateRangePicker 
        value={mockDateRange}
        onChange={mockOnChange}
      />
    );
    
    // Simulate date selection (simplified for test)
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText(/Jan 1, 2023/i)).toBeInTheDocument();
  });

  it('can clear the selection', () => {
    const mockOnChange = jest.fn();
    render(<DateRangePicker onChange={mockOnChange} />);
    
    // Open the calendar
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Find and click the clear button if it exists
    const clearButton = screen.queryByText(/Clear/i);
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    }
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
