
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangePicker } from '@/components/ui/date-range-picker';

describe('DateRangePicker Component', () => {
  it('renders correctly with placeholder when no date is selected', () => {
    const handleChange = vi.fn();
    render(<DateRangePicker onDateChange={handleChange} />);
    
    expect(screen.getByText('Pick a date range')).toBeInTheDocument();
  });

  it('displays the selected date range when provided', () => {
    const handleChange = vi.fn();
    const date = {
      from: new Date(2023, 0, 15), // January 15, 2023
      to: new Date(2023, 0, 20) // January 20, 2023
    };
    
    render(<DateRangePicker date={date} onDateChange={handleChange} />);
    
    expect(screen.getByText(/Jan 15, 2023 - Jan 20, 2023/)).toBeInTheDocument();
  });

  it('displays only the start date when no end date is selected', () => {
    const handleChange = vi.fn();
    const date = {
      from: new Date(2023, 0, 15), // January 15, 2023
      to: null
    };
    
    render(<DateRangePicker date={date} onDateChange={handleChange} />);
    
    expect(screen.getByText('Jan 15, 2023')).toBeInTheDocument();
  });

  it('opens the date picker popover when clicked', () => {
    const handleChange = vi.fn();
    render(<DateRangePicker onDateChange={handleChange} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // The calendar should now be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const handleChange = vi.fn();
    render(<DateRangePicker onDateChange={handleChange} className="custom-class" />);
    
    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });
});
