
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import RetryableErrorBoundary, { withRetryableErrorBoundary } from '@/components/errors/RetryableErrorBoundary';

// Mock components
const ThrowsError = ({ shouldThrow = true, message = "Test error" }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

// Mock for logSystemEvent
vi.mock('@/lib/system/logSystemEvent', () => ({
  logSystemEvent: vi.fn().mockResolvedValue({ success: true })
}));

describe('RetryableErrorBoundary', () => {
  // Suppress console errors during tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(
      <RetryableErrorBoundary>
        <div>Test content</div>
      </RetryableErrorBoundary>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error fallback when an error occurs', () => {
    render(
      <RetryableErrorBoundary>
        <ThrowsError />
      </RetryableErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('calls onError handler when an error occurs', () => {
    const mockOnError = vi.fn();
    
    render(
      <RetryableErrorBoundary onError={mockOnError}>
        <ThrowsError />
      </RetryableErrorBoundary>
    );
    
    expect(mockOnError).toHaveBeenCalled();
  });

  it('resets when retry button is clicked', () => {
    const { rerender } = render(
      <RetryableErrorBoundary>
        <ThrowsError shouldThrow={true} />
      </RetryableErrorBoundary>
    );
    
    // Find and click the retry button
    fireEvent.click(screen.getByText('Try Again'));
    
    // Re-render without the error
    rerender(
      <RetryableErrorBoundary>
        <ThrowsError shouldThrow={false} />
      </RetryableErrorBoundary>
    );
    
    // Verify component rendered correctly after reset
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('calls onReset handler when reset', () => {
    const mockOnReset = vi.fn();
    const { rerender } = render(
      <RetryableErrorBoundary onReset={mockOnReset}>
        <ThrowsError shouldThrow={true} />
      </RetryableErrorBoundary>
    );
    
    // Find and click the retry button
    fireEvent.click(screen.getByText('Try Again'));
    
    // Verify onReset was called
    expect(mockOnReset).toHaveBeenCalled();
    
    // Re-render without the error
    rerender(
      <RetryableErrorBoundary onReset={mockOnReset}>
        <ThrowsError shouldThrow={false} />
      </RetryableErrorBoundary>
    );
  });

  describe('withRetryableErrorBoundary HOC', () => {
    const TestComponent = ({ text }: { text: string }) => <div>{text}</div>;
    const WrappedComponent = withRetryableErrorBoundary(TestComponent);
    
    it('renders the wrapped component correctly', () => {
      render(<WrappedComponent text="Hello" />);
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
    
    it('catches errors in the wrapped component', () => {
      const ErrorComponent = () => { throw new Error('HOC test error'); };
      const WrappedErrorComponent = withRetryableErrorBoundary(ErrorComponent);
      
      render(<WrappedErrorComponent />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });
});
