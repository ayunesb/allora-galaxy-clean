import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from '@/types/shared';

describe('DateRangePicker Component', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default values', () => {
    render(<DateRangePicker onChange={mockOnChange} />);
    
    expect(screen.getByText('Pick a date')).toBeInTheDocument();
  });

  it('renders with provided date range', () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    const dateRange: DateRange = {
      from: today,
      to: tomorrow
    };
    
    render(<DateRangePicker value={dateRange} onChange={mockOnChange} />);
    
    // The formatted date string will depend on your date formatting
    // This is a simplified check
    expect(screen.getByRole('button')).toHaveTextContent(today.getDate().toString());
  });

  it('handles partial date range correctly', () => {
    const today = new Date();
    
    const partialDateRange: DateRange = {
      from: today,
      to: undefined
    };
    
    render(<DateRangePicker value={partialDateRange} onChange={mockOnChange} />);
    
    // Should show just the from date
    expect(screen.getByRole('button')).not.toHaveTextContent('to');
  });

  it('opens calendar when clicked', () => {
    render(<DateRangePicker onChange={mockOnChange} />);
    
    // Open the calendar
    fireEvent.click(screen.getByRole('button'));
    
    // Check if calendar is visible
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    // ... other days of the week
  });
});
