
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EdgeFunctionError } from '@/components/errors/EdgeFunctionErrorHandler';

describe('EdgeFunctionErrorHandling', () => {
  it('renders basic error information', () => {
    const error = new Error('Test error message');
    Object.assign(error, { statusCode: 500, requestId: 'test-request-id' });
    
    render(
      <EdgeFunctionError error={error} />
    );
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });
  
  it('shows request ID when available', () => {
    const error = new Error('API Error');
    Object.assign(error, { requestId: 'abc-123-xyz', statusCode: 404 });
    
    render(
      <EdgeFunctionError error={error} showRequestId={true} />
    );
    
    expect(screen.getByText(/Request ID:/)).toBeInTheDocument();
    expect(screen.getByText(/abc-123-xyz/)).toBeInTheDocument();
  });
  
  it('displays error details when showDetails is true', () => {
    const error = new Error('Validation failed');
    Object.assign(error, {
      statusCode: 400,
      requestId: 'req-id',
      details: { 
        field: 'email',
        issue: 'invalid format'
      }
    });
    
    render(
      <EdgeFunctionError error={error} showDetails={true} showRequestId={true} />
    );
    
    expect(screen.getByText(/Error Details:/)).toBeInTheDocument();
    expect(screen.getByText(/"field": "email"/)).toBeInTheDocument();
    expect(screen.getByText(/"issue": "invalid format"/)).toBeInTheDocument();
  });
  
  it('calls retry function when button clicked', () => {
    const mockRetry = vi.fn();
    const error = new Error('Network error');
    
    render(
      <EdgeFunctionError error={error} retry={mockRetry} />
    );
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);
    
    expect(mockRetry).toHaveBeenCalled();
  });
});
