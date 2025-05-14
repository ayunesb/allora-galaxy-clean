
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { EdgeFunctionErrorHandler, withEdgeFunctionErrorHandling } from '@/components/errors/withEdgeFunctionErrorHandling';
import EdgeFunctionError from '@/components/errors/EdgeFunctionErrorDisplay';

// Mock component for testing
const TestComponent = () => <div>Test Component Content</div>;

describe('Edge Function Error Handling', () => {
  it('renders children when no error occurs', () => {
    render(
      <EdgeFunctionErrorHandler isLoading={false} error={null}>
        <div>Test content</div>
      </EdgeFunctionErrorHandler>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders loading state when isLoading is true', () => {
    render(
      <EdgeFunctionErrorHandler isLoading={true} error={null}>
        <div>Test content</div>
      </EdgeFunctionErrorHandler>
    );
    
    // The loading skeleton should be rendered instead of content
    expect(screen.queryByText('Test content')).not.toBeInTheDocument();
    // Should find a skeleton element
    expect(document.querySelector('.skeleton')).toBeTruthy();
  });

  it('renders error state when error is provided', () => {
    const mockError = {
      message: 'Test edge function error',
      statusCode: 500,
      requestId: 'req_123'
    };
    
    render(
      <EdgeFunctionErrorHandler isLoading={false} error={mockError}>
        <div>Test content</div>
      </EdgeFunctionErrorHandler>
    );
    
    // Content should not be rendered
    expect(screen.queryByText('Test content')).not.toBeInTheDocument();
    // Error message should be displayed
    expect(screen.getByText('Test edge function error')).toBeInTheDocument();
    // Request ID should be displayed
    expect(screen.getByText(/req_123/)).toBeInTheDocument();
  });

  it('renders custom loading element when provided', () => {
    render(
      <EdgeFunctionErrorHandler 
        isLoading={true} 
        error={null}
        loadingElement={<div>Custom loading</div>}
      >
        <div>Test content</div>
      </EdgeFunctionErrorHandler>
    );
    
    expect(screen.getByText('Custom loading')).toBeInTheDocument();
  });

  describe('withEdgeFunctionErrorHandling HOC', () => {
    const WrappedComponent = withEdgeFunctionErrorHandling(TestComponent);
    
    it('renders the component when no error exists', () => {
      render(<WrappedComponent />);
      expect(screen.getByText('Test Component Content')).toBeInTheDocument();
    });
    
    it('renders error state when error is provided', () => {
      const mockError = {
        message: 'API Error',
        statusCode: 500,
        requestId: 'req_456'
      };
      
      render(<WrappedComponent error={mockError} />);
      expect(screen.getByText('API Error')).toBeInTheDocument();
      expect(screen.queryByText('Test Component Content')).not.toBeInTheDocument();
    });
    
    it('includes retry button when onRetry is provided', () => {
      const mockError = { message: 'API Error' };
      const mockRetry = vi.fn();
      
      render(<WrappedComponent error={mockError} onRetry={mockRetry} />);
      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();
      
      retryButton.click();
      expect(mockRetry).toHaveBeenCalled();
    });
  });
});
