
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import ErrorState from '@/components/ui/error-state';

describe('ErrorState', () => {
  it('renders with default props', () => {
    render(<ErrorState />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('We encountered an error while processing your request.')).toBeInTheDocument();
  });

  it('renders custom title and message', () => {
    render(
      <ErrorState 
        title="Custom Error Title" 
        message="Custom error message" 
      />
    );
    
    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('displays error details when showDetails is true', () => {
    const testError = new Error('Test error details');
    
    render(
      <ErrorState 
        error={testError}
        showDetails={true}
      />
    );
    
    expect(screen.getByText('Test error details')).toBeInTheDocument();
  });

  it('does not display error details when showDetails is false', () => {
    const testError = new Error('Test error details');
    
    render(
      <ErrorState 
        error={testError}
        showDetails={false}
      />
    );
    
    expect(screen.queryByText('Test error details')).not.toBeInTheDocument();
  });

  it('calls retry function when retry button is clicked', () => {
    const mockRetry = vi.fn();
    
    render(
      <ErrorState 
        retry={mockRetry}
      />
    );
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when retry function is not provided', () => {
    render(<ErrorState />);
    
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(
      <ErrorState>
        <p>Child content</p>
      </ErrorState>
    );
    
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('handles string error message', () => {
    render(
      <ErrorState 
        error="String error message"
        showDetails={true}
      />
    );
    
    expect(screen.getByText('String error message')).toBeInTheDocument();
  });
});
