
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorState from '@/components/errors/ErrorState';

describe('ErrorState Component', () => {
  it('renders with default props', () => {
    render(<ErrorState />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('We encountered an error while processing your request.')).toBeInTheDocument();
  });

  it('renders with custom title and message', () => {
    const title = 'Custom Error Title';
    const message = 'Custom error message for testing';
    
    render(
      <ErrorState 
        title={title}
        message={message}
      />
    );
    
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });
  
  it('shows error details when showDetails is true', () => {
    const error = new Error('Test error message');
    
    render(
      <ErrorState 
        error={error}
        showDetails={true}
      />
    );
    
    expect(screen.getByText(error.message)).toBeInTheDocument();
  });
  
  it('calls retry function when button is clicked', () => {
    const retryFn = vi.fn();
    
    render(
      <ErrorState 
        retry={retryFn}
      />
    );
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);
    
    expect(retryFn).toHaveBeenCalledTimes(1);
  });
  
  it('renders children when provided', () => {
    render(
      <ErrorState>
        <div data-testid="child-element">Child Content</div>
      </ErrorState>
    );
    
    expect(screen.getByTestId('child-element')).toBeInTheDocument();
  });
  
  it('applies custom class names', () => {
    const customClass = 'custom-error-class';
    
    const { container } = render(
      <ErrorState 
        className={customClass}
      />
    );
    
    expect(container.querySelector(`.${customClass}`)).toBeInTheDocument();
  });
  
  it('uses different size classes', () => {
    const { rerender } = render(<ErrorState size="sm" />);
    expect(document.querySelector('.max-w-sm')).toBeInTheDocument();
    
    rerender(<ErrorState size="lg" />);
    expect(document.querySelector('.max-w-lg')).toBeInTheDocument();
  });
});
