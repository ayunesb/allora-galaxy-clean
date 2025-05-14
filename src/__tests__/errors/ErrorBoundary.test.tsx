import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, afterEach, expect } from 'vitest';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import { ErrorHandler } from '@/lib/errors/ErrorHandler';

// Create a component that throws an error
const ThrowsError = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock the logSystemEvent function
vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue({ success: true })
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock ErrorHandler
vi.mock('@/lib/errors/ErrorHandler', () => ({
  ErrorHandler: {
    handleError: vi.fn().mockResolvedValue({ message: 'Test error' })
  }
}));

describe('ErrorBoundary', () => {
  // Reset mocks after each test
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders fallback UI when an error occurs', () => {
    // We need to mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    render(
      <ErrorBoundary>
        <ThrowsError />
      </ErrorBoundary>
    );
    
    // Check that fallback UI is rendered
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  it('allows reset of error boundary', () => {
    // Mock console.error
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowsError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Verify error state
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Find and click the "Try Again" button
    fireEvent.click(screen.getByText('Try Again'));
    
    // Re-render with shouldThrow=false to simulate fixing the issue
    rerender(
      <ErrorBoundary>
        <ThrowsError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    // Verify the error boundary has reset and the component renders correctly
    expect(screen.getByText('No error')).toBeInTheDocument();
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  it('logs the error using ErrorHandler', () => {
    // Mock console.error
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    render(
      <ErrorBoundary>
        <ThrowsError />
      </ErrorBoundary>
    );
    
    // Verify ErrorHandler was called to log the error
    expect(ErrorHandler.handleError).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  it('renders custom fallback if provided', () => {
    // Mock console.error
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowsError />
      </ErrorBoundary>
    );
    
    // Check that custom fallback is rendered
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});
