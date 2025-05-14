
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorMessage, SimpleErrorMessage } from '@/components/ui/error-message';

describe('ErrorMessage Component', () => {
  it('should render with the provided message', () => {
    render(<ErrorMessage message="An error occurred" />);
    
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  it('should render with a title when provided', () => {
    render(<ErrorMessage title="Error Title" message="Error details" />);
    
    expect(screen.getByText('Error Title')).toBeInTheDocument();
    expect(screen.getByText('Error details')).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    const handleRetry = vi.fn();
    render(
      <ErrorMessage 
        message="Operation failed"
        onRetry={handleRetry}
      />
    );
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);
    
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('should apply severity styles correctly', () => {
    const { rerender } = render(<ErrorMessage message="Error message" severity="error" />);
    expect(document.querySelector('.bg-destructive\\/10')).toBeInTheDocument();
    
    rerender(<ErrorMessage message="Warning message" severity="warning" />);
    expect(document.querySelector('.bg-yellow-500\\/10')).toBeInTheDocument();
    
    rerender(<ErrorMessage message="Info message" severity="info" />);
    expect(document.querySelector('.bg-blue-500\\/10')).toBeInTheDocument();
  });

  it('should render SimpleErrorMessage correctly', () => {
    render(<SimpleErrorMessage message="Simple error message" />);
    
    expect(screen.getByText('Simple error message')).toBeInTheDocument();
  });
});
